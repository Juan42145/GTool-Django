from django.db import models
from django.core.cache import cache

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


class SingletonModel(models.Model):

    class Meta:
        abstract = True
    
    def set_cache(self):
        cache.set(self.__class__.__name__, self)

    def save(self, *args, **kwargs):
        self.pk = 1
        super(SingletonModel, self).save(*args,**kwargs)
        self.set_cache()
    
    @classmethod
    def load(cls):
        if cache.get(cls.__name__) is None:
            obj, created = cls.objects.get_or_create(pk=1)
            if not created:
                obj.set_cache()
        return cache.get(cls.__name__)
