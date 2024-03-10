from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# Create your views here.
def test(request, *args, **kwargs):
    context = {
        'styles': [],
        'scripts': ['app/test.js'],
    }
    return render(request, 'app/test.html', context)

@login_required
def dashboard(request, *args, **kwargs):
    context = {
        'styles': ['app/pages/dashboard/dashboard.css'],
        'scripts': ['app/pages/dashboard/dashboard.js'],
    }
    return render(request, 'app/dashboard.html', context)

@login_required
def dashboard_detail(request, category, *args, **kwargs):
    context = {
        'styles': ['app/pages/dashboard/dashboard.css','app/pages/dashboard/dashboard_detail.css'],
        'scripts': ['app/pages/dashboard/dashboard.js','app/pages/dashboard/dashboard_detail.js'],
        'category': category
    }
    return render(request, 'app/dashboard_detail.html', context)

@login_required
def inventory(request, *args, **kwargs):
    context = {
        'styles': ['app/pages/inventory/inventory.css'],
        'scripts': ['app/pages/inventory/inventory.js'],
    }
    return render(request, 'app/inventory.html', context)