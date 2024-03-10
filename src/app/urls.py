from django.urls import path
from .views import *

app_name = 'app'
urlpatterns = [
    path('', test, name='home'),
    path('domains/', test, name='domains'), #index
    path('dashboard/', dashboard, name='dashboard'),
    path('dashboard/<str:category>/', dashboard_detail, name='dashboard-detail'),
    path('inventory/', inventory, name='inventory'),
    path('planner/', test, name='planner'),
    path('planner/<str:category>/', test, name='planner-detail'),
    path('characters/', test, name='characters'),
    path('characters/<str:name>', test, name='characters-detail'),
    path('weapons/', test, name='weapons'),
    path('weapons/<str:name>', test, name='weapons-detail'),
    path('compare/', test, name='compare'),
    path('data/', test, name='data'),
]
