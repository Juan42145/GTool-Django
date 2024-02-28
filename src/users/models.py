from django.db import models
from django.contrib.auth.models import User

# Create your models here.
def data_default():
	return {'characters': {}, 'weapons': {}, 'inventory': {}}

class Data(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	data = models.JSONField(default=data_default)

	traveler = models.CharField(max_length=1, choices=[('M','Aether'),('F','Lumine')], default='M')

	def __str__(self):
		return f'{self.user.username} Data'


def inventory_default():
	return {"default": "default"}