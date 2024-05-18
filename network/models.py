from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers')

class Posting(models.Model):
    description = models.TextField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_posts')
    likes_count = models.IntegerField(default=0)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)

    def serialize(self):
        return {
        "id": self.id,
        "description": self.description,
        "timestamp": self.timestamp.strftime("%b %#d %Y, %#I:%M %p"),
        
        "creator": self.creator.username,
    }

