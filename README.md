
from django.shortcuts import render
from .forms import ContestForm


def proposal(request):
    if request.method == 'POST':
        form = ContestForm(request.POST)
    else:
        form = ContestForm(request.GET or None)

    context = {
        'form': form
    }

    if request.method == 'POST' and form.is_valid():
        title = form.cleaned_data['title']
        context['message'] = f'Рецепт мороженого "{title}" принят на конкурс!'

    return render(request, 'contest/form.html', context)
