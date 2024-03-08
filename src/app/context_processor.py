from django.forms.models import model_to_dict

from .models import *
from .serializers import *

# Custom context processor
def custom_context(request):
    return{
        'nav': {
            'Test': 'app:test',
            'Dashboard': 'app:dashboard',
            # 'HOME': '../home/home.html',
            # 'INVENTORY': '../inventory/inventory.html', #Both
            # 'FARMING': '../farming/farming.html', #Both
            # 'CHARACTERS': '../characters/characters.html',
            # 'WEAPONS': '../weapons/weapons.html',
            # 'COMPARE': '../compare/compare.html',
            # 'DOMAINS': '../domains/domains.html',
            # 'DATA': '../data/data.html',
        },
        'json_context': {
            'DB': get_database(),
            'IMAGE': encode(Image, obj_upper=True, field_upper=False),
            'STATIC': model_to_dict(Constant.load()),
        },
    }