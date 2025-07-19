from urllib.parse import unquote
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from api.models import Character, Weapon

# Create your views here.
def test(request, *args, **kwargs):
    context = {
        'styles': [],
        'scripts': ['app/test.js'],
    }
    return render(request, 'app/test.html', context)

def home(request, *args, **kwargs):
    context = {
        # 'styles': [],
        # 'scripts': ['app/home.js'],
    }
    return render(request, 'app/home.html', context)

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
        'category': unquote(category)
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
        'styles': ['app/pages/planner/planner_detail.css'],
        'scripts': ['app/pages/planner/planner_detail.js'],
        'kind': kind,
        'name': unquote(name)
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
def character_detail(request, name, *args, **kwargs):
    object = get_object_or_404(Character, name=unquote(name))
    context = {
        'object': object,
        'styles': ['app/pages/models/model_detail.css'],
        'scripts': ['app/pages/characters/character_detail.js'],
    }
    return render(request, 'app/character_detail.html', context)

@login_required
def weapons(request, *args, **kwargs):
    context = {
        'styles': ['app/pages/weapons/weapons.css'],
        'scripts': ['app/pages/weapons/weapons.js'],
    }
    return render(request, 'app/weapons.html', context)

@login_required
def weapon_detail(request, name, *args, **kwargs):
    object = get_object_or_404(Weapon, name=unquote(name))
    context = {
        'object': object,
        'styles': ['app/pages/models/model_detail.css'],
        'scripts': ['app/pages/weapons/weapon_detail.js'],
    }
    return render(request, 'app/weapon_detail.html', context)

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
