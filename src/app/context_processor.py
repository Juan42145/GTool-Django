from .models import *

# Custom context processor
def custom_context(request):
    return{
        'nav': {
            'HOME': 'app:home',
            'DASHBOARD': 'app:dashboard',
            'INVENTORY': 'app:inventory',
            'PLANNER': 'app:planner',
            'CHARACTERS': 'app:characters',
            'WEAPONS': 'app:weapons',
            'WISHING': 'app:wishing',
            'COMPARE': 'app:compare',
            'DATA': 'app:data',
        },
    }