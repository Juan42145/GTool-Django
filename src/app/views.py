from django.shortcuts import render

# Create your views here.
def home(request, *args, **kwargs):
	context = {
		
	}
	return render(request, 'app/home.html', context)

def copy(request, *args, **kwargs):
	context = {
		
	}
	return render(request, 'app/home copy.html', context)