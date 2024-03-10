from .models import *

# Custom context processor
def custom_context(request):
    return{
        'nav': {
            'HOME': 'app:test',
            'DASHBOARD': 'app:dashboard',
            'INVENTORY': 'app:inventory',
            'PLANNER': 'app:planner',
            'CHARACTERS': 'app:characters',
            'WEAPONS': 'app:weapons',
            'COMPARE': 'app:compare',
            'DATA': 'app:data',
        },
    }