from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, generics, permissions, response, views

from .serializers import *
from users.models import Profile
from .models import *

class IsUser(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class DictViewSet(viewsets.ReadOnlyModelViewSet):
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        dictionary = {}
        for d in response.data:
            dictionary.update(d)
        response.data = dictionary
        return response

# Create your views here.
class MasterView(views.APIView):
    def get(self, request, format=None):
        dict = {}
        def serialize(cls, property = 'serialize', code = None, queryset = None, id = 'name'):
            code = code or str(cls._meta.verbose_name_plural).upper().replace(' ','_')
            queryset = queryset or cls.objects.all()
            data = {}
            for obj in queryset:
                data[getattr(obj, id)] = getattr(obj, property)
            dict[code] = data
        
        serialize(Element)
        serialize(Element, 'serialize_gem', 'GEMS', Element.objects.exclude(name="-").order_by('inv_order'))
        serialize(WeaponType)
        serialize(Region)
        serialize(Boss)
        serialize(LocalSpecialty)
        serialize(Enemy)
        serialize(Book)
        serialize(WeeklyBoss)
        serialize(WeeklyDrop)
        serialize(Trophy)
        serialize(Resource)
        serialize(Stat)
        serialize(Model)
        return response.Response(dict)

class ConstantView(views.APIView):
    def get(self, request, format=None):
        data = ConstantSerializer(Constant.load()).data
        data.pop('id')
        return response.Response(data)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAdminUser | IsUser]
    queryset = Profile.objects.all()

class CharacterViewSet(DictViewSet):
    serializer_class = CharacterSerializer
    queryset = Character.objects.all()

class WeaponViewSet(DictViewSet):
    serializer_class = WeaponSerializer
    queryset = Weapon.objects.all()

class ImageViewSet(DictViewSet):
    serializer_class = ImageSerializer
    queryset = Image.objects.all()
