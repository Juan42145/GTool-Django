from .models import *

# Helper
def encode(model, obj_upper = False, field_upper = True):
    dict={}
    for obj in model.objects.all():
        prop = {}
        for field in obj._meta.fields:
            field_name = field.name.upper() if field_upper else field.name
            if field_name.upper() == 'NAME': continue
            value = getattr(obj, field.name)
            prop[field_name] = value if not isinstance(value, models.Model) else value.name
        obj_name = obj.name.upper() if obj_upper else obj.name
        dict[obj_name] = prop
    return dict

# Custom serializers
def master():
    dict = {}
    def serialize(cls, code = None, property = 'serialize', id = 'name'):
        code = code or str(cls._meta.verbose_name_plural).upper().replace(' ','_')
        data = {}
        for obj in cls.objects.all():
            data[getattr(obj, id)] = getattr(obj, property)
        dict[code] = data
    
    serialize(Element)
    serialize(Element, 'GEMS', 'serialize_gem')
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
    return dict

def characters():
    return encode(Character)

def weapons():
    return encode(Weapon)

def get_database():
    return {
        'CHARACTERS': characters(),
        'WEAPONS': weapons(),
        'MASTER': master(),
    }
