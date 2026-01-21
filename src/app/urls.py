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
    path('wishing/', wishing, name='wishing'),
    path('compare/', compare, name='compare'),
    path('data/', data, name='data'),
    
    # CRUDs
    path('adm/', admin, name='admin'),
    
    path('adm/character/', CharacterListView.as_view(), name='character-list'),
    path('adm/character/new/', CharacterCreateView.as_view(), name='character-create'),
    path('adm/character/<int:pk>/', CharacterUpdateView.as_view(), name='character-update'),
    
    path('adm/weapon/', WeaponListView.as_view(), name='weapon-list'),
    path('adm/weapon/new/', WeaponCreateView.as_view(), name='weapon-create'),
    path('adm/weapon/<int:pk>/', WeaponUpdateView.as_view(), name='weapon-update'),
    
    path('adm/boss/', BossListView.as_view(), name='boss-list'),
    path('adm/boss/new/', BossCreateView.as_view(), name='boss-create'),
    path('adm/boss/<int:pk>/', BossUpdateView.as_view(), name='boss-update'),
    
    path('adm/enemy/', EnemyListView.as_view(), name='enemy-list'),
    path('adm/enemy/new/', EnemyCreateView.as_view(), name='enemy-create'),
    path('adm/enemy/<int:pk>/', EnemyUpdateView.as_view(), name='enemy-update'),
    
    path('adm/localspecialty/', LocalSpecialtyListView.as_view(), name='localspecialty-list'),
    path('adm/localspecialty/new/', LocalSpecialtyCreateView.as_view(), name='localspecialty-create'),
    path('adm/localspecialty/<int:pk>/', LocalSpecialtyUpdateView.as_view(), name='localspecialty-update'),
    
    path('adm/weeklyboss/', WeeklyBossListView.as_view(), name='weeklyboss-list'),
    path('adm/weeklyboss/new/', WeeklyBossCreateView.as_view(), name='weeklyboss-create'),
    path('adm/weeklyboss/<int:pk>/', WeeklyBossUpdateView.as_view(), name='weeklyboss-update'),
    
    path('adm/weeklydrop/', WeeklyDropListView.as_view(), name='weeklydrop-list'),
    path('adm/weeklydrop/new/', WeeklyDropCreateView.as_view(), name='weeklydrop-create'),
    path('adm/weeklydrop/<int:pk>/', WeeklyDropUpdateView.as_view(), name='weeklydrop-update'),
    
    path('adm/region/', RegionListView.as_view(), name='region-list'),
    path('adm/region/new/', RegionCreateView.as_view(), name='region-create'),
    path('adm/region/<int:pk>/', RegionUpdateView.as_view(), name='region-update'),
    
    path('adm/book/', BookListView.as_view(), name='book-list'),
    path('adm/book/new/', BookCreateView.as_view(), name='book-create'),
    path('adm/book/<int:pk>/', BookUpdateView.as_view(), name='book-update'),
    
    path('adm/trophy/', TrophyListView.as_view(), name='trophy-list'),
    path('adm/trophy/new/', TrophyCreateView.as_view(), name='trophy-create'),
    path('adm/trophy/<int:pk>/', TrophyUpdateView.as_view(), name='trophy-update'),
]
