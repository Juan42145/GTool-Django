from rest_framework import serializers
from users.models import Profile
from .models import *

# Custom fields
class CustomRelatedField(serializers.RelatedField):
    def to_representation(self, value):
        return str(value)

# Abstract Serializer
class FormatSerializer(serializers.ModelSerializer):
    is_name_upper = False
    serializer_related_field = CustomRelatedField

    def to_representation(self, instance):
        dictionary = super().to_representation(instance)
        name = dictionary.pop('name').upper() if self.is_name_upper else dictionary.pop('name')
        return {name: {k.upper(): v for k, v in dictionary.items()}}

# Serializers
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class CharacterSerializer(FormatSerializer):
    weekly_boss = serializers.SerializerMethodField()

    class Meta:
        fields = '__all__'
        model = Character

    def get_weekly_boss(self, obj):
        return obj.weekly_boss.name if obj.weekly_drop else ''

class WeaponSerializer(FormatSerializer):
    class Meta:
        model = Weapon
        fields = '__all__'

class ImageSerializer(FormatSerializer):
    is_name_upper = True
    class Meta:
        model = Image
        fields = '__all__'
