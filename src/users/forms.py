from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm as CreationForm
from .models import *

class UserCreationForm(CreationForm):
	email = forms.EmailField()

	class Meta:
		model = User
		fields = ['username', 'email', 'password1', 'password2']

class UserUpdateForm(forms.ModelForm):
	# traveler = forms.CharField()

	class Meta:
		model = User
		fields = ['username', 'email']

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		# self.fields['traveler'] = forms.CharField(label='Traveler', widget=forms.RadioSelect(choices=[('M','Aether'),('F','Lumine')]),initial=self.instance.data.traveler)
		
class ProfileUpdateForm(forms.ModelForm):
	class Meta:
		model = Profile
		fields = ['data']