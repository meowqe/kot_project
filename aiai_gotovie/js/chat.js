// chat.js — ИИ-ассистент Serendale v3.7 (Конкретные тарифы + всё остальное)

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
        document.querySelectorAll('.nav a').forEach(link => {
            if (link.textContent.trim() === 'Поддержка') {
                link.href = './admin.html';
                link.setAttribute('target', '_blank');
            }
        });

        if (this.openChatBtn) {
            this.openChatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.chatModal) {
                    this.chatModal.classList.add('active');
                    setTimeout(() => { if (this.chatInput) this.chatInput.focus(); }, 300);
                }
            });
        }

        if (this.closeChatBtn) {
            this.closeChatBtn.addEventListener('click', () => {
                if (this.chatModal) this.chatModal.classList.remove('active');
            });
        }

        if (this.chatModal) {
            this.chatModal.addEventListener('click', (e) => {
                if (e.target === this.chatModal) this.chatModal.classList.remove('active');
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.chatModal && this.chatModal.classList.contains('active')) {
                this.chatModal.classList.remove('active');
            }
        });

        if (this.sendMessageBtn) {
            this.sendMessageBtn.addEventListener('click', () => this._onSendMessage());
        }

        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this._onSendMessage();
                }
            });
        }

        if (this.chatMessages) {
            this.chatMessages.addEventListener('click', (e) => {
                const target = e.target.closest('[data-action="send"]');
                if (target && target.dataset.value) {
                    this._onSendMessage(target.dataset.value);
                }
            });
        }

        if (this.chatSuggestions) {
            this.chatSuggestions.addEventListener('click', (e) => {
                const target = e.target.closest('.suggestion-chip');
                if (target) this._onSendMessage(target.textContent.trim());
            });
        }
    }

    _onSendMessage(predefinedText = null) {
        if (this.isProcessing) return;
        const text = predefinedText || (this.chatInput ? this.chatInput.value.trim() : '');
        if (!text) return;
        if (this.chatInput) this.chatInput.value = '';
        if (window.dialogManager) {
            this.isProcessing = true;
            try {
                window.dialogManager.handleUserMessage(text);
            } catch (e) {
                console.error('DialogManager error:', e);
                this.addMessage('😔 Произошла ошибка. Попробуйте ещё раз.', false);
            } finally {
                setTimeout(() => { this.isProcessing = false; }, 500);
            }
        }
    }

    setInputPlaceholder(text) {
        if (this.chatInput) this.chatInput.placeholder = text;
    }

    focusInput() {
        if (this.chatInput) this.chatInput.focus();
    }

    addMessage(textOrElement, isUser = false) {
        if (!this.chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');

        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar');
        avatar.innerHTML = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-headset"></i>';

        const content = document.createElement('div');
        content.classList.add('message-content');

        if (typeof textOrElement === 'string') {
            content.innerHTML = `<div style="font-size:14px;line-height:1.6;">${textOrElement.replace(/\n/g, '<br>')}</div>`;
        } else if (textOrElement instanceof HTMLElement) {
            content.style.cssText = 'background:transparent;border:none;padding:0;max-width:100%;width:100%;';
            content.appendChild(textOrElement);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        if (!this.chatMessages || this.typingIndicator) return;
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
        this.typingIndicator.innerHTML = `
            <div class="message-avatar"><i class="fa-solid fa-headset"></i></div>
            <div class="message-content" style="padding:12px 20px;min-width:60px;">
                <p style="display:flex;gap:4px;font-size:24px;line-height:1;margin:0;">
                    <span class="typing-dot">.</span>
                    <span class="typing-dot" style="animation-delay:0.2s;">.</span>
                    <span class="typing-dot" style="animation-delay:0.4s;">.</span>
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
        if (!this.chatSuggestions) return;
        this.chatSuggestions.innerHTML = '';
        if (buttons && buttons.length > 0) {
            this.chatSuggestions.innerHTML = buttons.map(btn => 
                `<button class="suggestion-chip">${btn}</button>`
            ).join('');
        }
    }

    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    injectStyles() {
        if (document.getElementById('sr-styles')) return;
        const style = document.createElement('style');
        style.id = 'sr-styles';
        style.textContent = `
            .typing-dot{animation:blink 1.4s infinite;color:rgba(255,255,255,.6)}
            @keyframes blink{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}
            .sr-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:16px;margin:8px 0}
            .sr-card h4{font-family:'Clash Grotesk',sans-serif;font-size:18px;margin:0 0 8px;color:#fff}
            .sr-card .price{font-size:22px;font-weight:700;background:linear-gradient(135deg,#5c6df3,#ff3bff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
            .sr-card ul{list-style:none;padding:0;margin:8px 0}
            .sr-card ul li{padding:4px 0;font-size:13px;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:8px}
            .sr-card ul li i{color:#4ade80;width:16px;text-align:center}
            .sr-btn{display:block;width:100%;padding:12px;border-radius:12px;background:linear-gradient(135deg,#5c6df3,#ff3bff);border:none;color:#fff;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:500;cursor:pointer;text-align:center;transition:all .2s;margin-top:8px}
            .sr-btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(252,79,246,.3)}
            .sr-progress{width:100%;height:6px;background:rgba(255,255,255,.1);border-radius:3px;margin:8px 0;overflow:hidden}
            .sr-progress-fill{height:100%;background:linear-gradient(135deg,#5c6df3,#ff3bff);border-radius:3px}
            .sr-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:10px 0}
            .sr-grid-item{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:15px;text-align:center;cursor:pointer;transition:all .2s}
            .sr-grid-item:hover{background:rgba(255,255,255,.1);border-color:rgba(252,79,246,.5)}
            .sr-grid-item i{font-size:24px;margin-bottom:8px;background:linear-gradient(135deg,#5c6df3,#ff3bff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
            .sr-grid-item p{font-family:'Space Grotesk',sans-serif;font-size:13px;margin:0}
            .sr-chips{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
            .sr-chip{padding:10px 18px;border-radius:24px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;cursor:pointer;font-size:14px}
            .sr-chip:hover{background:rgba(255,255,255,.15)}
            .sr-info-block{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;margin:8px 0}
            .sr-info-block h4{font-size:15px;margin:0 0 8px;color:#fff}
            .sr-info-block p,.sr-info-block li{font-size:13px;color:rgba(255,255,255,.75);line-height:1.5}
        `;
        document.head.appendChild(style);
    }
}

// =============================================
// 2. БАЗА ЗНАНИЙ
// =============================================
const knowledgeBase = {
    tariffs: [
        { id: 'lite', name: 'Лайт', price: 399, gb: 15, minutes: 400, sms: 100, features: ['Безлимит на соцсети', 'eSIM бесплатно'], icon: 'fa-feather', color: '#60a5fa' },
        { id: 'optima', name: 'Оптима', price: 599, gb: 30, minutes: 800, sms: 300, features: ['Безлимит на YouTube/VK/Музыку', 'Кешбэк 5%'], icon: 'fa-bolt', color: '#fbbf24' },
        { id: 'max', name: 'Максимум', price: 899, gb: Infinity, minutes: Infinity, sms: Infinity, features: ['Безлимит на всё', '5G', 'Приоритетная поддержка 24/7'], icon: 'fa-rocket', color: '#f472b6' },
        { id: 'family', name: 'Семейный', price: 1299, gb: 100, minutes: 2000, sms: 500, features: ['До 4 сим-карт', 'Общий интернет', 'Родительский контроль'], icon: 'fa-people-group', color: '#a78bfa' },
        { id: 'business', name: 'Бизнес', price: 1999, gb: 'Безлимит', minutes: 'Безлимит', sms: 'Безлимит', features: ['До 10 сим-карт', 'Выделенный менеджер', 'Корпоративная сеть'], icon: 'fa-briefcase', color: '#34d399' }
    ],
    esimInfo: [
        { title: 'Что такое eSIM?', text: 'eSIM — это встроенный цифровой чип в вашем смартфоне. Никакого пластика — всё через интернет.' },
        { title: 'Преимущества', items: ['Активация за 5 минут', 'До 5 номеров одновременно', 'Удобно для путешествий', 'Не потеряется', 'Экологично'] },
        { title: 'Поддерживаемые телефоны', text: 'iPhone XS и новее, Samsung S20+, Google Pixel 3+, Huawei P40+, Xiaomi 11+' },
        { title: 'Как оформить', text: '1. Выберите тариф\n2. Заполните данные\n3. Получите QR-код на email\n4. Отсканируйте → готово!' }
    ],
    mnpInfo: [
        { title: 'Как работает', text: 'Сохраняете номер, переходите к нам. Процесс: 3-7 дней.' },
        { title: 'Что нужно', items: ['Паспорт РФ', 'Номер оформлен на вас', 'Нет долгов у оператора'] },
        { title: 'Бонус', text: 'Скидка 20% на первый месяц!' },
        { title: 'Операторы', text: 'МТС, Билайн, Мегафон, Tele2, Yota, Тинькофф' }
    ],
    roamingCountries: {
        'турция': { price: 299, info: 'Стамбул, Анталия — 4G' },
        'египет': { price: 299, info: 'Хургада, Шарм — 4G' },
        'германия': { price: 299, info: 'Берлин, Мюнхен — 5G' },
        'испания': { price: 299, info: 'Барселона, Мадрид — 4G+' },
        'франция': { price: 299, info: 'Париж, Ницца — 4G' },
        'таиланд': { price: 399, info: 'Пхукет, Паттайя — 4G' },
        'оаэ': { price: 399, info: 'Дубай — 5G' },
        'сша': { price: 499, info: 'Нью-Йорк, Майами — 5G' },
        'италия': { price: 299, info: 'Рим, Милан — 4G+' },
        'великобритания': { price: 349, info: 'Лондон, Манчестер — 5G' },
        'китай': { price: 399, info: 'Пекин, Шанхай — 4G+' },
        'япония': { price: 399, info: 'Токио, Осака — 5G' },
        'греция': { price: 299, info: 'Афины, Крит — 4G' },
        'чехия': { price: 299, info: 'Прага, Брно — 4G+' },
        'польша': { price: 299, info: 'Варшава, Краков — 4G+' },
        'вьетнам': { price: 349, info: 'Ханой, Хошимин — 4G' },
        'канада': { price: 449, info: 'Торонто, Ванкувер — 5G' },
        'австралия': { price: 449, info: 'Сидней, Мельбурн — 4G+' },
        'бразилия': { price: 399, info: 'Рио, Сан-Паулу — 4G' },
        'мексика': { price: 349, info: 'Мехико, Канкун — 4G' },
        'индия': { price: 299, info: 'Дели, Мумбаи — 4G' },
        'португалия': { price: 299, info: 'Лиссабон, Порту — 4G+' },
        'нидерланды': { price: 299, info: 'Амстердам, Роттердам — 5G' },
        'швеция': { price: 349, info: 'Стокгольм, Гётеборг — 5G' },
        'норвегия': { price: 349, info: 'Осло, Берген — 5G' }
    },
    countryGroups: {
        '🌍 Европа': ['Германия', 'Испания', 'Франция', 'Италия', 'Великобритания', 'Греция', 'Чехия', 'Польша', 'Португалия', 'Нидерланды', 'Швеция', 'Норвегия'],
        '🌏 Азия': ['Турция', 'Таиланд', 'Китай', 'Япония', 'Вьетнам', 'Индия', 'ОАЭ'],
        '🌎 Америка': ['США', 'Канада', 'Мексика', 'Бразилия'],
        '🌏 Океания': ['Австралия'],
        '🌍 Африка': ['Египет']
    }
};

function getTariffByName(name) {
    const clean = name.toLowerCase()
        .replace('тариф', '')
        .replace('подключить', '')
        .replace('оформить', '')
        .trim();
    
    // Сначала точный поиск
    let tariff = knowledgeBase.tariffs.find(t => 
        t.name.toLowerCase() === clean || 
        t.id === clean
    );
    if (tariff) return tariff;
    
    // Затем поиск по вхождению
    tariff = knowledgeBase.tariffs.find(t => 
        t.name.toLowerCase().includes(clean) || 
        clean.includes(t.name.toLowerCase())
    );
    if (tariff) return tariff;
    
    // Поиск по синонимам
    const aliases = {
        'лайт': 'lite',
        'light': 'lite',
        'оптима': 'optima',
        'оптимум': 'optima',
        'optimal': 'optima',
        'макс': 'max',
        'максимум': 'max',
        'максимальный': 'max',
        'maximum': 'max',
        'семейный': 'family',
        'семья': 'family',
        'family': 'family',
        'бизнес': 'business',
        'корпоративный': 'business',
        'business': 'business'
    };
    
    for (const [alias, id] of Object.entries(aliases)) {
        if (clean.includes(alias)) {
            return knowledgeBase.tariffs.find(t => t.id === id) || null;
        }
    }
    
    return null;
}

function generateTariffCard(tariff) {
    const gb = tariff.gb === Infinity ? 'Безлимит' : `${tariff.gb} ГБ`;
    const min = tariff.minutes === Infinity ? 'Безлимит' : `${tariff.minutes} мин`;
    const sms = tariff.sms === Infinity ? 'Безлимит' : `${tariff.sms} SMS`;
    const feats = tariff.features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('');
    return `<div class="sr-card" style="border-left:3px solid ${tariff.color}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <h4 style="margin:0"><i class="fa-solid ${tariff.icon}"></i> ${tariff.name}</h4>
            <span class="price">${tariff.price} ₽/мес</span>
        </div>
        <ul><li><i class="fa-solid fa-wifi"></i> Интернет: ${gb}</li><li><i class="fa-solid fa-phone"></i> Звонки: ${min}</li><li><i class="fa-solid fa-comment"></i> SMS: ${sms}</li>${feats}</ul>
        <button class="sr-btn" data-action="send" data-value="Оформить тариф ${tariff.name}">Подключить за ${tariff.price}₽</button>
    </div>`;
}

// =============================================
// 3. СУПЕР-УМНЫЙ NLU
// =============================================
class NLU {
    getIntent(msg) {
        msg = msg.toLowerCase().trim();
        
        // ===== ГЛАВНОЕ МЕНЮ / НАЧАЛО =====
        if (this._match(msg, ['главное меню','меню','начать','главная','в начало','на главную','старт','начало','начнём','начнем','сначала','перезапуск','рестарт','заново','меню бота','бот меню','основное меню','покажи меню','открой меню','вернись в меню','вернуться в меню','выйти в меню','перейти в меню','home','menu start','что ты умеешь','что ты можешь','твои функции','твои возможности','список команд','команды','помощь','help','помоги','помогите','справка','что делать','возможности','функции'])) {
            return { intent: 'main_menu' };
        }
        
        // ===== ТАРИФЫ — ВСЕ =====
        if (this._match(msg, ['какие тарифы у вас есть?','какие тарифы у вас есть','тарифы','список тарифов','покажи тарифы','все тарифы','какие есть тарифы','ваши тарифы','подобрать тариф','выбрать тариф','хочу выбрать тариф','помоги выбрать тариф','покажите тарифы','расскажи про тарифы','что по тарифам','какие тарифные планы','тарифные планы','прайс','цены','стоимость','расценки','почём','почем','прайс-лист','сколько стоят','какая цена','цена','подключение','подключиться','стать абонентом'])) {
            return { intent: 'show_tariffs' };
        }
        
        // ===== КОНКРЕТНЫЙ ТАРИФ (сначала проверяем точное название) =====
        const tariffFromMsg = getTariffByName(msg);
        if (tariffFromMsg && this._has(msg, ['тариф','лайт','оптима','максимум','макс','семейный','бизнес','корпоративный','light','optima','family','business'])) {
            // Проверяем: это запрос информации или оформление?
            if (this._has(msg, ['оформи','подключить','заказать','хочу','давай','давайте'])) {
                return { intent: 'order_tariff', tariff: tariffFromMsg.name };
            }
            // Иначе — просто показать информацию
            return { intent: 'show_single_tariff', tariff: tariffFromMsg.name };
        }
        
        // ===== eSIM =====
        if (this._match(msg, ['что такое esim?','расскажи про esim','esim','есим','е-сим','что такое e-sim','расскажи про e-sim','расскажи про есим','информация о esim','о esim','про esim','объясни про esim','как работает esim','хочу esim','нужен esim','оформи esim','оформить esim','esim карта','электронная сим','электронная симка','цифровая сим','виртуальная сим','встроенная сим','заказать esim','подключить esim','активировать esim','выпустить esim','хочу есим','нужна есим','оформи есим','оформить есим','закажи есим'])) {
            return { intent: 'order_esim' };
        }
        
        // ===== ПЕРЕНОС НОМЕРА (MNP) — ИНФОРМАЦИЯ =====
        if (this._match(msg, ['как перенести номер?','перенос номера','mnp','как сохранить номер','перейти со своим номером','переход с сохранением номера','сохранить номер при переходе','переход от другого оператора','портирование номера','как перейти с сохранением номера','расскажи про mnp','расскажи про перенос','информация о переносе','что такое mnp','что такое перенос номера','объясни про перенос'])) {
            return { intent: 'mnp_info' };
        }
        
        // ===== ХОЧУ ПЕРЕНЕСТИ НОМЕР (запуск формы) =====
        if (this._match(msg, ['хочу перенести номер','перенести номер','перенести мой номер','запустить перенос','начать перенос','оформить перенос','сделать перенос','давайте перенесём','давайте перенесем','перенеси мне номер','оформи mnp','сделай перенос','перенесите номер','помогите перенести номер','хочу сохранить номер','сохранить номер'])) {
            return { intent: 'order_mnp' };
        }
        
        // ===== РОУМИНГ — ОБЩАЯ ИНФОРМАЦИЯ =====
        if (this._match(msg, ['роуминг','за границей','в другой стране','международный роуминг','роуминг за границей','интернет за границей','связь за рубежом','поездка за границу','путешествие связь','роуминг услуги','как работает роуминг','расскажи про роуминг','интернет в роуминге','звонки за границей','за границу','еду за границу','поездка','путешествие','какие страны роуминг','список стран роуминг'])) {
            return { intent: 'roaming_general' };
        }
        
        // ===== КАКИЕ СТРАНЫ ДОСТУПНЫ / СПИСОК СТРАН =====
        if (this._match(msg, ['в каких странах доступен роуминг','в каких странах доступен роуминг?','какие страны доступны для роуминга','где доступен роуминг','какие страны','в каких странах','список стран для роуминга','какие страны поддерживают роуминг','какие страны есть для роуминга','доступные страны для роуминга','роуминг список стран','роуминг какие страны','страны роуминга','какие страны работают','в каких странах работает','где работает роуминг'])) {
            return { intent: 'roaming_countries_list' };
        }
        
        // ===== ЕЩЁ СТРАНЫ / ВСЕ СТРАНЫ =====
        if (this._match(msg, ['ещё страны','еще страны','другие страны','все страны','показать все страны','весь список стран','какие страны доступны','полный список стран','другие направления','все направления','какие есть страны','список стран','доступные страны','куда можно поехать'])) {
            return { intent: 'more_countries' };
        }
        
        // ===== ДОКУМЕНТЫ =====
        if (this._match(msg, ['нужны документы для оформления?','нужны документы для оформления','нужны ли документы для оформления','какие документы нужны','документы для оформления','что нужно для оформления','какие нужны документы','паспорт нужен','нужен паспорт','требуются документы','необходимые документы','документы','что за документы','какие документы','список документов'])) {
            return { intent: 'documents' };
        }
        
        // ===== ОТПРАВИТЬ ДОКУМЕНТЫ =====
        if (this._match(msg, ['отправить документы','отправка документов','загрузить документы','прислать документы','отправить паспорт','загрузить паспорт','хочу отправить документы','как отправить документы','куда отправить документы','отправить фото паспорта','отправить скан паспорта','прислать паспорт','загрузить фото паспорта','скинуть документы','отправить данные паспорта'])) {
            return { intent: 'send_documents' };
        }
        
        // ===== СТАТУС ЗАЯВКИ =====
        if (this._match(msg, ['статус заявки','узнать статус заявки','моя заявка','где моя заявка','проверить заявку','мои заявки','история заявок','проверить статус','как там моя заявка','узнать статус','проверить','где заявка','статус','заявка','заявки','история'])) {
            return { intent: 'status' };
        }
        
        // ===== БАЛАНС =====
        if (this._match(msg, ['баланс','проверить баланс','сколько денег','мой баланс','остаток','проверка баланса','узнать баланс','как проверить баланс','где посмотреть баланс','счет','счёт','деньги','средства','пополнить','платеж','оплата','оплатить'])) {
            return { intent: 'balance' };
        }
        
        // ===== ПОКРЫТИЕ =====
        if (this._match(msg, ['покрытие','зона покрытия','где работает','качество связи','есть ли связь','зона обслуживания','карта покрытия','где есть связь','работает ли у нас','покрытие сети','связь','ловит','ловить'])) {
            return { intent: 'coverage' };
        }
        
        // ===== УСЛУГИ =====
        if (this._match(msg, ['услуги','какие услуги','список услуг','что предоставляете','ваши услуги','сервисы','доп услуги','дополнительные услуги','что можно подключить','сервис','функции'])) {
            return { intent: 'services' };
        }
        
        // ===== КОНТАКТЫ =====
        if (this._match(msg, ['контакты','как связаться','позвонить','написать','офис','адрес','телефон поддержки','горячая линия','поддержка','саппорт','support','связаться','обратиться','почта','email','почтовый адрес'])) {
            return { intent: 'contacts' };
        }
        
        // ===== 5G / СКОРОСТЬ =====
        if (this._match(msg, ['5g','скорость','быстродействие','какая скорость','скорость интернета','пинг','latency','быстрый интернет','скорость 4g','скорость 5g','мегабиты'])) {
            return { intent: 'speed' };
        }
        
        // ===== ПРИЛОЖЕНИЕ =====
        if (this._match(msg, ['приложение','мобильное приложение','скачать','установить','апп','app','приложуха','программа','клиент','мобильный клиент','android','ios'])) {
            return { intent: 'app' };
        }
        
        // ===== ЖАЛОБА =====
        if (this._match(msg, ['жалоба','пожаловаться','проблема','не работает','плохая связь','недоволен','рекламация','претензия','оставить жалобу','плохо','не нравится','жалоб','претенз'])) {
            return { intent: 'complaint' };
        }
        
        // ===== ФИЗИЧЕСКАЯ СИМ =====
        if (this._match(msg, ['физическая сим','обычная сим','пластиковая сим','сим карта','симка','заказать сим','заказать симку','хочу симку','нужна симка','закажи сим','оформи сим','обычная симка','пластик'])) {
            return { intent: 'order_physical' };
        }
        
        // ===== ПРИВЕТСТВИЕ =====
        if (this._match(msg, ['привет','здравствуй','здравствуйте','добрый день','добрый вечер','доброе утро','хай','хелло','hello','hi','салют','приветствую','здарова','ку','доброго времени суток','приветик','здрасте','доброй ночи','добрый','здорово','здаров'])) {
            return { intent: 'greeting' };
        }
        
        // ===== БЛАГОДАРНОСТЬ =====
        if (this._match(msg, ['спасибо','благодарю','мерси','отлично','супер','класс','круто','молодец','спс','сяб','пасиб','спасибки','благодарность','респект','красава','красавчик','хорош','огонь','топ','спасибо большое','огромное спасибо','очень помог','выручил'])) {
            return { intent: 'thanks' };
        }
        
        // ===== ПРОЩАНИЕ =====
        if (this._match(msg, ['пока','до свидания','прощай','увидимся','до встречи','бай','bye','всего хорошего','всего доброго','спокойной ночи','доброй ночи','закончить','выйти','завершить','хватит','стоп'])) {
            return { intent: 'goodbye' };
        }
        
        // ===== ОТМЕНА / НАЗАД =====
        if (this._match(msg, ['назад','отмена','отменить','прервать','остановить','стоп','хватит','не надо','передумал','отбой','забудь'])) {
            return { intent: 'cancel' };
        }

        // ===== РОУМИНГ + ВОПРОС ПРО СТРАНЫ =====
        if (this._has(msg, ['в каких странах','какие страны','список стран','доступные страны','страны для роуминга','где доступен','какие страны поддерживают','какие страны есть','какие страны работают','в каких странах работает','страны роуминга','где работает роуминг'])) {
            return { intent: 'roaming_countries_list' };
        }
        
        // ===== РОУМИНГ + СТРАНА =====
        const country = this._country(msg);
        if (country && this._has(msg, ['роуминг','буду в','еду в','поеду','лечу','отправляюсь','путешеств','поездк','отпуск','командировк','в','стоимость','цена','сколько'])) {
            return { intent: 'roaming_country', country };
        }

        // ===== НЕЧЁТКИЕ СОВПАДЕНИЯ =====
        // Сначала проверяем тарифы
        const fuzzyTariff = getTariffByName(msg);
        if (fuzzyTariff) {
            if (this._has(msg, ['оформи','подключить','заказать','хочу','давай'])) {
                return { intent: 'order_tariff', tariff: fuzzyTariff.name };
            }
            return { intent: 'show_single_tariff', tariff: fuzzyTariff.name };
        }
        
        if (this._has(msg, ['esim','есим','е-сим','электронн сим','цифров сим','встроен','виртуальн сим'])) return { intent: 'order_esim' };
        if (this._has(msg, ['хочу перенести','оформить перенос','сделать перенос','запустить перенос','начать перенос'])) return { intent: 'order_mnp' };
        if (this._has(msg, ['перенести','перенос','mnp','сохранив номер','со своим номером','перейти','переход','портировани'])) return { intent: 'mnp_info' };
        if (this._has(msg, ['тариф','список','предложени','пакет','подключить','подбирать'])) return { intent: 'show_tariffs' };
        if (this._has(msg, ['в каких странах','какие страны','список стран','доступные страны','где доступен роуминг'])) return { intent: 'roaming_countries_list' };
        if (this._has(msg, ['документ','паспорт','удостоверени'])) return { intent: 'documents' };
        if (this._has(msg, ['роуминг','за границ','зарубеж','путешеств','поездк','международн'])) return { intent: 'roaming_general' };
        if (this._has(msg, ['баланс','остаток','счёт','счет','деньги','средств','пополнить','платеж'])) return { intent: 'balance' };
        if (this._has(msg, ['статус','заявк','проверить','где','найти','поиск'])) return { intent: 'status' };
        if (this._has(msg, ['помощ','помог','справк','подскаж'])) return { intent: 'main_menu' };
        if (this._has(msg, ['покрыти','связь','ловить','работает','зона'])) return { intent: 'coverage' };
        if (this._has(msg, ['услуг','сервис','функци','дополнительн'])) return { intent: 'services' };
        if (this._has(msg, ['контакт','позвонить','написать','офис','адрес','телефон'])) return { intent: 'contacts' };
        if (this._has(msg, ['5g','скорость','быстродейств','latency','пинг'])) return { intent: 'speed' };
        if (this._has(msg, ['приложени','мобильн','скачать','установи','app'])) return { intent: 'app' };
        if (this._has(msg, ['жалоб','проблем','не работ','плох','недовол','претенз','рекламац'])) return { intent: 'complaint' };
        if (this._has(msg, ['сим','sim','симку','сим-карту','физическую','пластик','обычную'])) return { intent: 'order_physical' };
        if (this._has(msg, ['главн меню','главное','меню','начал','старт','на главн'])) return { intent: 'main_menu' };
        if (this._has(msg, ['привет','здравствуй','хай','hello','добрый'])) return { intent: 'greeting' };
        if (this._has(msg, ['спасиб','благодар','мерси','отличн','супер','класс','крут','молод'])) return { intent: 'thanks' };
        if (this._has(msg, ['пока','свидан','прощай','бай','bye'])) return { intent: 'goodbye' };

        // ПОДТВЕРЖДЕНИЕ / ОТРИЦАНИЕ
        if (/^(да|ага|конечно|верно|правильно|подтверждаю|yes|да[,\s]*вс[ёе] верно|да[,\s]*все верно|да[,\s]*отправить|отправить|точно|именно|так точно|разумеется|безусловно|все верно|вс[ёе] правильно|абсолютно|ок|окей|ok|хорошо|добро|поехали|давай|валидол|погнали)$/i.test(msg)) return { intent: 'yes' };
        if (/^(нет|неа|неверно|нет[,\s]*заполнить заново|нет[,\s]*заполнить заново|неправильно|ошибка|не так|не то|ошибочка|некорректно|заново|переделать|исправить|нет[,\s]*отмена|отмена)$/i.test(msg)) return { intent: 'no' };
        
        return { intent: 'fallback' };
    }
    
    _match(msg, phrases) { return phrases.includes(msg); }
    
    _country(msg) {
        const m = {
            'турци':'Турция','турц':'Турция','turkey':'Турция','тур':'Турция',
            'египет':'Египет','египт':'Египет','egypt':'Египет',
            'германи':'Германия','герман':'Германия','german':'Германия',
            'испани':'Испания','испан':'Испания','spain':'Испания',
            'франци':'Франция','франц':'Франция','france':'Франция',
            'таиланд':'Таиланд','таилан':'Таиланд','thailand':'Таиланд','тай':'Таиланд',
            'оаэ':'ОАЭ','эмират':'ОАЭ','дубай':'ОАЭ','дубаи':'ОАЭ','dubai':'ОАЭ','uae':'ОАЭ',
            'сша':'США','америк':'США','америка':'США','usa':'США',
            'итали':'Италия','италь':'Италия','italy':'Италия',
            'китай':'Китай','кита':'Китай','china':'Китай',
            'япони':'Япония','япон':'Япония','japan':'Япония',
            'греци':'Греция','грец':'Греция','greece':'Греция',
            'чехи':'Чехия','чех':'Чехия','czech':'Чехия',
            'польш':'Польша','польск':'Польша','poland':'Польша',
            'вьетнам':'Вьетнам','вьетна':'Вьетнам','vietnam':'Вьетнам',
            'англи':'Великобритания','британ':'Великобритания','uk':'Великобритания','england':'Великобритания','великобритан':'Великобритания',
            'канада':'Канада','канад':'Канада','canada':'Канада',
            'австрали':'Австралия','australia':'Австралия',
            'бразили':'Бразилия','brazil':'Бразилия',
            'мексик':'Мексика','mexico':'Мексика',
            'инди':'Индия','india':'Индия',
            'португали':'Португалия','portugal':'Португалия',
            'нидерланд':'Нидерланды','голланди':'Нидерланды','netherlands':'Нидерланды',
            'швеци':'Швеция','sweden':'Швеция',
            'норвеги':'Норвегия','norway':'Норвегия'
        };
        for (const [k, v] of Object.entries(m)) if (msg.includes(k)) return v;
        return null;
    }
    
    _has(msg, keys) { return keys.some(k => msg.includes(k)); }
}

// =============================================
// 4. ДИАЛОГ-МЕНЕДЖЕР
// =============================================
class DialogManager {
    constructor(ui) {
        this.ui = ui;
        this.nlu = new NLU();
        this.state = 'IDLE';
        this.context = 'main';
        this.data = { type: '', tariff: '', name: '', phone: '', email: '', addr: '', mnp: '', step: 0, total: 0, docStep: 0, docSeries: '', docNumber: '', docIssued: '', docDate: '', docName: '', docPhone: '' };
    }

    handleUserMessage(text) {
        if (!text || !this.ui) return;
        
        this.ui.addMessage(text, true);
        
        // Обработка "назад" в процессе заполнения
        if (text.toLowerCase().trim() === 'назад' && this.state !== 'IDLE') {
            if (this.state.startsWith('STEP_') && this.data.step > 0) {
                this.data.step--;
                this._nextStep();
                return;
            }
            if (this.state === 'DOCUMENTS_SEND' && this.data.docStep > 0) {
                this.data.docStep--;
                this._nextDocumentStep();
                return;
            }
            this._respond(() => { this._reset(); this._menu('Главное меню:'); });
            return;
        }

        // Обработка состояний
        if (this.state === 'ROAMING_WAIT') {
            const country = this.nlu._country(text) || text.trim();
            this._respond(() => { this._roamingCountry(country); this.state = 'IDLE'; this.context = 'roaming'; });
            return;
        }
        if (this.state === 'STATUS_WAIT') { this._checkStatus(text); return; }
        if (this.state.startsWith('STEP_')) { this._processStep(text); return; }
        if (this.state === 'DOCUMENTS_SEND') { this._processDocumentStep(text); return; }
        if (this.state === 'DOCUMENTS_CONFIRM') { this._handleConfirmDocuments(text); return; }
        if (this.state === 'CONFIRM') {
            if (/^(да|ага|конечно|верно|правильно|подтверждаю|yes|да[,\s]*вс[ёе] верно|да[,\s]*все верно|точно|именно|ок|окей|ok|хорошо|поехали|давай)$/i.test(text)) this._submit();
            else if (/^(нет|неа|неверно|нет[,\s]*заполнить заново|заново|переделать|отмена)$/i.test(text)) { this._reset(); this._menu('Начнём заново.'); }
            else { this._say('Ответьте «Да» или «Нет».', ['Да, всё верно', 'Нет, заполнить заново']); }
            return;
        }

        this._handle(text);
    }

    _handle(text) {
        const { intent, tariff, country } = this.nlu.getIntent(text);
        if (tariff) this.data.tariff = tariff;

        this._respond(() => {
            switch (intent) {
                case 'main_menu': this._menu('Главное меню:'); break;
                case 'greeting': this._menu('👋 Привет! Чем могу помочь?'); break;
                case 'show_tariffs': this.context = 'tariffs'; this._tariffs(); break;
                case 'show_single_tariff': this._showSingleTariff(tariff); break;
                case 'order_tariff': this._order('tariff'); break;
                case 'order_esim': this._orderEsim(); break;
                case 'order_physical': this._orderPhysical(); break;
                case 'order_mnp': this._orderMnp(); break;
                case 'esim_info': this._esimInfoPage(); break;
                case 'documents': this.context = 'documents'; this._documents(); break;
                case 'send_documents': this._sendDocuments(); break;
                case 'roaming_general': this.context = 'roaming'; this._roaming(); break;
                case 'roaming_countries_list': this._roamingCountriesList(); break;
                case 'roaming_country': this._roamingCountry(country); this.context = 'roaming'; break;
                case 'more_countries': this._allCountries(); break;
                case 'mnp_info': this.context = 'mnp'; this._mnpInfo(); break;
                case 'status': this._status(); break;
                case 'balance': this.context = 'balance'; this._balance(); break;
                case 'coverage': this.context = 'coverage'; this._coverage(); break;
                case 'services': this.context = 'services'; this._services(); break;
                case 'contacts': this.context = 'contacts'; this._contacts(); break;
                case 'speed': this.context = 'speed'; this._speed(); break;
                case 'app': this.context = 'app'; this._appInfo(); break;
                case 'payment': this.context = 'payment'; this._payment(); break;
                case 'complaint': this.context = 'complaint'; this._complaint(); break;
                case 'thanks': this._thanks(); break;
                case 'goodbye': this._goodbye(); break;
                case 'cancel': this._reset(); this._menu('Действие отменено. Главное меню:'); break;
                case 'yes': if (this.state === 'CONFIRM') this._submit(); else this._handleYes(); break;
                case 'no': if (this.state === 'CONFIRM') { this._reset(); this._menu('Начнём заново.'); } else this._handleNo(); break;
                default: this._fallback(); break;
            }
        });
    }

    _handleYes() {
        switch (this.context) {
            case 'tariffs': this._say('Отлично! Какой тариф хотите подключить?', ['Лайт', 'Оптима', 'Максимум', 'Семейный', 'Бизнес']); break;
            case 'esim': this._orderEsim(); break;
            case 'mnp': this._orderMnp(); break;
            case 'documents': this._sendDocuments(); break;
            case 'roaming': this._roaming(); break;
            case 'balance': this._say('💳 *100# — быстрая проверка баланса.\nИли скачайте приложение!', ['Скачать приложение', 'Главное меню']); break;
            case 'coverage': this._say('🗺️ Покрытие — 99% РФ. Проверьте свой адрес на сайте в разделе «Покрытие».', ['Главное меню', 'Тарифы']); break;
            case 'services': this._say('📦 Что именно интересует?', ['Тарифы', 'eSIM', 'Перенос номера', 'Роуминг']); break;
            case 'contacts': this._say('📞 Звоните: 8-800-SERENDALE\nИли пишите в Telegram: @SerendaleBot', ['Главное меню']); break;
            case 'speed': this._say('⚡ 4G до 300 Мбит/с, 5G до 2 Гбит/с.', ['Тарифы', 'eSIM', 'Главное меню']); break;
            case 'app': this._say('📱 Скачайте в App Store или Google Play.\nБонус: +5 ГБ при установке!', ['Главное меню', 'Тарифы']); break;
            case 'payment': this._say('💳 Карта, SberPay, Apple/Google Pay.\nАвтоплатёж — скидка 3%.', ['Главное меню', 'Баланс']); break;
            case 'complaint': this._say('📝 Опишите проблему или позвоните: 8-800-SERENDALE', ['Главное меню', 'Контакты']); break;
            default: this._menu('Чем могу помочь?'); break;
        }
    }

    _handleNo() {
        this._menu('Хорошо, давайте что-нибудь другое:');
    }

    _fallback() {
        switch (this.context) {
            case 'tariffs':
                this._say('Я показываю тарифы. Выберите один или спросите про конкретный.', ['Лайт', 'Оптима', 'Максимум', 'Главное меню']);
                break;
            case 'esim':
                this._say('Раздел eSIM. Хотите оформить или узнать подробнее?', ['Оформить eSIM', 'Тарифы', 'Главное меню']);
                break;
            case 'mnp':
                this._say('Раздел переноса номера. Хотите оформить?', ['Хочу перенести номер', 'Тарифы', 'Главное меню']);
                break;
            case 'roaming':
                this._say('Раздел роуминга. В какую страну едете? Или посмотрите список стран.', ['В каких странах доступен роуминг?', 'Турция', 'ОАЭ', 'Главное меню']);
                break;
            case 'documents':
                this._say('Раздел документов. Хотите отправить или узнать какие нужны?', ['Отправить документы', 'Какие документы нужны?', 'Главное меню']);
                break;
            case 'balance':
                this._say('Раздел баланса. Проверить: *100# или в приложении.', ['Скачать приложение', 'Тарифы', 'Главное меню']);
                break;
            case 'coverage':
                this._say('Покрытие — 99% РФ. Проверьте адрес на сайте.', ['Тарифы', 'eSIM', 'Главное меню']);
                break;
            case 'services':
                this._say('Все услуги Serendale:', ['Тарифы', 'eSIM', 'Перенос номера', 'Роуминг']);
                break;
            case 'contacts':
                this._say('Контакты: 8-800-SERENDALE, @SerendaleBot', ['Главное меню', 'Помощь']);
                break;
            default:
                this._say('🤔 Не уверен, что правильно понял. Вот что я могу:', ['Тарифы', 'eSIM', 'Перенос номера', 'Роуминг', 'Документы', 'Главное меню']);
                break;
        }
    }

    // ===== ПОКАЗАТЬ ОДИН КОНКРЕТНЫЙ ТАРИФ =====
    _showSingleTariff(name) {
        const tariff = getTariffByName(name);
        if (tariff) {
            this.context = 'tariffs';
            this.ui.addMessage(`📱 <b>Тариф «${tariff.name}»:</b>`, false);
            const c = document.createElement('div');
            c.innerHTML = generateTariffCard(tariff);
            this.ui.addMessage(c.firstElementChild, false);
            this.ui.setSuggestions([`Оформить ${tariff.name}`, 'Все тарифы', 'Главное меню']);
        } else {
            this._say(`🤔 Не нашёл тариф «${name}». Вот все доступные:`, ['Все тарифы', 'Главное меню']);
        }
    }

    // ===== ОФОРМЛЕНИЕ eSIM =====
    _orderEsim() {
        this._say('📲 <b>Оформление eSIM</b>\n\nЗаполните данные — и QR-код придёт на email через 5 минут!');
        this.state = 'ORDERING';
        this.context = 'esim';
        this.data = { type: 'esim', tariff: '', name: '', phone: '', email: '', addr: '', mnp: '', step: 0, total: 0 };
        this.data.total = 3;
        setTimeout(() => this._nextStep(), 400);
    }

    // ===== ОФОРМЛЕНИЕ ФИЗИЧЕСКОЙ СИМ =====
    _orderPhysical() {
        this._say('📦 <b>Заказ физической сим-карты</b>\n\nБесплатная доставка по РФ за 2-3 дня!');
        this.state = 'ORDERING';
        this.context = 'physical';
        this.data = { type: 'physical', tariff: '', name: '', phone: '', email: '', addr: '', mnp: '', step: 0, total: 0 };
        this.data.total = 4;
        setTimeout(() => this._nextStep(), 400);
    }

    // ===== ОФОРМЛЕНИЕ MNP — СРАЗУ ФОРМА =====
    _orderMnp() {
        this._say('🔄 <b>Перенос номера в Serendale</b>\n\nСохраните ваш номер! Процесс займёт 3-7 дней.\nЗаполните данные для заявки.');
        this.state = 'ORDERING';
        this.context = 'mnp';
        this.data = { type: 'mnp', tariff: '', name: '', phone: '', email: '', addr: '', mnp: '', step: 0, total: 0 };
        this.data.total = 5;
        setTimeout(() => this._nextStep(), 400);
    }

    // ===== ОФОРМЛЕНИЕ ТАРИФА =====
    _order(type) {
        this.state = 'ORDERING';
        this.context = type;
        this.data = { type, tariff: this.data.tariff || '', name: '', phone: '', email: '', addr: '', mnp: '', step: 0, total: 0 };
        this.data.total = type === 'mnp' ? 5 : 3;

        if (!this.data.tariff) {
            this._say('📋 Выберите тариф:');
            this._tariffs();
            return;
        }

        this._say(`✅ Оформление тарифа «${this.data.tariff}»!\nЗаполним данные. «Назад» — отмена.`);
        setTimeout(() => this._nextStep(), 400);
    }

    _nextStep() {
        const steps = this._steps();
        if (this.data.step >= steps.length) { this._confirm(); return; }
        const s = steps[this.data.step];
        const pct = Math.round((this.data.step / steps.length) * 100);
        this.ui.addMessage(`<div style="margin-bottom:8px;"><span style="font-size:11px;color:rgba(255,255,255,.4);">Шаг ${this.data.step+1}/${steps.length}</span><div class="sr-progress"><div class="sr-progress-fill" style="width:${pct}%"></div></div></div><p>${s.msg}</p>`, false);
        this.ui.setInputPlaceholder(s.ph);
        this.ui.setSuggestions(s.opt ? ['Пропустить', 'Назад'] : ['Назад']);
        this.state = `STEP_${s.field}`;
    }

    _steps() {
        const s = [
            { field: 'NAME', msg: '📝 <b>ФИО полностью</b> (Иванов Иван Иванович).', ph: 'Ваше ФИО...', chk: v => v.split(' ').filter(w=>w.length>1).length>=2 ? null : 'Минимум имя и фамилия' },
            { field: 'PHONE', msg: '📞 <b>Телефон</b> для связи.', ph: '+7 (999) 123-45-67', chk: v => v.replace(/\D/g,'').length>=10 ? null : 'Минимум 10 цифр' },
            { field: 'EMAIL', msg: '📧 <b>Email</b> — для договора и QR-кода.', ph: 'example@mail.ru', chk: v => v.includes('@')&&v.includes('.') ? null : 'Некорректный email' }
        ];
        if (this.data.type === 'mnp') s.splice(1, 0, { field: 'MNP', msg: '🔄 <b>Номер для переноса</b>.', ph: 'Номер для переноса...', chk: v => v.replace(/\D/g,'').length>=10 ? null : 'Минимум 10 цифр' });
        if (this.data.type === 'physical') s.push({ field: 'ADDR', msg: '📍 <b>Адрес доставки</b>.', ph: 'Город, улица, дом, квартира...', chk: v => v.length>=5 ? null : 'Укажите адрес доставки' });
        return s;
    }

    _processStep(text) {
        const steps = this._steps();
        const cur = steps[this.data.step];
        if (text === 'Пропустить' && cur.opt) { this.data[cur.field.toLowerCase()] = '—'; this.data.step++; this._nextStep(); return; }
        if (text === 'Назад') { if (this.data.step === 0) { this._reset(); this._menu('Оформление отменено.'); return; } this.data.step--; this._nextStep(); return; }
        let v = text.trim();
        if (cur.field === 'PHONE') { let d = v.replace(/\D/g,''); if (d.startsWith('8')) d = '7' + d.slice(1); if (d.startsWith('7') && d.length === 11) d = d.slice(1); d = d.slice(0, 10); if (d.length >= 10) v = `+7 (${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,8)}-${d.slice(8,10)}`; }
        if (cur.field === 'MNP') { v = v.replace(/\D/g,''); }
        const err = cur.chk ? cur.chk(v) : null;
        if (err) { this.ui.addMessage(`⚠️ ${err}`, false); this.ui.setSuggestions(['Назад']); return; }
        this.data[cur.field.toLowerCase()] = v;
        this.data.step++;
        this._nextStep();
    }

    _confirm() {
        let s = `📋 <b>Проверьте:</b>\n\n<b>Услуга:</b> ${this._serviceName()}\n`;
        if (this.data.tariff) s += `<b>Тариф:</b> ${this.data.tariff}\n`;
        s += `<b>ФИО:</b> ${this.data.name}\n<b>Телефон:</b> ${this.data.phone}\n<b>Email:</b> ${this.data.email}\n`;
        if (this.data.mnp && this.data.mnp !== '—') s += `<b>Номер для переноса:</b> ${this.data.mnp}\n`;
        if (this.data.addr && this.data.addr !== '—') s += `<b>Адрес доставки:</b> ${this.data.addr}\n`;
        s += `\nВсё верно?`;
        this.ui.addMessage(s, false);
        this.ui.setSuggestions(['Да, всё верно', 'Нет, заполнить заново']);
        this.state = 'CONFIRM';
    }

    _serviceName() {
        const names = { tariff: 'Подключение тарифа', esim: 'Оформление eSIM', physical: 'Заказ сим-карты', mnp: 'Перенос номера', documents: 'Отправка документов' };
        return names[this.data.type] || 'Услуга';
    }

    _submit() {
        const app = {
            id: 'APP-' + Date.now() + '-' + Math.random().toString(36).substr(2,5).toUpperCase(),
            serviceType: this.data.type || 'tariff',
            tariffName: this.data.tariff || '',
            fullName: this.data.name || '',
            phone: this.data.phone || '',
            email: this.data.email || '',
            address: this.data.addr || '',
            mnpNumber: this.data.mnp || '',
            comment: '',
            status: 'new',
            createdAt: new Date().toISOString(),
            sessionId: getSessionId()
        };
        API_Bridge.saveApplication(app).then(() => {
            this._say(`✅ <b>Заявка №${app.id} создана!</b>\nМенеджер свяжется в ближайшее время.\nСпасибо за выбор Serendale! 💜`);
            this._reset();
            this.ui.setSuggestions(['Статус заявки', 'Тарифы', 'Главное меню']);
        }).catch(() => { this._say('❌ Ошибка. Попробуйте снова.'); this._reset(); });
    }

    _sendDocuments() {
        this.state = 'DOCUMENTS_SEND';
        this.context = 'documents';
        this.data = { type: 'documents', docStep: 0, docSeries: '', docNumber: '', docIssued: '', docDate: '', docName: '', docPhone: '' };
        this._nextDocumentStep();
    }

    _nextDocumentStep() {
        const steps = [
            { field: 'docName', msg: '📝 <b>ФИО</b> как в паспорте.', ph: 'Иванов Иван Иванович', chk: v => v.split(' ').filter(w=>w.length>1).length>=2 ? null : 'Минимум имя и фамилия' },
            { field: 'docSeries', msg: '📘 <b>Серия паспорта</b> (4 цифры).', ph: '1234', chk: v => /^\d{4}$/.test(v) ? null : 'Ровно 4 цифры' },
            { field: 'docNumber', msg: '📘 <b>Номер паспорта</b> (6 цифр).', ph: '567890', chk: v => /^\d{6}$/.test(v) ? null : 'Ровно 6 цифр' },
            { field: 'docIssued', msg: '🏢 <b>Кем выдан</b>.', ph: 'Отделом УФМС...', chk: v => v.length>=5 ? null : 'Укажите организацию' },
            { field: 'docDate', msg: '📅 <b>Дата выдачи</b> (ДД.ММ.ГГГГ).', ph: '01.01.2020', chk: v => /^\d{2}\.\d{2}\.\d{4}$/.test(v) ? null : 'Формат: ДД.ММ.ГГГГ' },
            { field: 'docPhone', msg: '📞 <b>Телефон</b> для связи.', ph: '+7 (999) 123-45-67', chk: v => v.replace(/\D/g,'').length>=10 ? null : 'Минимум 10 цифр' }
        ];
        if (this.data.docStep >= steps.length) { this._confirmDocuments(); return; }
        const s = steps[this.data.docStep];
        const pct = Math.round((this.data.docStep / steps.length) * 100);
        this.ui.addMessage(`<div style="margin-bottom:8px;"><span style="font-size:11px;color:rgba(255,255,255,.4);">Шаг ${this.data.docStep+1}/${steps.length} — Паспортные данные</span><div class="sr-progress"><div class="sr-progress-fill" style="width:${pct}%"></div></div></div><p>${s.msg}</p>`, false);
        this.ui.setInputPlaceholder(s.ph);
        this.ui.setSuggestions(['Назад']);
    }

    _processDocumentStep(text) {
        const steps = [
            { field: 'docName', chk: v => v.split(' ').filter(w=>w.length>1).length>=2 ? null : 'Минимум имя и фамилия' },
            { field: 'docSeries', chk: v => /^\d{4}$/.test(v) ? null : 'Ровно 4 цифры' },
            { field: 'docNumber', chk: v => /^\d{6}$/.test(v) ? null : 'Ровно 6 цифр' },
            { field: 'docIssued', chk: v => v.length>=5 ? null : 'Укажите организацию' },
            { field: 'docDate', chk: v => /^\d{2}\.\d{2}\.\d{4}$/.test(v) ? null : 'Формат: ДД.ММ.ГГГГ' },
            { field: 'docPhone', chk: v => v.replace(/\D/g,'').length>=10 ? null : 'Минимум 10 цифр' }
        ];
        if (text === 'Назад') { if (this.data.docStep === 0) { this._reset(); this._menu('Отправка отменена.'); return; } this.data.docStep--; this._nextDocumentStep(); return; }
        const cur = steps[this.data.docStep];
        let v = text.trim();
        if (cur.field === 'docPhone') { let d = v.replace(/\D/g,''); if (d.startsWith('8')) d = '7' + d.slice(1); if (d.startsWith('7') && d.length === 11) d = d.slice(1); d = d.slice(0, 10); if (d.length >= 10) v = `+7 (${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,8)}-${d.slice(8,10)}`; }
        const err = cur.chk ? cur.chk(v) : null;
        if (err) { this.ui.addMessage(`⚠️ ${err}`, false); this.ui.setSuggestions(['Назад']); return; }
        this.data[cur.field] = v;
        this.data.docStep++;
        this._nextDocumentStep();
    }

    _confirmDocuments() {
        let s = `📄 <b>Проверьте данные:</b>\n\n<b>ФИО:</b> ${this.data.docName}\n<b>Паспорт:</b> ${this.data.docSeries} ${this.data.docNumber}\n<b>Кем выдан:</b> ${this.data.docIssued}\n<b>Дата:</b> ${this.data.docDate}\n<b>Телефон:</b> ${this.data.docPhone}\n\nОтправить?`;
        this.ui.addMessage(s, false);
        this.ui.setSuggestions(['Да, отправить', 'Нет, отмена']);
        this.state = 'DOCUMENTS_CONFIRM';
    }

    _handleConfirmDocuments(text) {
        if (/^(да|ага|конечно|верно|правильно|подтверждаю|yes|да[,\s]*отправить|отправить|ок|хорошо)$/i.test(text)) {
            const app = {
                id: 'DOC-' + Date.now() + '-' + Math.random().toString(36).substr(2,5).toUpperCase(),
                serviceType: 'documents',
                tariffName: 'Отправка документов',
                fullName: this.data.docName || '',
                phone: this.data.docPhone || '',
                email: '',
                address: '',
                mnpNumber: '',
                comment: `Паспорт: ${this.data.docSeries} ${this.data.docNumber}, выдан: ${this.data.docIssued}, дата: ${this.data.docDate}`,
                status: 'new',
                createdAt: new Date().toISOString(),
                sessionId: getSessionId()
            };
            API_Bridge.saveApplication(app).then(() => {
                this._say(`✅ <b>Документы отправлены!</b>\nНомер: ${app.id}\nМенеджер свяжется с вами.`);
                this._reset();
                this.ui.setSuggestions(['Статус заявки', 'Тарифы', 'Главное меню']);
            }).catch(() => { this._say('❌ Ошибка.'); this._reset(); });
        } else { this._reset(); this._menu('Отправка отменена.'); }
    }

    _reset() {
        this.state = 'IDLE';
        this.context = 'main';
        this.data = { type: '', tariff: '', name: '', phone: '', email: '', addr: '', mnp: '', step: 0, total: 0, docStep: 0, docSeries: '', docNumber: '', docIssued: '', docDate: '', docName: '', docPhone: '' };
        this.ui.setInputPlaceholder('Введите сообщение...');
        this.ui.focusInput();
    }

    // ===== СТРАНИЦЫ =====
    _tariffs() {
        this.context = 'tariffs';
        this.ui.addMessage('📱 <b>Наши тарифы:</b>\n\nВыберите или напишите название (например, «Лайт»).', false);
        knowledgeBase.tariffs.forEach(t => { const c = document.createElement('div'); c.innerHTML = generateTariffCard(t); this.ui.addMessage(c.firstElementChild, false); });
        this.ui.setSuggestions(['Лайт', 'Оптима', 'Максимум', 'Семейный', 'Бизнес', 'Главное меню']);
    }

    _esimInfoPage() {
        let h = '<div class="sr-info-block">';
        knowledgeBase.esimInfo.forEach(s => { h += `<p style="font-weight:600;margin-top:10px;">🔍 ${s.title}</p>`; if (s.text) h += `<p style="margin:4px 0;">${s.text}</p>`; if (s.items) h += `<ul style="padding-left:16px;margin:4px 0;">${s.items.map(i=>`<li>${i}</li>`).join('')}</ul>`; });
        h += '</div><button class="sr-btn" data-action="send" data-value="Оформить eSIM" style="margin-top:8px;">📲 Оформить eSIM</button>';
        this.ui.addMessage(h, false);
        this.ui.setSuggestions(['Оформить eSIM', 'Тарифы', 'Главное меню']);
    }

    _documents() {
        this.ui.addMessage('<div class="sr-info-block"><h4>📄 Необходимые документы</h4><p>Для оформления нужен только <b>паспорт РФ</b>.</p><p style="margin-top:6px;">🔒 Данные защищены (TLS 1.3, ФЗ-152).</p><button class="sr-btn" data-action="send" data-value="Отправить документы" style="margin-top:10px;">📎 Отправить документы</button></div>', false);
        this.ui.setSuggestions(['Отправить документы', 'Тарифы', 'Главное меню']);
    }

    _mnpInfo() {
        let h = '<div class="sr-info-block">';
        knowledgeBase.mnpInfo.forEach(s => { h += `<p style="font-weight:600;margin-top:10px;">${s.title}</p>`; if (s.text) h += `<p style="margin:4px 0;">${s.text}</p>`; if (s.items) h += `<ul style="padding-left:16px;margin:4px 0;">${s.items.map(i=>`<li>${i}</li>`).join('')}</ul>`; });
        h += '</div><button class="sr-btn" data-action="send" data-value="Хочу перенести номер" style="margin-top:8px;">🔄 Хочу перенести номер</button>';
        this.ui.addMessage(h, false);
        this.ui.setSuggestions(['Хочу перенести номер', 'Тарифы', 'Главное меню']);
    }

    _roaming() {
        this.ui.addMessage('🌍 <b>Роуминг</b>\n\n• Европа, Турция: <b>299 ₽/день</b>\n• Таиланд, ОАЭ: <b>399 ₽/день</b>\n• США: <b>499 ₽/день</b>\n\nВ какую страну едете?', false);
        this.ui.setInputPlaceholder('Страна...');
        this.state = 'ROAMING_WAIT';
    }

    _roamingCountriesList() {
        this.context = 'roaming';
        let html = '<div class="sr-info-block"><h4>🌍 Доступные страны для роуминга</h4>';
        for (const [region, countries] of Object.entries(knowledgeBase.countryGroups)) {
            html += `<p style="font-weight:600;margin-top:8px;">${region}</p>`;
            html += '<div class="sr-chips">';
            countries.forEach(c => { html += `<span class="sr-chip" data-action="send" data-value="Роуминг в ${c}">${c}</span>`; });
            html += '</div>';
        }
        html += '<p style="margin-top:10px;font-size:13px;">Нажмите на страну, чтобы узнать стоимость.</p></div>';
        const div = document.createElement('div');
        div.innerHTML = html;
        this.ui.addMessage(div, false);
        this.ui.setSuggestions(['Турция', 'ОАЭ', 'Германия', 'Таиланд', 'США', 'Главное меню']);
    }

    _roamingCountry(name) {
        const d = knowledgeBase.roamingCountries[name.toLowerCase()];
        this._say(d ? `🌍 <b>Роуминг в ${name}</b>\n\n📱 Мессенджеры: безлимитно\n🌐 Интернет: 1 ГБ/день\n📞 Входящие: 30 мин/день\n💰 Стоимость: ${d.price} ₽/день\n\n<i>${d.info}</i>\n\nХорошего путешествия! ✈️` : `🌍 <b>Роуминг в ${name}</b>\n\n📱 Мессенджеры: безлимитно\n🌐 Интернет: 1 ГБ/день\n📞 Входящие: 30 мин/день\n💰 Стоимость: от 299 ₽/день`);
        this.ui.setSuggestions(['В каких странах доступен роуминг?', 'Тарифы', 'Главное меню']);
    }

    _allCountries() {
        const chips = document.createElement('div');
        chips.className = 'sr-info-block';
        chips.innerHTML = '<h4>🌍 Все доступные страны</h4>';
        for (const [region, countries] of Object.entries(knowledgeBase.countryGroups)) {
            chips.innerHTML += `<p style="font-weight:600;margin-top:8px;">${region}</p>`;
            chips.innerHTML += '<div class="sr-chips">';
            countries.forEach(c => { chips.innerHTML += `<span class="sr-chip" data-action="send" data-value="Роуминг в ${c}">${c}</span>`; });
            chips.innerHTML += '</div>';
        }
        this.ui.addMessage(chips, false);
        this.ui.setSuggestions(['Турция', 'Египет', 'Испания', 'Таиланд', 'Главное меню']);
    }

    _balance() { this._say('💳 Проверить баланс:\n\n• USSD: *100#\n• Приложение Serendale\n• Личный кабинет\n\nАвтоплатёж — скидка 3%!', ['Скачать приложение', 'Тарифы', 'Главное меню']); }
    _coverage() { this._say('🗺️ Покрытие Serendale — <b>99% территории РФ</b>\n\n• 4G/LTE — города и трассы\n• 5G — 85+ городов\n• Спутниковая связь — удалённые районы\n\nПроверьте адрес на сайте в разделе «Покрытие».', ['Тарифы', 'eSIM', 'Главное меню']); }
    _services() { this._say('📦 <b>Услуги Serendale:</b>\n\n• Тарифы (5 шт)\n• eSIM\n• Физические сим-карты\n• Перенос номера (MNP)\n• Роуминг в 190+ странах\n• Семейные и бизнес-тарифы\n• Защита от спама\n• Облачное хранилище\n\nЧто интересует?', ['Тарифы', 'eSIM', 'Перенос номера', 'Роуминг', 'Главное меню']); }
    _contacts() { this._say('📞 <b>Контакты:</b>\n\n• Телефон: 8-800-SERENDALE\n• Email: support@serendale.ru\n• Telegram: @SerendaleBot\n• Офисы: Москва, СПб, Казань, Екатеринбург\n\nРаботаем 24/7!', ['Главное меню', 'Тарифы']); }
    _speed() { this._say('⚡ <b>Скорость:</b>\n\n• 4G: до 300 Мбит/с\n• 5G: до 2 Гбит/с\n• Пинг: 15-25 мс\n\nБезлимит без скрытых ограничений!', ['Тарифы', 'eSIM', 'Главное меню']); }
    _appInfo() { this._say('📱 <b>Приложение Serendale:</b>\n\n• App Store / Google Play\n• Управление тарифами\n• Баланс и расходы\n• Поддержка в чате\n• +5 ГБ в подарок при установке! 🎁', ['Главное меню', 'Тарифы']); }
    _payment() { this._say('💳 <b>Оплата:</b>\n\n• Карта (Visa, MC, МИР)\n• SberPay / Apple Pay / Google Pay\n• Автоплатёж (скидка 3%)\n• Обещанный платёж\n\nПополнить в приложении или по *100#.', ['Баланс', 'Главное меню']); }
    _complaint() { this._say('😔 Нам жаль.\nОпишите проблему — передадим в приоритетную поддержку.\nИли позвоните: 8-800-SERENDALE', ['Контакты', 'Главное меню']); }
    _thanks() { this._say('😊 Рад помочь! Обращайтесь в любое время.\nХорошего дня! 💜', ['Главное меню']); }
    _goodbye() { this._say('👋 До свидания! Буду ждать вас снова.\nХорошего дня! 💜', []); }

    _status() {
        this._say('📋 Напишите номер заявки (APP-...) или ваше ФИО.');
        this.ui.setInputPlaceholder('APP-... или ФИО');
        this.state = 'STATUS_WAIT';
    }

    async _checkStatus(term) {
        this.ui.setInputPlaceholder('Введите сообщение...');
        this.state = 'IDLE';
        this.context = 'status';
        try {
            const db = await API_Bridge.openDB();
            const apps = await new Promise(r => { const tx = db.transaction(['applications'], 'readonly'); tx.objectStore('applications').getAll().onsuccess = e => r(e.target.result); });
            if (!apps || !apps.length) { this._say('📭 У вас пока нет заявок.', ['Тарифы', 'eSIM', 'Главное меню']); return; }
            const found = apps.filter(a => a.id.toLowerCase().includes(term.toLowerCase()) || (a.fullName||'').toLowerCase().includes(term.toLowerCase()) || (a.phone||'').includes(term));
            if (!found.length) { this._say('🔍 Заявок не найдено. Проверьте номер или ФИО.', ['Главное меню', 'Тарифы']); return; }
            const st = { new: '🟢 Новая', process: '🟡 В обработке', done: '🟢 Выполнена' };
            found.slice(0, 3).forEach(a => { this.ui.addMessage(`📋 <b>${a.id}</b>\nСтатус: ${st[a.status]||a.status}\nУслуга: ${a.tariffName||a.serviceType}\nФИО: ${a.fullName||'—'}\nТелефон: ${a.phone||'—'}`, false); });
            this.ui.setSuggestions(['Главное меню', 'Тарифы']);
        } catch (e) { this._say('❌ Ошибка. Попробуйте позже.', ['Главное меню']); }
    }

    _say(text, sugg) { this.ui.addMessage(text, false); if (sugg) this.ui.setSuggestions(sugg); }
    _respond(cb) { this.ui.showTypingIndicator(); setTimeout(() => { this.ui.removeTypingIndicator(); cb(); }, 600 + Math.random() * 800); }

    _menu(msg) {
        this._reset();
        this.context = 'main';
        const m = document.createElement('div');
        m.innerHTML = `<p style="margin-bottom:10px;">${msg}</p><div class="sr-grid">
            <div class="sr-grid-item" data-action="send" data-value="Тарифы"><i class="fa-solid fa-tag"></i><p>Тарифы</p></div>
            <div class="sr-grid-item" data-action="send" data-value="Оформить eSIM"><i class="fa-solid fa-sim-card"></i><p>eSIM</p></div>
            <div class="sr-grid-item" data-action="send" data-value="Хочу перенести номер"><i class="fa-solid fa-rotate"></i><p>MNP</p></div>
            <div class="sr-grid-item" data-action="send" data-value="Роуминг"><i class="fa-solid fa-earth-americas"></i><p>Роуминг</p></div>
        </div>`;
        this.ui.addMessage(m, false);
        this.ui.setSuggestions(['Тарифы', 'eSIM', 'Перенос номера', 'Роуминг', 'Документы', 'Баланс']);
    }
}

// =============================================
// 5. API-МОСТ
// =============================================
class API_Bridge {
    static DB_NAME = 'SerendaleTelecomDB';
    static DB_VERSION = 5;

    static openDB() {
        return new Promise((resolve, reject) => {
            const r = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            r.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('applications')) { const s = db.createObjectStore('applications', { keyPath: 'id' }); s.createIndex('status', 'status', { unique: false }); s.createIndex('createdAt', 'createdAt', { unique: false }); s.createIndex('phone', 'phone', { unique: false }); s.createIndex('serviceType', 'serviceType', { unique: false }); }
                if (!db.objectStoreNames.contains('chatMessages')) { const cs = db.createObjectStore('chatMessages', { keyPath: 'id', autoIncrement: true }); cs.createIndex('timestamp', 'timestamp', { unique: false }); cs.createIndex('sender', 'sender', { unique: false }); cs.createIndex('sessionId', 'sessionId', { unique: false }); }
            };
            r.onsuccess = e => resolve(e.target.result);
            r.onerror = e => reject(e.target.error);
        });
    }

    static async saveApplication(app) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(['applications'], 'readwrite');
            tx.objectStore('applications').add(app);
            tx.oncomplete = () => {
                try { const ch = new BroadcastChannel('serendale_admin'); ch.postMessage({ type: 'new_application', application: app }); ch.close(); } catch (e) {}
                try { localStorage.setItem('serendale_new_app', JSON.stringify({ timestamp: Date.now(), id: app.id })); } catch(e) {}
                db.close();
                resolve();
            };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    }
}

function getSessionId() {
    let id = sessionStorage.getItem('chatSessionId');
    if (!id) { id = 'sess_' + Date.now(); sessionStorage.setItem('chatSessionId', id); }
    return id;
}

// =============================================
// 6. ИНИЦИАЛИЗАЦИЯ
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const ui = new ChatUI();
        const dm = new DialogManager(ui);
        window.dialogManager = dm;
        await API_Bridge.openDB();
        console.log('✅ Serendale AI v3.7 готов (конкретные тарифы + MNP форма + страны роуминга)');
    } catch (e) { console.error('Ошибка инициализации:', e); }
});