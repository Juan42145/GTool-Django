from django.db import models
from django.contrib.auth.models import User

# Create your models here.
def data_default():
	return {'CHARACTERS': {}, 'WEAPONS': {}, 'INVENTORY': {}}

class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	data = models.JSONField(default=data_default)

	def __str__(self):
		return f'{self.user.username} Profile'