from django.urls import path
from .views import *

app_name = 'app'
urlpatterns = [
    path('', home, name='home'),
    path('dashboard/', dashboard, name='dashboard'),
    path('inventory/', inventory, name='inventory'),
    path('planner/', planner, name='planner'),
    path('planner/<str:kind>/<str:name>/', planner_detail, name='planner-detail'),
    path('characters/', characters, name='characters'),
    path('characters/<str:name>/', character_detail, name='character-detail'), #MODEL
    path('weapons/', weapons, name='weapons'),
    path('weapons/<str:name>/', weapon_detail, name='weapons-detail'), #MODEL
    path('compare/', compare, name='compare'), #Potential no Login
    path('data/', data, name='data'),
    
    # CRUDs
    path('adm/', admin, name='admin'),
    path('adm/character/', CharacterListView.as_view(), name='character-list'),
    path('adm/character/new/', CharacterCreateView.as_view(), name='character-create'),
    path('adm/character/<int:pk>/', CharacterUpdateView.as_view(), name='character-update'),
    path('adm/weapon/', WeaponListView.as_view(), name='weapon-list'),
    path('adm/weapon/new/', WeaponCreateView.as_view(), name='weapon-create'),
    path('adm/weapon/<int:pk>/', WeaponUpdateView.as_view(), name='weapon-update'),
]
