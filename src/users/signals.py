from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Data

@receiver(post_save, sender=User)
def create_data(sender, instance, created, **kwargs):
	if created:
		Data.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_data(sender, instance, created, **kwargs):
	print('data also saved')
	instance.data.save()