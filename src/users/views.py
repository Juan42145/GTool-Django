from django.forms import BaseModelForm
from django.http import HttpResponse
from django.shortcuts import render
from django.urls import reverse_lazy
from django.contrib.auth.models import User
from django.views.generic import CreateView, UpdateView
from .forms import UserCreationForm, UserUpdateForm

# Create your views here.
class UserCreateView(CreateView):
    model = User
    form_class = UserCreationForm
    template_name = 'users/register.html'
    success_url = reverse_lazy('app:home')

class UserUpdateView(UpdateView):
    model = User
    form_class = UserUpdateForm
    template_name = 'users/profile.html'
    success_url = reverse_lazy('user')

    def get_object(self):
        return self.model.objects.get(pk=self.request.user.id) 
    
    def form_valid(self, form):
        form.instance.data.traveler = form.cleaned_data.get('traveler')
        return super().form_valid(form)
    
#userDeleteview 