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

@login_required
def planner(request, *args, **kwargs):
    context = {
        'styles': ['app/pages/planner/planner.css'],
        'scripts': ['app/pages/planner/planner.js'],
    }
    return render(request, 'app/planner.html', context)

@login_required
def planner_detail(request, kind, name, *args, **kwargs):
    context = {
        'styles': ['app/pages/planner/planner.css','app/pages/planner/planner_detail.css'],
        'scripts': ['app/pages/planner/planner.js','app/pages/planner/planner_detail.js'],
        'kind': kind,
        'name': name
    }
    return render(request, 'app/planner_detail.html', context)

@login_required
def characters(request, *args, **kwargs):
    context = {
        'styles': ['app/pages/characters/characters.css'],
        'scripts': ['app/pages/characters/characters.js'],
    }
    return render(request, 'app/characters.html', context)

@login_required
def weapons(request, *args, **kwargs):
    context = {
        'styles': ['app/pages/weapons/weapons.css'],
        'scripts': ['app/pages/weapons/weapons.js'],
    }
    return render(request, 'app/weapons.html', context)

@login_required
def compare(request, *args, **kwargs):
    context = {
        'styles': ['app/pages/compare/compare.css'],
        'scripts': ['app/pages/compare/compare.js'],
    }
    return render(request, 'app/compare.html', context)

def data(request, *args, **kwargs):
    context = {
        'styles': ['app/pages/data/data.css'],
        'scripts': ['app/pages/data/data.js'],
    }
    return render(request, 'app/data.html', context)
