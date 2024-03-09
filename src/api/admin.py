from django.contrib import admin
from .admin_class import *
from .models import *

# Register auth models in custom admin
from django.contrib.auth.admin import UserAdmin, GroupAdmin
from django.contrib.auth.models import Group, User
register_app('authentication and authorization', -1)
admin.site.register(Group,GroupAdmin)
admin.site.register(User,UserAdmin)

# Register your models here.
register_app('app', 1)
register(Character, 'app')
register(Weapon, 'app')

register_app('dynamic', 2)
register(LocalSpecialty, 'dynamic', 1)
register(Boss, 'dynamic', 2)
register(Enemy, 'dynamic', 3)
register(WeeklyBoss, 'dynamic', 4)
register(WeeklyDrop, 'dynamic', 5)

register_app('regional', 3)
register(Region, 'regional', 1)
register(Book, 'regional', 2)
register(Trophy, 'regional', 3)

register_app('static', 4)
register(Element, 'static', 1)
register(Stat, 'static', 2)
register(Model, 'static', 3)
register(WeaponType, 'static', 4)
register(Resource, 'static', 5)

register_app('image', 5)
register(Image, 'image', admin_class=ImageAdmin)

register_app('singleton', 6)
register(Constant, 'singleton', admin_class=SingletonAdmin)

