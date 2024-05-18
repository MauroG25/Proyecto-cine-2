from django.contrib import admin

from .models import  User,Posting

# Register your models here.
admin.site.register(Posting)
admin.site.register(User)