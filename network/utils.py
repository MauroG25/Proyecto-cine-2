from django.forms import ModelForm
from django import forms



class PostForm(forms.Form):  
    description = forms.CharField(widget=forms.Textarea(attrs={'rows':'5', 'cols':'50'}))
    likes = forms.IntegerField(initial=0, required=False)