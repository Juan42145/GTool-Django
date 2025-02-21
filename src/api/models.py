from django.db import models
from .models_abstracts import *

# Create your models here.

# Simple Models
class Element(SimpleModel):
    gem = models.CharField(max_length=50)
    inv_order = models.PositiveSmallIntegerField()

    @property
    def code(self):
        return self.name
    
    @property
    def serialize_gem(self):
        return {
            '2': f'{self.gem} Sliver',
            '3': f'{self.gem} Fragment',
            '4': f'{self.gem} Chunk',
            '5': f'{self.gem} Gemstone',
        }

class Boss(SimpleModel):
    rarity = '4'

    class Meta:
        verbose_name_plural = 'bosses'

class Stat(SimpleModel):
    is_weapon_stat = models.BooleanField()

    @property
    def code(self):
        return self.name

class Model(SimpleModel):
    @property
    def code(self):
        return self.name

class Region(SimpleModel):
    pass

class LocalSpecialty(SimpleModel):
    region = models.ForeignKey(Region, on_delete=models.PROTECT)
    inv_order = models.PositiveSmallIntegerField()
    rarity = '1'

    @property
    def code(self):
        return self.name

    @property
    def serialize(self):
        return dict(super().serialize, data=self.region.name)

    class Meta:
        verbose_name_plural = 'local specialties'

class WeeklyBoss(SimpleModel):
    class Meta:
        verbose_name_plural = 'weekly bosses'

class WeeklyDrop(SimpleModel):
    weekly_boss = models.ForeignKey(WeeklyBoss, on_delete=models.PROTECT)
    rarity = '5'

    @property
    def serialize(self):
        return dict(super().serialize, data=self.weekly_boss.name)

class WeaponType(SimpleModel):
    pass


# Regular Models
class Resource(models.Model):
    name = models.CharField(max_length=50, unique=True)
    n1 = models.CharField(max_length=50, blank=True, null=True)
    n2 = models.CharField(max_length=50, blank=True, null=True)
    n3 = models.CharField(max_length=50, blank=True, null=True)
    n4 = models.CharField(max_length=50, blank=True, null=True)

    @property
    def serialize(self):
        dict = {}
        if self.n1:
            dict['1'] = self.n1
        if self.n2:
            dict['2'] = self.n2
        if self.n3:
            dict['3'] = self.n3
        if self.n4:
            dict['4'] = self.n4
        return dict

    def __str__(self):
        return self.name

class Enemy(models.Model):
    name = models.CharField(max_length=50, unique=True)
    low = models.CharField(max_length=50)
    mid = models.CharField(max_length=50)
    high = models.CharField(max_length=50)
    is_elite = models.BooleanField(default=True)

    @property
    def serialize(self):
        if self.is_elite:
            return {
                '2': self.low,
                '3': self.mid,
                '4': self.high,
            }
        else:
            return {
                '1': self.low,
                '2': self.mid,
                '3': self.high,
            }

    class Meta:
        verbose_name_plural = 'enemies'

    def __str__(self):
        return self.name

class Book(models.Model):
    name = models.CharField(max_length=50, unique=True)
    region = models.ForeignKey(Region, on_delete=models.PROTECT)

    @property
    def serialize(self):
        return {
            '2': f'Teachings of {self.name}',
            '3': f'Guide to {self.name}',
            '4': f'Philosophies of {self.name}',
            'data': self.region.name
        }

    def __str__(self):
        return self.name

class Trophy(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50)
    n2 = models.CharField(max_length=50)
    n3 = models.CharField(max_length=50)
    n4 = models.CharField(max_length=50)
    n5 = models.CharField(max_length=50)
    insert_code = models.BooleanField()
    region = models.ForeignKey(Region, on_delete=models.PROTECT)

    @property
    def serialize(self):
        if self.insert_code:
            return {
                '2': self.n2.replace('*',self.code),
                '3': self.n3.replace('*',self.code),
                '4': self.n4.replace('*',self.code),
                '5': self.n5.replace('*',self.code),
                'data': self.region.name
            }
        else:
            return {
                '2': self.code.replace('*',self.n2),
                '3': self.code.replace('*',self.n3),
                '4': self.code.replace('*',self.n4),
                '5': self.code.replace('*',self.n5),
                'data': self.region.name
            }

    class Meta:
        verbose_name_plural = 'trophies'

    def __str__(self):
        return self.name

class Character(models.Model):
    name = models.CharField(max_length=50, unique=True)
    version = models.DecimalField(max_digits=3, decimal_places=1)
    rarity = models.PositiveSmallIntegerField(choices=[(4,4),(5,5)])
    model = models.ForeignKey(Model, on_delete=models.PROTECT)
    element = models.ForeignKey(Element, on_delete=models.PROTECT)
    weapon_type = models.ForeignKey(WeaponType, on_delete=models.PROTECT)
    region = models.ForeignKey(Region, on_delete=models.PROTECT)
    boss = models.ForeignKey(Boss, on_delete=models.PROTECT, blank=True, null=True)
    local_specialty = models.ForeignKey(LocalSpecialty, on_delete=models.PROTECT)
    common = models.ForeignKey(Enemy, on_delete=models.PROTECT, limit_choices_to={"is_elite": False})
    book = models.ForeignKey(Book, on_delete=models.PROTECT,blank=True, null=True)
    weekly_drop = models.ForeignKey(WeeklyDrop, on_delete=models.PROTECT, blank=True, null=True)
    stat_hp = models.PositiveSmallIntegerField()
    stat_atk = models.PositiveSmallIntegerField()
    stat_def = models.PositiveSmallIntegerField()
    stat = models.ForeignKey(Stat, on_delete=models.PROTECT)
    stat_value = models.DecimalField(max_digits=5, decimal_places=2)

    @property
    def weekly_boss(self):
        return self.weekly_drop.weekly_boss if self.weekly_drop else ''

    def __str__(self):
        return self.name

class Weapon(models.Model):
    name = models.CharField(max_length=50, unique=True)
    version = models.DecimalField(max_digits=3, decimal_places=1)
    is_wish_only = models.BooleanField(default=True)
    rarity = models.PositiveSmallIntegerField(choices=[(4,4),(5,5)])
    max = models.PositiveSmallIntegerField(choices=[(0,''),(1,1)], default=0)
    weapon_type = models.ForeignKey(WeaponType, on_delete=models.PROTECT)
    trophy = models.ForeignKey(Trophy, on_delete=models.PROTECT)
    elite = models.ForeignKey(Enemy, on_delete=models.PROTECT, limit_choices_to={"is_elite": True}, related_name='elite')
    common = models.ForeignKey(Enemy, on_delete=models.PROTECT, limit_choices_to={"is_elite": False}, related_name='common')
    stat_atk = models.PositiveSmallIntegerField()
    stat = models.ForeignKey(Stat, on_delete=models.PROTECT, limit_choices_to={"is_weapon_stat": True})
    stat_value = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return self.name

class Image(models.Model):
    name = models.CharField(max_length=50, unique=True)
    url = models.CharField(max_length=100)
    format = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.name


# Singleton Models
class Constant(SingletonModel):
    calculation_data = models.JSONField(blank=True, null=True)
    drop_rates = models.JSONField(blank=True, null=True)
