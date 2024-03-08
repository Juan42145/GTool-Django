from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from users.forms import ProfileUpdateForm

# Create your views here.
# @login_required
def home(request, *args, **kwargs):
    print(request.POST)
    if request.method == 'POST':
        print('posted')
        form = ProfileUpdateForm(request.POST, instance=request.user.profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Saved')
            return redirect('app:dashboard')
    else:
        form = ProfileUpdateForm(instance=request.user.profile)
    context = {
        'action': 'testing()',
        'form': form
    }
    if request.method == 'GET':
        return render(request, 'app/home.html', context)

def test(request, *args, **kwargs):
    context = {
        
    }
    return render(request, 'app/test.html', context)