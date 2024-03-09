from django.urls import path
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns
from .views import *

router = routers.SimpleRouter()
router.register(r'image', ImageViewSet)
router.register(r'character', CharacterViewSet)
router.register(r'weapon', WeaponViewSet)

app_name = 'api'
urlpatterns = [
    path('profile/<str:pk>/', ProfileView.as_view(), name='profile-detail'),
    path('constant/', ConstantView.as_view(), name='constant'),
    path('master/', MasterView.as_view(), name='master'),
]

urlpatterns = format_suffix_patterns(urlpatterns)

urlpatterns += router.urls
