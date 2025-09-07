from urllib.parse import unquote
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View
from django.views.generic import ListView, CreateView, UpdateView
from django.urls import reverse_lazy
from api.models import *

# Create your views here.
def test(request, *args, **kwargs):
    context = {
        'styles': [],
        'scripts': ['app/test.js'],
    }
    return render(request, 'app/test.html', context)

def home(request, *args, **kwargs):
    return render(request, 'app/home.html')

@login_required
def dashboard(request, *args, **kwargs):
    context = {
        'styles': ['app/pages/dashboard/dashboard.css'],
        'scripts': ['app/pages/dashboard/dashboard.js'],
    }
    return render(request, 'app/dashboard.html', context)

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


#Admin views abstracts
class GenericListView(LoginRequiredMixin, ListView):
    ordering = '-id'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['styles'] = ['app/pages/models/model_list.css']
        context['scripts'] = ['app/pages/models/model_list.js']
        return context

    class Meta:
        abstract = True

class GenericFormView(LoginRequiredMixin, View):
    template_name = 'adm/_form.html'
    fields = '__all__'
    inv_fields = []
    img_fields = []

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['styles'] = ['app/pages/models/model_form.css']
        context['scripts'] = ['app/pages/models/model_form.js']
        context['model_name'] = self.model.__name__.lower()
        context['verbose_name'] = self.model._meta.verbose_name
        context['img_fields'] = self.img_fields
        return context

    def get_form(self, form_class = None):
        form =  super().get_form(form_class)
        for i in self.inv_fields:
            form.fields[i].queryset = form.fields[i].queryset.order_by('-id')
        return form

    class Meta:
        abstract = True

#Admin views
def admin(request, *args, **kwargs):
    return render(request, 'adm/admin.html')

class CharacterListView(GenericListView):
    model = Character
    template_name = 'adm/character_list.html'

class CharacterFormView(GenericFormView):
    model = Character
    success_url = reverse_lazy('app:character-list')
    inv_fields = ['region','boss','local_specialty','common','book',
                  'weekly_drop']
    img_fields = ['char','ban','element','weapon_type','region','boss',
                'local_specialty','common','book','weekly_boss','weekly_drop']

    class Meta:
        abstract = True

class CharacterCreateView(CharacterFormView, CreateView): pass
class CharacterUpdateView(CharacterFormView, UpdateView): pass

class WeaponListView(GenericListView):
    model = Weapon
    template_name = 'adm/weapon_list.html'

class WeaponFormView(GenericFormView):
    model = Weapon
    success_url = reverse_lazy('app:weapon-list')
    inv_fields = ['trophy','elite','common']
    img_fields = ['wpn','weapon_type','trophy','elite','common']

    class Meta:
        abstract = True

class WeaponCreateView(WeaponFormView, CreateView): pass
class WeaponUpdateView(WeaponFormView, UpdateView): pass

class BossListView(GenericListView):
    model = Boss
    template_name = 'adm/boss_list.html'

class BossFormView(GenericFormView):
    model = Boss
    success_url = reverse_lazy('app:boss-list')
    img_fields = ['code']

    class Meta:
        abstract = True

class BossCreateView(BossFormView, CreateView): pass
class BossUpdateView(BossFormView, UpdateView): pass

class EnemyListView(GenericListView):
    model = Enemy
    template_name = 'adm/enemy_list.html'

class EnemyFormView(GenericFormView):
    model = Enemy
    success_url = reverse_lazy('app:enemy-list')
    img_fields = ['low','mid','high']

    class Meta:
        abstract = True

class EnemyCreateView(EnemyFormView, CreateView): pass
class EnemyUpdateView(EnemyFormView, UpdateView): pass

class LocalSpecialtyListView(GenericListView):
    model = LocalSpecialty
    template_name = 'adm/localspecialty_list.html'

class LocalSpecialtyFormView(GenericFormView):
    model = LocalSpecialty
    success_url = reverse_lazy('app:localspecialty-list')
    inv_fields = ['region']
    img_fields = ['name']

    class Meta:
        abstract = True

class LocalSpecialtyCreateView(LocalSpecialtyFormView, CreateView): pass
class LocalSpecialtyUpdateView(LocalSpecialtyFormView, UpdateView): pass

class WeeklyBossListView(GenericListView):
    model = WeeklyBoss
    template_name = 'adm/weeklyboss_list.html'

class WeeklyBossFormView(GenericFormView):
    model = WeeklyBoss
    success_url = reverse_lazy('app:weeklyboss-list')
    img_fields = ['code']

    class Meta:
        abstract = True

class WeeklyBossCreateView(WeeklyBossFormView, CreateView): pass
class WeeklyBossUpdateView(WeeklyBossFormView, UpdateView): pass

class WeeklyDropListView(GenericListView):
    model = WeeklyDrop
    template_name = 'adm/weeklydrop_list.html'

class WeeklyDropFormView(GenericFormView):
    model = WeeklyDrop
    success_url = reverse_lazy('app:weeklydrop-list')
    inv_fields = ['weekly_boss']
    img_fields = ['code']

    class Meta:
        abstract = True

class WeeklyDropCreateView(WeeklyDropFormView, CreateView): pass
class WeeklyDropUpdateView(WeeklyDropFormView, UpdateView): pass

class RegionListView(GenericListView):
    model = Region
    template_name = 'adm/region_list.html'

class RegionFormView(GenericFormView):
    model = Region
    success_url = reverse_lazy('app:region-list')
    img_fields = ['code']

    class Meta:
        abstract = True

class RegionCreateView(RegionFormView, CreateView): pass
class RegionUpdateView(RegionFormView, UpdateView): pass

class BookListView(GenericListView):
    model = Book
    template_name = 'adm/book_list.html'

class BookFormView(GenericFormView):
    model = Book
    success_url = reverse_lazy('app:book-list')
    inv_fields = ['region']
    img_fields = ['2','3','4']

    class Meta:
        abstract = True

class BookCreateView(BookFormView, CreateView): pass
class BookUpdateView(BookFormView, UpdateView): pass

class TrophyListView(GenericListView):
    model = Trophy
    template_name = 'adm/trophy_list.html'

class TrophyFormView(GenericFormView):
    model = Trophy
    success_url = reverse_lazy('app:trophy-list')
    inv_fields = ['region']
    img_fields = ['n2','n3','n4','n5']

    class Meta:
        abstract = True

class TrophyCreateView(TrophyFormView, CreateView): pass
class TrophyUpdateView(TrophyFormView, UpdateView): pass
