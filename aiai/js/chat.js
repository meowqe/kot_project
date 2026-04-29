// chat.js — Продвинутый ИИ-ассистент Serendale
// Версия: 2.3 (Исправлены: состояния роуминга и статуса, IndexedDB, навигация)

// =============================================
// 1. УПРАВЛЕНИЕ UI ЧАТА (ChatUI)
// =============================================
class ChatUI {
    constructor() {
        this.chatModal = document.getElementById('chatModal');
        this.openChatBtn = document.getElementById('openChatBtn');
        this.closeChatBtn = document.getElementById('closeChatBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendMessageBtn = document.getElementById('sendMessageBtn');
        this.chatSuggestions = document.getElementById('chatSuggestions');
        this.typingIndicator = null;
        this.isProcessing = false;

        this.initEventListeners();
        this.injectStyles();
    }

    initEventListeners() {
        // Добавляем ссылку на админ-панель в навигацию "Поддержка"
        this._addAdminLink();

        this.openChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.chatModal.classList.add('active');
            setTimeout(() => this.chatInput.focus(), 300);
        });

        this.closeChatBtn.addEventListener('click', () => this.chatModal.classList.remove('active'));

        this.chatModal.addEventListener('click', (e) => {
            if (e.target === this.chatModal) this.chatModal.classList.remove('active');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.chatModal.classList.contains('active')) {
                this.chatModal.classList.remove('active');
            }
        });

        this.sendMessageBtn.addEventListener('click', () => this._onSendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._onSendMessage();
            }
        });

        // Делегирование событий для динамических кнопок в чате
        this.chatMessages.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (target) {
                const action = target.dataset.action;
                const value = target.dataset.value || target.textContent.trim();
                if (action === 'send') {
                    this._onSendMessage(value);
                } else if (action === 'link' && target.dataset.href) {
                    window.open(target.dataset.href, '_blank');
                }
            }
        });

        this.chatSuggestions.addEventListener('click', (e) => {
            const target = e.target.closest('.suggestion-chip');
            if (target) {
                const text = target.textContent.trim();
                this._onSendMessage(text);
            }
        });
    }

    _addAdminLink() {
        // Ищем ссылку "Поддержка" в навигации
        const navLinks = document.querySelectorAll('.nav a');
        navLinks.forEach(link => {
            if (link.textContent.trim() === 'Поддержка') {
                link.href = 'admin.html';
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                console.log('✅ Ссылка на админ-панель добавлена в навигацию');
            }
        });
    }

    _onSendMessage(predefinedText = null) {
        if (this.isProcessing) return;
        const text = predefinedText || this.chatInput.value.trim();
        if (!text) return;

        this.clearInput();
        if (window.dialogManager) {
            this.isProcessing = true;
            try {
                window.dialogManager.handleUserMessage(text);
            } catch (e) {
                console.error('Ошибка в DialogManager:', e);
                this.addMessage('😔 Произошла небольшая ошибка. Давайте попробуем еще раз.', false);
            } finally {
                setTimeout(() => { this.isProcessing = false; }, 500);
            }
        }
    }

    setInputPlaceholder(text) {
        this.chatInput.placeholder = text;
    }

    focusInput() {
        this.chatInput.focus();
    }

    clearInput() {
        this.chatInput.value = '';
    }

    addMessage(textOrElement, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');

        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar');
        avatar.innerHTML = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-headset"></i>';

        const content = document.createElement('div');
        content.classList.add('message-content');

        if (typeof textOrElement === 'string') {
            content.innerHTML = `<div style="font-size: 14px; line-height: 1.6;">${textOrElement.replace(/\n/g, '<br>')}</div>`;
        } else if (textOrElement instanceof HTMLElement) {
            content.style.background = 'transparent';
            content.style.border = 'none';
            content.style.padding = '0';
            content.style.maxWidth = '100%';
            content.style.width = '100%';
            content.appendChild(textOrElement);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        return messageDiv;
    }

    showTypingIndicator() {
        if (this.typingIndicator) return;
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
        this.typingIndicator.innerHTML = `
            <div class="message-avatar"><i class="fa-solid fa-headset"></i></div>
            <div class="message-content" style="padding: 12px 20px; min-width: 60px;">
                <p style="display: flex; gap: 4px; font-size: 24px; line-height: 1; margin: 0;">
                    <span class="typing-dot">.</span>
                    <span class="typing-dot" style="animation-delay: 0.2s;">.</span>
                    <span class="typing-dot" style="animation-delay: 0.4s;">.</span>
                </p>
            </div>
        `;
        this.chatMessages.appendChild(this.typingIndicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.remove();
            this.typingIndicator = null;
        }
    }

    setSuggestions(buttons) {
        this.chatSuggestions.innerHTML = '';
        if (buttons && buttons.length > 0) {
            this.chatSuggestions.innerHTML = buttons.map(btn => {
                const safeLabel = btn.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                return `<button class="suggestion-chip">${btn}</button>`;
            }).join('');
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    injectStyles() {
        if (document.getElementById('sr-dynamic-styles')) return;
        const style = document.createElement('style');
        style.id = 'sr-dynamic-styles';
        style.textContent = `
            .typing-dot { animation: blink 1.4s ease-in-out infinite; color: rgba(255, 255, 255, 0.6); }
            @keyframes blink { 0%, 80%, 100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
            .sr-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 16px; margin: 8px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
            .sr-card-header { font-family: 'Clash Grotesk', sans-serif; font-size: 18px; font-weight: 600; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
            .sr-card-price { background: linear-gradient(135deg, #5c6df3, #ff3bff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; font-size: 20px; }
            .sr-feature-list { list-style: none; padding: 0; margin: 0 0 12px 0; }
            .sr-feature-list li { padding: 4px 0; font-size: 13px; color: rgba(255, 255, 255, 0.7); display: flex; align-items: center; gap: 8px; }
            .sr-feature-list li i { color: #4ade80; width: 16px; text-align: center; }
            .sr-btn { display: block; width: 100%; padding: 10px; border-radius: 10px; background: linear-gradient(135deg, #5c6df3, #ff3bff); border: none; color: #fff; font-family: 'Space Grotesk', sans-serif; font-weight: 500; cursor: pointer; text-align: center; transition: all 0.2s; }
            .sr-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(252, 79, 246, 0.3); }
            .sr-progress-bar { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin: 8px 0; overflow: hidden; }
            .sr-progress-fill { height: 100%; background: linear-gradient(135deg, #5c6df3, #ff3bff); border-radius: 3px; transition: width 0.3s ease; }
            .sr-grid-menu { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 10px 0; }
            .sr-grid-item { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 15px 10px; text-align: center; cursor: pointer; transition: all 0.2s; }
            .sr-grid-item:hover { background: rgba(255,255,255,0.1); border-color: rgba(252,79,246,0.5); }
            .sr-grid-item i { font-size: 24px; margin-bottom: 8px; background: linear-gradient(135deg, #5c6df3, #ff3bff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .sr-grid-item p { font-family: 'Space Grotesk', sans-serif; font-size: 13px; margin: 0; }
            .sr-comparison-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
            .sr-comparison-table td, .sr-comparison-table th { padding: 8px 6px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .form-error { color: #fca5a5; background: rgba(239, 68, 68, 0.2); padding: 8px 12px; border-radius: 8px; margin-top: 8px; font-size: 13px; }
        `;
        document.head.appendChild(style);
    }
}

// =============================================
// 2. МОДУЛЬ БАЗЫ ЗНАНИЙ
// =============================================
const knowledgeBase = {
    tariffs: [
        { id: 'lite', name: 'Лайт', price: 399, gb: 15, minutes: 400, sms: 100, features: ['Безлимит на соцсети', 'eSIM бесплатно'], support: 'Стандартная', icon: 'fa-feather', color: '#60a5fa' },
        { id: 'optima', name: 'Оптима', price: 599, gb: 30, minutes: 800, sms: 300, features: ['YouTube/VK/Музыка безлимит', 'Кешбэк 5%'], support: 'Приоритетная', icon: 'fa-bolt', color: '#fbbf24' },
        { id: 'max', name: 'Максимум', price: 899, gb: Infinity, minutes: Infinity, sms: Infinity, features: ['Безлимит на всё', '5G', 'Приоритетная поддержка 24/7'], support: 'VIP', icon: 'fa-rocket', color: '#f472b6' },
        { id: 'family', name: 'Семейный', price: 1299, gb: 100, minutes: 2000, sms: 500, features: ['До 4 сим-карт', 'Общий интернет', 'Родительский контроль'], support: 'Семейная', icon: 'fa-people-group', color: '#a78bfa' },
        { id: 'business', name: 'Бизнес', price: 1999, gb: 'Безлимит', minutes: 'Безлимит', sms: 'Безлимит', features: ['До 10 сим-карт', 'Выделенный менеджер', 'Корпоративная сеть'], support: 'Бизнес 24/7', icon: 'fa-briefcase', color: '#34d399' }
    ],
    coverageMock: {
        'москва': { '5G': '12 районов', '4G+': '99.8%', 'Метро': '4G на всех станциях', 'Скорость': '150-500 Мбит/с' },
        'спб': { '5G': '8 районов', '4G+': '99.5%', 'Метро': '4G на всех станциях', 'Скорость': '100-450 Мбит/с' },
        'default': { '4G': '95% территории', '3G': '98% территории', 'Скорость': 'до 100 Мбит/с' }
    },
    mnpInfo: {
        description: `🔄 <b>Перенос номера к Serendale (MNP)</b>\n\n📋 <b>Кратко о процессе:</b>\n• Вы сохраняете свой текущий номер\n• Получаете временную сим-карту Serendale\n• Через 3-7 рабочих дней номер переносится\n\n🎁 <b>Бонус:</b> скидка 20% на первый месяц!\n\n📄 <b>Что нужно:</b>\n• Паспорт РФ\n• Номер должен быть оформлен на вас\n• Отсутствие задолженности у текущего оператора`,
        supportedOperators: ['МТС', 'Билайн', 'Мегафон', 'Tele2', 'Yota', 'Тинькофф Мобайл']
    },
    roamingCountries: {
        'турция': { price: 299, internet: '1 ГБ/день', calls: '30 мин/день входящие', messengers: 'Безлимитно', info: 'Стамбул, Анталия, Алания — отличное покрытие 4G!' },
        'египет': { price: 299, internet: '1 ГБ/день', calls: '30 мин/день входящие', messengers: 'Безлимитно', info: 'Хургада, Шарм-эль-Шейх — стабильный 4G.' },
        'германия': { price: 299, internet: '1 ГБ/день', calls: '30 мин/день входящие', messengers: 'Безлимитно', info: 'Берлин, Мюнхен, Франкфурт — 5G в центре городов.' },
        'испания': { price: 299, internet: '1 ГБ/день', calls: '30 мин/день входящие', messengers: 'Безлимитно', info: 'Барселона, Мадрид — полное покрытие 4G+.' },
        'франция': { price: 299, internet: '1 ГБ/день', calls: '30 мин/день входящие', messengers: 'Безлимитно', info: 'Париж, Ницца — отличный 4G/LTE.' },
        'таиланд': { price: 399, internet: '2 ГБ/день', calls: '30 мин/день входящие', messengers: 'Безлимитно', info: 'Пхукет, Паттайя, Бангкок — 4G по всей стране.' },
        'оаэ': { price: 399, internet: '2 ГБ/день', calls: '30 мин/день входящие', messengers: 'Безлимитно', info: 'Дубай, Абу-Даби — сеть 5G в центре.' },
        'сша': { price: 499, internet: '1 ГБ/день', calls: '30 мин/день входящие', messengers: 'Безлимитно', info: 'Нью-Йорк, Лос-Анджелес, Майами — 4G/5G.' },
        'италия': { price: 299, internet: '1 ГБ/день', calls: '30 мин/день входящие', messengers: 'Безлимитно', info: 'Рим, Милан, Венеция — 4G+.' }
    }
};

function getTariffById(id) {
    return knowledgeBase.tariffs.find(t => t.id === id) || null;
}

function getTariffByName(name) {
    const lower = name.toLowerCase().trim();
    const cleanName = lower.replace('тариф', '').trim();
    return knowledgeBase.tariffs.find(t => 
        t.name.toLowerCase().includes(cleanName) || 
        t.id.toLowerCase().includes(cleanName)
    );
}

function generateTariffCard(tariff) {
    const gbText = tariff.gb === Infinity ? 'Безлимит' : `${tariff.gb} ГБ`;
    const minText = tariff.minutes === Infinity ? 'Безлимит' : `${tariff.minutes} мин`;
    const smsText = tariff.sms === Infinity ? 'Безлимит' : `${tariff.sms} SMS`;
    const featuresHtml = tariff.features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('');
    
    return `
        <div class="sr-card" style="border-left: 3px solid ${tariff.color || '#5c6df3'}">
            <div class="sr-card-header">
                <span><i class="fa-solid ${tariff.icon}"></i> ${tariff.name}</span>
                <span class="sr-card-price">${tariff.price} ₽/мес</span>
            </div>
            <ul class="sr-feature-list">
                <li><i class="fa-solid fa-wifi"></i> Интернет: ${gbText}</li>
                <li><i class="fa-solid fa-phone"></i> Звонки: ${minText}</li>
                <li><i class="fa-solid fa-comment"></i> SMS: ${smsText}</li>
                ${featuresHtml}
            </ul>
            <button class="sr-btn" data-action="send" data-value="Оформить тариф ${tariff.name}">
                Подключить за ${tariff.price}₽ <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    `;
}

// =============================================
// 3. МОДУЛЬ NLU
// =============================================
class NLU {
    constructor() {
        this.intents = {
            greeting: ['привет', 'здравствуй', 'добрый день', 'добрый вечер', 'доброе утро', 'хай', 'хелло', 'hi', 'hello', 'приветствую', 'ку', 'дарова', 'салют', 'здарова', 'начать'],
            show_tariffs: ['тариф', 'тарифы', 'какие тарифы', 'сколько стоит', 'цены', 'прайс', 'подобрать тариф', 'посмотреть тарифы', 'предложения', 'пакеты', 'услуги связи', 'что почем', 'покажи тарифы', 'список тариф'],
            compare_tariffs: ['сравни', 'сравнение', 'что лучше', 'что выгоднее', 'отличия', 'разница', 'лайт против', 'сравнить'],
            order_esim: ['оформить esim', 'esim', 'есим', 'е-сим', 'цифровая сим', 'виртуальная симка', 'как получить есим', 'хочу цифровую сим', 'мне нужна есим карта', 'оформлю есим', 'подключить встроенную симку', 'электронная сим', 'заказать esim', 'e-sim', 'eSIM', 'оформи esim'],
            order_physical_sim: ['физическая сим', 'заказать симку', 'доставка сим', 'курьер', 'сим-карта', 'симка', 'обычная сим', 'пластиковая сим', 'получить сим', 'забрать сим', 'доставка'],
            transfer_number_info: ['как перенести номер', 'как перейти со своим номером', 'расскажи про mnp', 'что такое mnp', 'сохранить номер', 'перенос номера', 'mnp', 'перейти к вам со своим', 'как перевести номер'],
            transfer_number_start: ['хочу перенести номер', 'перенести номер', 'хочу перейти', 'оформить перенос', 'начать перенос', 'перенести от', 'уйти от', 'забрать номер', 'mnp от'],
            check_coverage: ['покрытие', 'где ловит', 'есть ли связь', 'качество связи', 'зона покрытия', '5g в моем городе', 'ловит ли', 'сигнал', 'карта покрытия', 'проверить покрытие'],
            roaming_info: ['роуминг', 'за границей', 'поездка', 'путешествие', 'зарубеж', 'как звонить из', 'за границу', 'роуминг в', 'буду в', 'еду в', 'полечу в', 'поеду в'],
            roaming_general: ['что такое роуминг', 'как работает роуминг', 'как подключить роуминг'],
            troubleshoot: ['не ловит', 'нет сети', 'проблемы со связью', 'не работает', 'сбои', 'авария', 'сим не видит', 'пропал интернет', 'настроить apn', 'нет сигнала'],
            check_balance: ['баланс', 'остаток', 'сколько денег', 'проверить счет', 'пополнить', 'платеж', 'списание'],
            document_info: ['документы', 'паспорт', 'данные', 'что нужно', 'оформление', 'регистрация', 'анкета', 'снилс', 'какие документы'],
            faq_5g: ['5g', 'пятое поколение', 'скорость 5g', 'как подключить 5g', 'поддержка 5g', '5 джи'],
            check_application_status: ['статус заявки', 'узнать статус', 'мой заказ', 'где моя заявка', 'проверить статус', 'как дела с заявкой', 'status', 'заявка', 'мои заявки'],
            another_question: ['другой вопрос', 'ещё вопрос', 'другое', 'новый вопрос', 'следующий вопрос', 'задать другой'],
            main_menu: ['меню', 'главное меню', 'в начало', 'что ты умеешь', 'помощь', 'help', 'на главную']
        };
    }

    getIntent(userMessage) {
        const msg = userMessage.toLowerCase().trim();
        
        // 1. Точные кнопки подсказок (приоритет)
        if (msg === 'другой вопрос' || msg === 'ещё вопрос' || msg === 'другое' || msg === 'задать другой вопрос') {
            return { intent: 'main_menu' };
        }
        if (msg === 'узнать статус заявки' || msg === 'проверить статус заявки' || msg === 'статус заявки') {
            return { intent: 'check_application_status' };
        }

        // 2. Запросы на оформление конкретных тарифов
        const orderTariffMatch = msg.match(/оформить\s+(тариф\s+)?(лайт|оптима|оптиму|максимум|семейный|семью|бизнес|lite|optima|max|family|business)/i);
        if (orderTariffMatch) {
            const rawName = orderTariffMatch[2];
            const tariff = getTariffByName(rawName);
            if (tariff) return { intent: 'order_specific_tariff', tariff_name: tariff.name };
        }

        // 3. Запросы на MNP (информация vs начало)
        if (this._matchAny(msg, ['как перенести', 'расскажи про mnp', 'что такое mnp', 'как сохранить номер', 'информация о переносе', 'процесс переноса'])) {
            return { intent: 'transfer_number_info' };
        }
        if (this._matchAny(msg, ['хочу перенести', 'перенести номер', 'начать перенос', 'оформить перенос', 'перенести от', 'уйти от', 'забрать номер'])) {
            return { intent: 'transfer_number_start' };
        }

        // 4. Роуминг с указанием страны
        const countryFound = this._extractCountry(msg);
        if (countryFound && this._matchAny(msg, ['роуминг', 'за границ', 'поездк', 'путешеств', 'зарубеж', 'буду в', 'еду в', 'полечу в', 'поеду в'])) {
            return { intent: 'roaming_country', country: countryFound };
        }
        if (this._matchAny(msg, ['буду в', 'еду в', 'полечу в', 'поеду в', 'в турци', 'в египт', 'в германи', 'в испани', 'в итали', 'в сша', 'в оаэ', 'в таиланд'])) {
            const country2 = this._extractCountry(msg) || this._guessCountry(msg);
            if (country2) {
                return { intent: 'roaming_country', country: country2 };
            }
            return { intent: 'roaming_info' };
        }

        // 5. Общие запросы на оформление
        if (this._matchAny(msg, ['оформи', 'заказать', 'хочу', 'подключить'])) {
            if (this._matchAny(msg, ['esim', 'есим', 'е-сим', 'цифровую', 'встроенную', 'электронную'])) return { intent: 'order_esim' };
            if (this._matchAny(msg, ['сим-карт', 'симку', 'физическую', 'доставк', 'курьер', 'обычную', 'пластиковую'])) return { intent: 'order_physical_sim' };
            if (this._matchAny(msg, ['тариф', 'лайт', 'оптим', 'максимум', 'семейн', 'бизнес', 'безлимит'])) {
                const tariff = getTariffByName(msg);
                if (tariff) return { intent: 'order_specific_tariff', tariff_name: tariff.name };
                return { intent: 'show_tariffs_for_order' };
            }
        }

        // 6. Точные совпадения с интентами
        for (const [intent, phrases] of Object.entries(this.intents)) {
            for (const phrase of phrases) {
                if (msg.includes(phrase)) return { intent };
            }
        }

        // 7. Вопросы о тарифах
        if (this._matchAny(msg, ['что входит', 'что включает', 'расскажи про тариф', 'подробнее о тарифе'])) {
            const tariff = getTariffByName(msg);
            if (tariff) return { intent: 'tariff_detail', tariff_name: tariff.name };
            return { intent: 'tariff_detail' };
        }

        // 8. Проверка на подтверждение
        if (msg.match(/^(да|нет|ага|конечно|верно|правильно|подтверждаю|yes|no|неа|неверно|да, всё верно|нет, заполнить заново)$/i)) {
            return { intent: 'confirmation', value: msg.toLowerCase() };
        }

        return { intent: 'fallback' };
    }

    extractEntities(msg) {
        const entities = {};
        const lowerMsg = msg.toLowerCase();

        const tariff = getTariffByName(lowerMsg);
        if (tariff) entities.tariff_name = tariff.name;

        if (lowerMsg.includes('до 500') || lowerMsg.includes('недорогой') || lowerMsg.includes('дешевый') || lowerMsg.includes('бюджетный')) {
            entities.budget = 'low';
        } else if (lowerMsg.includes('премиум') || lowerMsg.includes('дорогой') || lowerMsg.includes('полный фарш') || lowerMsg.includes('максимальный')) {
            entities.budget = 'high';
        }

        const country = this._extractCountry(lowerMsg);
        if (country) entities.country = country;

        const operators = { 'мтс': 'МТС', 'билайн': 'Билайн', 'мегафон': 'Мегафон', 'теле2': 'Tele2', 'yota': 'Yota', 'тинкофф': 'Тинькофф Мобайл' };
        for (const [key, name] of Object.entries(operators)) {
            if (lowerMsg.includes(key)) { entities.operator_name = name; break; }
        }

        if (lowerMsg.includes('iphone') || lowerMsg.includes('айфон')) entities.phone_model = 'iPhone';
        else if (lowerMsg.includes('samsung') || lowerMsg.includes('галакси') || lowerMsg.includes('galaxy')) entities.phone_model = 'Samsung Galaxy';
        else if (lowerMsg.includes('pixel')) entities.phone_model = 'Google Pixel';

        if (lowerMsg.includes('москв')) entities.city = 'Москва';
        else if (lowerMsg.includes('петербург') || lowerMsg.includes('спб') || lowerMsg.includes('питер')) entities.city = 'СПб';

        return entities;
    }

    _extractCountry(msg) {
        const countries = {
            'турци': 'Турция', 'турция': 'Турция',
            'египет': 'Египет', 'египт': 'Египет',
            'германи': 'Германия', 'германия': 'Германия',
            'испани': 'Испания', 'испания': 'Испания',
            'франци': 'Франция', 'франция': 'Франция',
            'таиланд': 'Таиланд', 'тай': 'Таиланд',
            'оаэ': 'ОАЭ', 'эмират': 'ОАЭ', 'дубай': 'ОАЭ',
            'сша': 'США', 'америк': 'США',
            'итали': 'Италия', 'италия': 'Италия'
        };
        for (const [key, name] of Object.entries(countries)) {
            if (msg.includes(key)) return name;
        }
        return null;
    }

    _guessCountry(msg) {
        if (msg.includes('турци') || msg.includes('турция')) return 'Турция';
        if (msg.includes('египет') || msg.includes('египт')) return 'Египет';
        if (msg.includes('германи') || msg.includes('германия')) return 'Германия';
        if (msg.includes('испани') || msg.includes('испания')) return 'Испания';
        if (msg.includes('франци') || msg.includes('франция')) return 'Франция';
        if (msg.includes('таиланд') || msg.includes('тай')) return 'Таиланд';
        if (msg.includes('оаэ') || msg.includes('эмират') || msg.includes('дубай')) return 'ОАЭ';
        if (msg.includes('сша') || msg.includes('америк')) return 'США';
        if (msg.includes('итали') || msg.includes('италия')) return 'Италия';
        return null;
    }

    _matchAny(msg, keywords) {
        return keywords.some(kw => msg.includes(kw));
    }
}

// =============================================
// 4. ДИАЛОГ-МЕНЕДЖЕР (DialogManager)
// =============================================
class DialogManager {
    constructor(ui) {
        this.ui = ui;
        this.nlu = new NLU();
        this.state = 'IDLE';
        this.context = {
            history: [],
            entities: {},
            orderData: {
                serviceType: null,
                tariffName: '',
                fullName: '',
                phone: '',
                email: '',
                address: '',
                mnpNumber: '',
                comment: ''
            },
            orderStep: 0,
            totalSteps: 0,
            lastBotAction: null,
            currentCountry: null
        };
    }

    handleUserMessage(text) {
        this.ui.addMessage(text, true);
        
        this.context.history.push({ role: 'user', content: text });
        if (this.context.history.length > 20) this.context.history.shift();

        const entities = this.nlu.extractEntities(text);
        Object.assign(this.context.entities, entities);

        // Команды сброса
        if (text.toLowerCase().trim() === 'назад' || text.toLowerCase().trim() === 'вернуться') {
            this._sendWithDelay(() => {
                this._resetToIdle();
                this._showMainMenu('Главное меню. Чем могу помочь?');
            });
            return;
        }

        // *** ВАЖНО: Сначала проверяем специальные состояния, потом AWAITING_ для заявок ***
        
        // Состояние ожидания страны для роуминга
        if (this.state === 'AWAITING_ROAMING_COUNTRY') {
            const country = this.nlu._guessCountry(text) || text.trim();
            this._sendWithDelay(() => {
                this.state = 'IDLE';
                this._showRoamingCountry(country);
            });
            return;
        }

        // Состояние ожидания ID для статуса заявки
        if (this.state === 'AWAITING_STATUS_ID') {
            this._checkApplicationStatus(text);
            return;
        }

        // Состояние подтверждения заявки
        if (this.state === 'CONFIRMATION') {
            this._handleConfirmation(text);
            return;
        }

        // Состояния оформления заявки (шаги)
        if (this.state.startsWith('AWAITING_')) {
            this._processStep(text);
            return;
        }

        // Основной режим IDLE
        this._processIntent(text);
    }

    _processIntent(text) {
        const intentResult = this.nlu.getIntent(text);
        const { intent, tariff_name, value, country } = intentResult;
        
        if (tariff_name) this.context.orderData.tariffName = tariff_name;
        if (country) this.context.currentCountry = country;
        this.context.lastBotAction = intent;

        this._sendWithDelay(() => {
            switch (intent) {
                case 'greeting':
                    this._showMainMenu('👋 Добро пожаловать в Serendale! Чем могу помочь?');
                    break;
                case 'main_menu':
                    this._showMainMenu('Главное меню. Что вас интересует?');
                    break;
                case 'check_application_status':
                    this._handleAppStatus();
                    break;
                case 'show_tariffs':
                case 'show_tariffs_for_order':
                    this._showAllTariffs();
                    break;
                case 'tariff_detail':
                    this._showTariffDetail();
                    break;
                case 'order_specific_tariff':
                    this._startOrder('tariff', this.context.orderData.tariffName);
                    break;
                case 'compare_tariffs':
                    this._showComparison();
                    break;
                case 'order_esim':
                    this._startOrder('esim');
                    break;
                case 'order_physical_sim':
                    this._startOrder('physical_sim');
                    break;
                case 'transfer_number_info':
                    this._showMNPInfo();
                    break;
                case 'transfer_number_start':
                    this._startOrder('mnp');
                    break;
                case 'check_coverage':
                    this._handleCoverage();
                    break;
                case 'roaming_country':
                    this._showRoamingCountry(this.context.currentCountry || country);
                    this.state = 'IDLE';
                    break;
                case 'roaming_info':
                case 'roaming_general':
                    this._handleRoamingGeneral();
                    break;
                case 'troubleshoot':
                    this._handleTroubleshoot();
                    break;
                case 'check_balance':
                    this._sendText('💳 <b>Проверка баланса</b>\n\n• USSD: *100#\n• В приложении Serendale\n• Спросить у меня\n\nХотите узнать остаток пакетов?');
                    break;
                case 'document_info':
                    this._sendText('📄 <b>Документы для оформления</b>\n\nДля граждан РФ нужен только паспорт. Данные передаются по защищённому каналу (TLS 1.3) и хранятся по ФЗ-152.\n\nГотовы начать оформление? Напишите «оформить тариф»!');
                    this.ui.setSuggestions(['Оформить eSIM', 'Оформить тариф', 'Как перенести номер?', 'Какие тарифы у вас есть?']);
                    break;
                case 'faq_5g':
                    this._sendText('🚀 <b>Технология 5G от Serendale</b>\n\n• Доступна в 45+ городах РФ\n• Скорость до 1 Гбит/с\n• Включена в тариф «Максимум»\n• Нужен 5G-совместимый телефон\n\n<i>Проверьте покрытие в вашем городе — напишите название!</i>');
                    break;
                case 'confirmation':
                    this._handleConfirmation(value || text);
                    break;
                case 'fallback':
                default:
                    this._handleFallback();
                    break;
            }
        });
    }

    _startOrder(serviceType, tariffName = null) {
        this.state = 'ORDERING';
        this.context.orderData = {
            serviceType: serviceType,
            tariffName: tariffName || this.context.orderData.tariffName || '',
            fullName: '',
            phone: '',
            email: '',
            address: '',
            mnpNumber: '',
            comment: ''
        };
        this.context.orderStep = 0;

        switch (serviceType) {
            case 'physical_sim': this.context.totalSteps = 4; break;
            case 'mnp': this.context.totalSteps = 5; break;
            default: this.context.totalSteps = 3; break;
        }

        if (serviceType === 'tariff' && !this.context.orderData.tariffName) {
            this._sendText('📋 <b>Выберите тариф для подключения:</b>');
            this._showAllTariffs();
            return;
        }

        const serviceNames = {
            'tariff': `тарифа «${this.context.orderData.tariffName}»`,
            'esim': 'eSIM',
            'physical_sim': 'физической сим-карты',
            'mnp': 'переноса номера'
        };

        this._sendText(`✅ <b>Начинаем оформление ${serviceNames[serviceType]}!</b>\n\nДавайте заполним данные по шагам. В любой момент можно написать <b>«назад»</b> для возврата в меню.`);
        setTimeout(() => this._nextStep(), 500);
    }

    _nextStep() {
        const steps = this._getSteps();
        if (steps.length === 0) return;

        if (this.context.orderStep >= steps.length) {
            this._confirmOrder();
            return;
        }

        const step = steps[this.context.orderStep];
        const progressPercent = Math.round((this.context.orderStep / steps.length) * 100);
        const progressHTML = `
            <div style="margin-bottom: 10px;">
                <span style="font-size: 12px; color: rgba(255,255,255,0.5);">Шаг ${this.context.orderStep + 1} из ${steps.length}</span>
                <div class="sr-progress-bar"><div class="sr-progress-fill" style="width: ${progressPercent}%"></div></div>
            </div>
        `;

        this.ui.addMessage(`${progressHTML}<p>${step.message}</p>`, false);
        this.ui.setInputPlaceholder(step.placeholder);
        
        const buttons = [];
        if (step.optional) buttons.push('Пропустить');
        buttons.push('Назад');
        this.ui.setSuggestions(buttons);

        this.state = `AWAITING_${step.field.toUpperCase()}`;
    }

    _getSteps() {
        const isPhysical = this.context.orderData.serviceType === 'physical_sim';
        const isMNP = this.context.orderData.serviceType === 'mnp';
        
        const steps = [
            {
                field: 'fullName',
                message: '📝 <b>Введите Ваши ФИО полностью</b> (например: Иванов Иван Иванович).',
                placeholder: 'Ваше ФИО...',
                validate: (v) => v.split(' ').filter(w => w.length > 1).length >= 2 ? null : 'Пожалуйста, введите минимум имя и фамилию'
            },
            {
                field: 'phone',
                message: '📞 <b>Укажите номер телефона</b> для связи.',
                placeholder: '+7 (999) 123-45-67',
                validate: (v) => v.replace(/\D/g, '').length >= 10 ? null : 'Номер должен содержать минимум 10 цифр'
            },
            {
                field: 'email',
                message: '📧 <b>Ваш Email</b> — на него отправим договор и QR-код.',
                placeholder: 'example@mail.ru',
                validate: (v) => v.includes('@') && v.includes('.') ? null : 'Введите корректный email'
            }
        ];

        if (isPhysical) {
            steps.push({
                field: 'address',
                message: '🏠 <b>Адрес доставки</b> (город, улица, дом, квартира).',
                placeholder: 'Ваш адрес...',
                optional: true
            });
        }

        if (isMNP) {
            steps.push({
                field: 'mnpNumber',
                message: '🔄 <b>Номер телефона, который хотите перенести</b> к нам.',
                placeholder: 'Номер для переноса...',
                validate: (v) => v.replace(/\D/g, '').length >= 10 ? null : 'Введите корректный номер для переноса'
            });
        }

        return steps;
    }

    _processStep(text) {
        const steps = this._getSteps();
        if (this.context.orderStep >= steps.length) return;

        if (text === 'Пропустить') {
            const step = steps[this.context.orderStep];
            if (step.optional) {
                this.context.orderData[step.field] = '—';
                this.context.orderStep++;
                this._nextStep();
                return;
            }
        }

        if (text === 'Назад') {
            if (this.context.orderStep === 0) {
                this._resetToIdle();
                this._showMainMenu('Оформление отменено. Вы в главном меню.');
                return;
            }
            this.context.orderStep--;
            this._nextStep();
            return;
        }

        const step = steps[this.context.orderStep];
        let value = text.trim();
        let error = null;

        if (step.field === 'phone') {
            let digits = value.replace(/\D/g, '');
            if (digits.startsWith('8')) digits = '7' + digits.substring(1);
            if (digits.startsWith('7') && digits.length === 11) digits = digits.substring(1);
            if (digits.length > 10) digits = digits.substring(0, 10);
            
            if (digits.length >= 10) {
                value = `+7 (${digits.substring(0,3)}) ${digits.substring(3,6)}-${digits.substring(6,8)}-${digits.substring(8,10)}`;
            }
        }

        if (step.validate) {
            error = step.validate(value);
        }

        if (error) {
            this.ui.addMessage(`⚠️ ${error}`, false);
            this.ui.setSuggestions(['Назад']);
            return;
        }

        this.context.orderData[step.field] = value;
        this.context.orderStep++;
        this._nextStep();
    }

    _confirmOrder() {
        const d = this.context.orderData;
        const serviceNames = { 'tariff': 'Подключение тарифа', 'esim': 'Оформление eSIM', 'physical_sim': 'Заказ сим-карты', 'mnp': 'Перенос номера' };
        
        let summary = `📋 <b>Проверьте данные перед отправкой:</b>\n\n`;
        summary += `<b>Услуга:</b> ${serviceNames[d.serviceType] || d.serviceType}\n`;
        if (d.tariffName) summary += `<b>Тариф:</b> ${d.tariffName}\n`;
        summary += `<b>ФИО:</b> ${d.fullName}\n`;
        summary += `<b>Телефон:</b> ${d.phone}\n`;
        summary += `<b>Email:</b> ${d.email}\n`;
        if (d.address && d.address !== '—') summary += `<b>Адрес:</b> ${d.address}\n`;
        if (d.mnpNumber && d.mnpNumber !== '—') summary += `<b>Номер для переноса:</b> ${d.mnpNumber}\n\n`;
        else summary += `\n`;
        summary += `Всё верно?`;

        this.ui.addMessage(summary, false);
        this.ui.setSuggestions(['Да, всё верно', 'Нет, заполнить заново']);
        this.state = 'CONFIRMATION';
    }

    _handleConfirmation(text) {
        const isPositive = text.match(/^(да|ага|конечно|верно|правильно|подтверждаю|yes|да, всё верно)$/i);
        const isNegative = text.match(/^(нет|неа|неверно|нет, заполнить заново|неправильно)$/i);

        if (isPositive) {
            this._submitOrder();
        } else if (isNegative) {
            this._resetToIdle();
            this._showMainMenu('Давайте начнём заново. Чем могу помочь?');
        } else {
            this._sendText('Пожалуйста, ответьте «Да» или «Нет».');
            this.ui.setSuggestions(['Да, всё верно', 'Нет, заполнить заново']);
        }
    }

    _submitOrder() {
        const d = this.context.orderData;
        const application = {
            id: 'APP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
            serviceType: d.serviceType || 'tariff',
            tariffName: d.tariffName || '',
            fullName: d.fullName || 'Не указано',
            phone: d.phone || '',
            email: d.email || '',
            address: d.address || '',
            mnpNumber: d.mnpNumber || '',
            comment: d.comment || '',
            status: 'new',
            createdAt: new Date().toISOString(),
            sessionId: getSessionId()
        };

        console.log('📤 Отправка заявки в IndexedDB:', application);

        API_Bridge.saveApplication(application).then(() => {
            const successMsg = `✅ <b>Заявка №${application.id} успешно создана!</b>\n\n` +
                `Наш менеджер свяжется с вами в ближайшее время.\n` +
                `Статус заявки можно уточнить в этом чате.\n\n` +
                `Спасибо, что выбираете Serendale! 💜`;
            this.ui.addMessage(successMsg, false);
            this._resetToIdle();
            this.ui.setSuggestions(['Узнать статус заявки', 'Другой вопрос', 'Какие тарифы у вас есть?']);
        }).catch((error) => {
            console.error('Ошибка отправки заявки:', error);
            this.ui.addMessage('❌ Произошла ошибка при отправке. Пожалуйста, попробуйте снова.', false);
            this._resetToIdle();
        });
    }

    _resetToIdle() {
        this.state = 'IDLE';
        this.context.orderData = {
            serviceType: null,
            tariffName: '',
            fullName: '',
            phone: '',
            email: '',
            address: '',
            mnpNumber: '',
            comment: ''
        };
        this.context.orderStep = 0;
        this.context.totalSteps = 0;
        this.ui.setInputPlaceholder('Введите сообщение...');
        this.ui.focusInput();
    }

    // ============ Специальные обработчики ============
    
    _handleAppStatus() {
        this.ui.addMessage('📋 <b>Проверка статуса заявки</b>\n\nНапишите номер заявки (формат APP-...) или ваши ФИО/номер телефона, и я найду информацию.', false);
        this.ui.setInputPlaceholder('APP-... или ФИО/телефон');
        this.state = 'AWAITING_STATUS_ID';
    }

    async _checkApplicationStatus(searchTerm) {
        this.ui.setInputPlaceholder('Введите сообщение...');
        this.ui.focusInput();
        
        try {
            const db = await API_Bridge.openDB();
            const tx = db.transaction(['applications'], 'readonly');
            const store = tx.objectStore('applications');
            const allApps = await new Promise((resolve, reject) => {
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result);
                req.onerror = reject;
            });

            if (allApps.length === 0) {
                this._sendText('📭 У вас пока нет оформленных заявок.\n\nХотите оформить? Напишите «оформить тариф»! 😊');
                this.ui.setSuggestions(['Оформить тариф', 'Какие тарифы у вас есть?']);
                this.state = 'IDLE';
                return;
            }

            const term = searchTerm.toLowerCase().trim();
            const found = allApps.filter(app => 
                app.id.toLowerCase().includes(term) ||
                (app.fullName && app.fullName.toLowerCase().includes(term)) ||
                (app.phone && app.phone.includes(term))
            );

            if (found.length === 0) {
                this._sendText(`🔍 Не нашёл заявок по запросу «${searchTerm}».\n\nПроверьте номер заявки или данные и попробуйте снова.`);
                this.ui.setSuggestions(['Узнать статус заявки', 'Другой вопрос']);
                this.state = 'IDLE';
                return;
            }

            const statusNames = { 'new': '🟢 Новая', 'process': '🟡 В обработке', 'done': '🟢 Выполнена' };
            
            found.slice(0, 3).forEach(app => {
                const date = new Date(app.createdAt).toLocaleString('ru-RU');
                const status = statusNames[app.status] || app.status;
                const msg = `📋 <b>Заявка №${app.id}</b>\n` +
                    `Статус: ${status}\n` +
                    `Услуга: ${app.tariffName || app.serviceType || 'Не указана'}\n` +
                    `Дата: ${date}\n` +
                    (app.fullName ? `ФИО: ${app.fullName}\n` : '') +
                    (app.phone ? `Телефон: ${app.phone}\n` : '');
                this.ui.addMessage(msg, false);
            });

            if (found.length > 3) {
                this._sendText(`...и ещё ${found.length - 3} заявок. Уточните запрос для точного поиска.`);
            }

            this.ui.setSuggestions(['Узнать статус заявки', 'Другой вопрос', 'Оформить тариф']);
            this.state = 'IDLE';
        } catch (error) {
            console.error('Ошибка проверки статуса:', error);
            this._sendText('❌ Произошла ошибка при проверке. Попробуйте позже.');
            this.state = 'IDLE';
        }
    }

    _showMNPInfo() {
        this.ui.addMessage(knowledgeBase.mnpInfo.description, false);
        
        const menu = document.createElement('div');
        menu.innerHTML = `
            <div style="margin-top: 10px;">
                <p style="margin-bottom: 8px;">Готовы начать перенос?</p>
                <button class="sr-btn" data-action="send" data-value="Хочу перенести номер">
                    🔄 Да, начать перенос номера <i class="fa-solid fa-arrow-right"></i>
                </button>
                <p style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 8px; text-align: center;">
                    Поддерживаемые операторы: ${knowledgeBase.mnpInfo.supportedOperators.join(', ')}
                </p>
            </div>
        `;
        this.ui.addMessage(menu, false);
        this.ui.setSuggestions(['Хочу перенести номер', 'Нужны документы для оформления', 'Какие тарифы у вас есть?']);
    }

    _handleRoamingGeneral() {
        this.ui.addMessage('🌍 <b>Роуминг от Serendale</b>\n\n' +
            'Мы работаем в 100+ странах! Вот популярные направления:\n' +
            '• Турция, Египет, Европа: <b>299 ₽/день</b>\n' +
            '• Таиланд, ОАЭ: <b>399 ₽/день</b>\n' +
            '• США, Канада: <b>499 ₽/день</b>\n\n' +
            '📱 Включено: безлимитные мессенджеры, 1 ГБ интернета, 30 мин входящих.\n\n' +
            'В какую страну планируете поездку? Просто напишите!', false);
        this.ui.setInputPlaceholder('Страна...');
        this.state = 'AWAITING_ROAMING_COUNTRY';
    }

    _showRoamingCountry(countryName) {
        const data = knowledgeBase.roamingCountries[countryName.toLowerCase()];
        
        if (data) {
            this._sendText(`🌍 <b>Роуминг в ${countryName}</b>\n\n` +
                `📱 Мессенджеры: ${data.messengers}\n` +
                `🌐 Интернет: ${data.internet}\n` +
                `📞 Входящие: ${data.calls}\n` +
                `💰 Стоимость: ${data.price} ₽/день\n\n` +
                `<i>💡 ${data.info}</i>\n\n` +
                `Роуминг подключается автоматически при выезде за границу. Хорошего путешествия! ✈️`);
        } else {
            this._sendText(`🌍 <b>Роуминг в ${countryName}</b>\n\n` +
                `📱 Мессенджеры: безлимитно\n` +
                `🌐 Интернет: 1 ГБ/день\n` +
                `📞 Входящие: 30 мин/день\n` +
                `💰 Стоимость: от 299 ₽/день\n\n` +
                `<i>Точную стоимость уточните у оператора. Роуминг подключится автоматически.</i>`);
        }
        
        this.ui.setSuggestions(['Какие тарифы у вас есть?', 'Оформить eSIM', 'Ещё страна']);
        this.state = 'IDLE';
        this.ui.focusInput();
    }

    _handleCoverage() {
        const city = this.context.entities.city || '';
        if (city) {
            const data = knowledgeBase.coverageMock[city.toLowerCase()] || knowledgeBase.coverageMock['default'];
            let resp = `🗺️ <b>Покрытие в г. ${city}</b>\n\n`;
            for (const [tech, status] of Object.entries(data)) {
                resp += `• <b>${tech}:</b> ${status}\n`;
            }
            this._sendText(resp);
        } else {
            this._sendText('🗺️ <b>Проверка покрытия</b>\n\nВ каком городе/регионе вас интересует покрытие? Напишите название 👇');
            this.ui.setInputPlaceholder('Ваш город...');
        }
        this.ui.setSuggestions(['Москва', 'СПб', 'Какие тарифы у вас есть?']);
        this.state = 'IDLE';
    }

    _handleTroubleshoot() {
        this._sendText('📡 <b>Проблемы со связью?</b>\n\n' +
            '1. Включите/выключите режим полёта ✈️\n' +
            '2. Перезагрузите телефон 🔄\n' +
            '3. Проверьте APN: <b>internet.serendale.ru</b>\n\n' +
            'Если не помогло, напишите модель телефона — поможем.');
    }

    _handleFallback() {
        this.ui.addMessage('🤔 <b>Я не совсем понял ваш вопрос.</b> Возможно, вас интересует:', false);
        this.ui.setSuggestions([
            'Какие тарифы у вас есть?',
            'Оформить eSIM',
            'Как перенести номер?',
            'Роуминг',
            'Другой вопрос'
        ]);
        this.state = 'IDLE';
    }

    // ============ UI Helpers ============
    _sendText(text) {
        this.ui.addMessage(text, false);
        if (this.state === 'IDLE') {
            this.ui.setSuggestions(['Какие тарифы у вас есть?', 'Оформить eSIM', 'Как перенести номер?', 'Другой вопрос']);
        }
    }

    _sendWithDelay(callback) {
        this.ui.showTypingIndicator();
        const delay = 700 + Math.random() * 1000;
        setTimeout(() => {
            this.ui.removeTypingIndicator();
            callback();
        }, delay);
    }

    _showMainMenu(message) {
        this.state = 'IDLE';
        const menu = document.createElement('div');
        menu.innerHTML = `
            <p style="margin-bottom: 12px;">${message}</p>
            <div class="sr-grid-menu">
                <div class="sr-grid-item" data-action="send" data-value="Какие тарифы у вас есть?">
                    <i class="fa-solid fa-tag"></i><p>Тарифы</p>
                </div>
                <div class="sr-grid-item" data-action="send" data-value="Оформить eSIM">
                    <i class="fa-solid fa-sim-card"></i><p>eSIM</p>
                </div>
                <div class="sr-grid-item" data-action="send" data-value="Как перенести номер?">
                    <i class="fa-solid fa-rotate"></i><p>MNP</p>
                </div>
                <div class="sr-grid-item" data-action="send" data-value="Роуминг">
                    <i class="fa-solid fa-earth-americas"></i><p>Роуминг</p>
                </div>
            </div>
        `;
        this.ui.addMessage(menu, false);
        this.ui.setSuggestions(['Какие тарифы у вас есть?', 'Оформить eSIM', 'Как перенести номер?', 'Роуминг', 'Другой вопрос']);
        this.ui.focusInput();
    }

    _showAllTariffs() {
        this.ui.addMessage('📱 <b>Наши лучшие тарифы:</b>', false);
        knowledgeBase.tariffs.forEach(t => {
            const container = document.createElement('div');
            container.innerHTML = generateTariffCard(t);
            this.ui.addMessage(container.firstElementChild, false);
        });
        if (this.state === 'IDLE') {
            this.ui.setSuggestions(['Оформить Лайт', 'Оформить Максимум', 'Сравнить тарифы', 'Нужны документы для оформления']);
        }
    }

    _showTariffDetail() {
        const name = this.context.entities.tariff_name || this.context.orderData.tariffName;
        const tariff = getTariffByName(name) || knowledgeBase.tariffs[2];
        this.ui.addMessage(`<b>Тариф «${tariff.name}»</b>`, false);
        const container = document.createElement('div');
        container.innerHTML = generateTariffCard(tariff);
        this.ui.addMessage(container.firstElementChild, false);
    }

    _showComparison() {
        const html = `
            <div class="sr-card">
                <b>⚖️ Сравнение популярных тарифов</b>
                <table class="sr-comparison-table" style="width:100%; margin-top:10px;">
                    <tr><th></th><th>Лайт</th><th>Оптима</th><th>Максимум</th></tr>
                    <tr><td>Цена</td><td>399₽</td><td>599₽</td><td>899₽</td></tr>
                    <tr><td>Интернет</td><td>15 ГБ</td><td>30 ГБ</td><td>Безлимит</td></tr>
                    <tr><td>Звонки</td><td>400 мин</td><td>800 мин</td><td>Безлимит</td></tr>
                    <tr><td>Кешбэк</td><td>—</td><td>5%</td><td>—</td></tr>
                    <tr><td>5G</td><td>—</td><td>—</td><td>✅</td></tr>
                </table>
                <p style="font-size:12px; color:rgba(255,255,255,0.5); margin-top:8px;">Напишите «оформить [название]» для подключения!</p>
            </div>
        `;
        this.ui.addMessage(html, false);
    }
}

// =============================================
// 5. API-МОСТ (Работа с IndexedDB)
// =============================================
class API_Bridge {
    static DB_NAME = 'SerendaleTelecomDB';
    static DB_VERSION = 5;

    static openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('🔄 Обновление структуры IndexedDB...');
                
                if (!db.objectStoreNames.contains('chatMessages')) {
                    const store = db.createObjectStore('chatMessages', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('sessionId', 'sessionId', { unique: false });
                    console.log('✅ Хранилище chatMessages создано');
                }
                
                if (!db.objectStoreNames.contains('applications')) {
                    const appStore = db.createObjectStore('applications', { keyPath: 'id' });
                    appStore.createIndex('status', 'status', { unique: false });
                    appStore.createIndex('createdAt', 'createdAt', { unique: false });
                    appStore.createIndex('phone', 'phone', { unique: false });
                    appStore.createIndex('fullName', 'fullName', { unique: false });
                    console.log('✅ Хранилище applications создано');
                }
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                console.log('✅ IndexedDB открыта успешно, хранилища:', 
                    Array.from(db.objectStoreNames).join(', '));
                resolve(db);
            };
            
            request.onerror = (event) => {
                console.error('❌ Ошибка открытия IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    static async saveApplication(application) {
        try {
            console.log('💾 Сохраняем заявку:', application.id);
            const db = await this.openDB();
            
            // Проверяем, что хранилище существует
            if (!db.objectStoreNames.contains('applications')) {
                console.error('❌ Хранилище applications не найдено!');
                db.close();
                // Пробуем пересоздать с новой версией
                this.DB_VERSION++;
                const newDb = await this.openDB();
                return this._performSave(newDb, application);
            }
            
            return this._performSave(db, application);
        } catch (error) {
            console.error('❌ Ошибка в saveApplication:', error);
            throw error;
        }
    }
    
    static _performSave(db, application) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(['applications'], 'readwrite');
                const store = tx.objectStore('applications');
                const request = store.add(application);
                
                request.onsuccess = () => {
                    console.log('✅ Заявка успешно сохранена в IndexedDB:', application.id);
                    
                    // Уведомление для админ-панели через BroadcastChannel
                    try {
                        const channel = new BroadcastChannel('serendale_admin');
                        channel.postMessage({ 
                            type: 'new_application', 
                            application: application 
                        });
                        console.log('📡 Уведомление отправлено в админ-панель');
                        channel.close();
                    } catch (e) {
                        console.log('⚠️ BroadcastChannel не поддерживается, используем localStorage');
                        localStorage.setItem('serendale_new_app', JSON.stringify(application));
                        setTimeout(() => localStorage.removeItem('serendale_new_app'), 100);
                    }
                    
                    db.close();
                    resolve();
                };
                
                request.onerror = (event) => {
                    console.error('❌ Ошибка при сохранении заявки:', event.target.error);
                    db.close();
                    reject(event.target.error);
                };
            } catch (error) {
                console.error('❌ Ошибка транзакции:', error);
                db.close();
                reject(error);
            }
        });
    }
}

// =============================================
// 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =============================================
function getSessionId() {
    let id = sessionStorage.getItem('chatSessionId');
    if (!id) {
        id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('chatSessionId', id);
    }
    return id;
}

// =============================================
// 7. ИНИЦИАЛИЗАЦИЯ
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Инициализация Serendale AI Assistant v2.3...');
        
        const ui = new ChatUI();
        const dialogManager = new DialogManager(ui);
        window.dialogManager = dialogManager;
        
        // Предварительно открываем БД
        await API_Bridge.openDB();
        
        console.log('🤖 Serendale AI Assistant v2.3 готов к работе');
        console.log('📋 Исправлено: состояния роуминга и статуса, IndexedDB, навигация');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
    }
});