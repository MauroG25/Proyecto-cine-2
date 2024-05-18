
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    # API Routes index
    path("createpost", views.create_post, name="create_post"),
    path("createpost/<int:publi_id>", views.publi, name="publi"),
    path("createpost/<str:allpost>", views.allpost, name="allpost"),
    #API routes profile
    path("profile", views.profile, name='profile'),
    path('profile/<str:username>/', views.profile, name='profile'),
    path('user_post/<str:username>/', views.user_post, name='user_post'),
    #API routes following
    path('following_posts/', views.following_posts, name='following_posts'),
    path("following", views.following, name= 'following'),
    path("get_follow_counts/<str:username>/", views.get_follow_counts, name="get_follow_counts"),
    #How to follow
    path('toggle_follow/<str:username>/', views.toggle_follow, name='toggle_follow'),
    path('is_following/<str:username>/', views.is_following, name='is_following'),
    #like api
    path('toggle_like/<int:publi_id>/', views.toggle_like, name='toggle_like'),#change it
    path('is_liked/<int:publi_id>/', views.is_liked, name='is_liked'),
    #editpost
    path('update_post/<int:publi_id>', views.update_post, name='update_post'),
]
