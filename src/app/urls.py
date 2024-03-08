from django.urls import path
from .views import *

app_name = 'app'
urlpatterns = [
    path('dashboard/', home, name='dashboard'),
    path('test/', test, name='test'),
]
