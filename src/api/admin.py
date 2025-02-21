from django.contrib import admin
from .admin_site import *
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
register(Character, 'app', admin_class=CharacterAdmin) 
register(Weapon, 'app', admin_class=WeaponAdmin)

register_app('dynamic', 2)
register(LocalSpecialty, 'dynamic', 1, LSAdmin)
register(Boss, 'dynamic', 2, SimpleAdmin)
register(Enemy, 'dynamic', 3, EnemyAdmin)
register(WeeklyBoss, 'dynamic', 4, SimpleAdmin)
register(WeeklyDrop, 'dynamic', 5, WDAdmin)

register_app('regional', 3)
register(Region, 'regional', 1, SimpleAdmin)
register(Book, 'regional', 2, BookAdmin)
register(Trophy, 'regional', 3, TrophyAdmin)

register_app('static', 4)
register(Element, 'static', 1, ElementAdmin)
register(Stat, 'static', 2, StatAdmin)
register(Model, 'static', 3)
register(WeaponType, 'static', 4, SimpleAdmin)
register(Resource, 'static', 5)

register_app('image', 5)
register(Image, 'image', admin_class=ImageAdmin)

register_app('singleton', 6)
register(Constant, 'singleton', admin_class=SingletonAdmin)

