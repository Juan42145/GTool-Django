#Custom context processor

def custom_context(request):
	return{
		'nav': {
			'Home': 'app:home',
			'Copy': 'app:copy',
			# 'HOME': '../home/home.html',
			# 'INVENTORY': '../inventory/inventory.html',
			# 'FARMING': '../farming/farming.html',
			# 'CHARACTERS': '../characters/characters.html',
			# 'WEAPONS': '../weapons/weapons.html',
			# 'COMPARE': '../compare/compare.html',
			# 'DOMAINS': '../domains/domains.html',
			# 'DATA': '../data/data.html',
		}
	}