
<!DOCTYPE html>
<html>
<head>
    <title>Конкурс</title>
</head>
<body>

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

</body>
</html>
