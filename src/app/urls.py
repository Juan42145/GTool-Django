from django.urls import path
from .views import *

app_name = 'app'
urlpatterns = [
    path('', home, name='home'),
    path('domains/', test, name='domains'), #index No login
    path('dashboard/', dashboard, name='dashboard'),
    path('inventory/', inventory, name='inventory'),
    path('planner/', planner, name='planner'),
    path('planner/<str:kind>/<str:name>/', planner_detail, name='planner-detail'),
    path('characters/', characters, name='characters'),
    path('characters/<str:name>/', character_detail, name='character-detail'), #MODEL
    path('weapons/', weapons, name='weapons'),
    path('weapons/<str:name>/', weapon_detail, name='weapons-detail'), #MODEL
    path('compare/', compare, name='compare'), #Potential no Login
    path('data/', data, name='data'), #Potential no login
    
    # CREATE/UPDATE (MODEL)
    #no login views (more work)
    # CREATE/UPDATE (Master/ in inventory or new page well see)
]
