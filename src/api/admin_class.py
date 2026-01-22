from django.contrib import admin
from django.shortcuts import redirect
from .models import *

# Custom model admin
class BaseAdmin(admin.ModelAdmin):
    search_fields = ["name"]
    actions = None
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "region":
            kwargs["queryset"] = Region.objects.order_by('-id')
        elif db_field.name == "weekly_boss":
            kwargs["queryset"] = WeeklyBoss.objects.order_by('-id')

        elif db_field.name == "boss":
            kwargs["queryset"] = Boss.objects.order_by('-id')
        elif db_field.name == "local_specialty":
            kwargs["queryset"] = LocalSpecialty.objects.order_by('-id')
        elif db_field.name == "common" or db_field.name == "elite":
            kwargs["queryset"] = Enemy.objects.order_by('-id')
        elif db_field.name == "book":
            kwargs["queryset"] = Book.objects.order_by('-id')
        elif db_field.name == "weekly_drop":
            kwargs["queryset"] = WeeklyDrop.objects.order_by('-id')
        
        elif db_field.name == "trophy":
            kwargs["queryset"] = Trophy.objects.order_by('-id')

        return super().formfield_for_foreignkey(db_field, request, **kwargs)

#Simple Models
class SimpleAdmin(BaseAdmin):
    list_display = ["name", "code"]
    list_editable = ["code"]

class ElementAdmin(BaseAdmin):
    list_display = ["name", "id",  "inv_order", "gem"]
    list_editable = ["inv_order"]

class StatAdmin(BaseAdmin):
    list_display = ["name", "is_weapon_stat"]

class LSAdmin(BaseAdmin):
    list_display = ["name", "region", "inv_order"]
    list_editable = ["region", "inv_order"]
    list_filter = ['region']

class WDAdmin(BaseAdmin):
    list_display = ["name", "weekly_boss"]
    list_editable = ["weekly_boss"]

#Regular Models
class EnemyAdmin(BaseAdmin):
    list_display = ["name", "is_elite", "low", "mid", "high"]
    list_editable = ["is_elite", "low", "mid", "high"]

class BookAdmin(BaseAdmin):
    list_display = ["name", "id", "region"]

class TrophyAdmin(BaseAdmin):
    list_display = ["name", "id", "region", "code", "insert_code", "n2", "n3", "n4", "n5"]
    list_editable = ["code", "insert_code", "n2", "n3", "n4", "n5"]

class CharacterAdmin(BaseAdmin):
    list_display = ["name", "id", "version", "rarity", "model", "region", "stat"]
    list_editable = ["version"]
    list_filter = ["version"]

class WeaponAdmin(BaseAdmin):
    list_display = ["name", "id", "version", "is_wish_only", "rarity", "weapon_type", "stat"]
    list_editable = ["version"]
    list_filter = ["version"]

class ImageAdmin(BaseAdmin):
    list_display = ["name", "url", "format"]

class ConstantAdmin(BaseAdmin):
    list_display = ["name", "data"]
    list_editable = ["data"]
