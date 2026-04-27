from django.shortcuts import render
from .forms import ContestForm


def proposal(request):
    form = ContestForm(request.POST or None)

    context = {
        'form': form
    }

    if request.method == 'POST' and form.is_valid():
        title = form.cleaned_data['title']
        context['message'] = f'Рецепт мороженого "{title}" принят на конкурс!'

    return render(request, 'contest/form.html', context)


    {% extends "base.html" %}

{% block content %}

<h1>Рецепт мороженого "Анфиса"</h1>

{% if message %}
  <h2>{{ message }}</h2>
{% endif %}

<form method="post">
  {% csrf_token %}

  <table>
    {{ form }}
  </table>

  <button type="submit">Отправить</button>
</form>

{% endblock %}
