<form method="post">
  {% csrf_token %}

  {% if message %}
    <h2>{{ message }}</h2>
  {% endif %}

  <table>
    {{ form }}
  </table>

  <button type="submit">Отправить</button>
</form>
