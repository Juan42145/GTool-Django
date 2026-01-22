from django.db import models

class SimpleModel(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50)
    rarity = '0'

    @property
    def serialize(self):
        return {self.rarity: self.code}

    class Meta:
        abstract = True

    def __str__(self):
        return self.name
