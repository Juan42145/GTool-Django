from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Create your views here.
# @login_required
def home(request, *args, **kwargs):
    context = {
    }
    return render(request, 'app/home.html', context)

def test(request, *args, **kwargs):
    context = {
        
    }
    return render(request, 'app/test.html', context)