from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.core.paginator import Paginator
from django.views.decorators.http import require_http_methods

from .models import User, Posting
from .utils import PostForm

def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    
@csrf_exempt
@login_required
def create_post(request):
    print(request.method)
    if request.method == 'POST':
        print("aja si es un post")
        form = PostForm(request.POST)  
        if form.is_valid():
            creator = request.user
            description = form.cleaned_data["description"]  
            Posting.objects.create(creator=creator, description=description) # DATABASE POSTing
            print("funciona")
            return JsonResponse({"message": "Post created successfully."}, status=201)
            
        return HttpResponseRedirect(reverse("index"))
    
    elif request.method == 'GET':
        posts = Posting.objects.all()
        return JsonResponse([post.serialize() for post in posts], safe=False)
    else:       
        return JsonResponse({"error": "Invalid form."}, status=400)

@login_required
def allpost(request, allpost):
    
    # Filter emails returned based on allpost
    if allpost == "index":
        posteos = Posting.objects.all(
            
        )
    elif allpost == "profile":
        posteos = Posting.objects.filter(
            creator = request.user
        )
    elif allpost == "following":
        posteos = Posting.objects.filter(
         creator=request.user, 
        )
    else:
        return JsonResponse({"error": "Invalid allpost."}, status=400)

    # Return posteos in reverse chronologial order
    posteos = posteos.order_by("-timestamp").all()
    
    paginator = Paginator(posteos, 10)

    
    page_number = request.GET.get('page', 1)

    
    page = paginator.get_page(page_number)
    posteos = page.object_list

    return JsonResponse([publi.serialize() for publi in posteos], safe=False)


@csrf_exempt
@login_required
def publi(request, publi_id):

    # Query for requested publi
    try:
        publi = Posting.objects.get(user=request.user, pk=publi_id)
    except Posting.DoesNotExist:
        return JsonResponse({"error": "post not found."}, status=404)

    # Return email contents
    if request.method == "GET":
        return JsonResponse(publi.serialize())

   
    # Email must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)
    

@login_required
def user_post(request, username):
    user = User.objects.get(username=username)
    posteos = Posting.objects.filter(
        creator = user
    )
    posteos = posteos.order_by("-timestamp").all()

    paginator = Paginator(posteos, 10)

    
    page_number = request.GET.get('page', 1)

    
    page = paginator.get_page(page_number)
    posteos = page.object_list

    return JsonResponse([publi.serialize() for publi in posteos], safe=False)

@login_required
def profile(request,username):
    
    return render(request, "network/profile.html", {
        "profile_username": username
    }) 

@login_required
def following_posts(request):
    user = request.user
    following_users = user.following.all()
    posteos = Posting.objects.filter(creator__in=following_users)
    posteos = posteos.order_by("-timestamp").all()
    paginator = Paginator(posteos, 10)

    
    page_number = request.GET.get('page', 1)

    
    page = paginator.get_page(page_number)
    posteos = page.object_list

    return JsonResponse([publi.serialize() for publi in posteos], safe=False)


@login_required
def following(request):
    return render(request, "network/following.html", {
    })

@csrf_exempt
@login_required
def toggle_follow(request, username):
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)

    user_to_follow = User.objects.get(username=username)
    if request.user in user_to_follow.followers.all():
        user_to_follow.followers.remove(request.user)
        return JsonResponse({"following": False})
    else:
        user_to_follow.followers.add(request.user)
        return JsonResponse({"following": True})
@csrf_exempt    
@login_required
def is_following(request, username):
    user_to_check = User.objects.get(username=username)
    is_following = request.user in user_to_check.followers.all()
    return JsonResponse({"following": is_following})


@csrf_exempt
@login_required
def get_follow_counts(request, username):
    user = User.objects.get(username=username)
    num_followers = user.followers.count()
    num_following = user.following.count()
    return JsonResponse({"followers": num_followers, "following": num_following})



@csrf_exempt
@login_required
def toggle_like(request, publi_id):
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)

    post_to_like = Posting.objects.get(id=publi_id)
    if request.user in post_to_like.likes.all():
        post_to_like.likes.remove(request.user)
        post_to_like.likes_count -= 1
        post_to_like.save()
        return JsonResponse({"like": False, "likes": post_to_like.likes_count })
    else:
        post_to_like.likes.add(request.user)
        post_to_like.likes_count += 1
        post_to_like.save()
        return JsonResponse({"like": True, "likes": post_to_like.likes_count})

@csrf_exempt    
@login_required
def is_liked(request, publi_id):
    post_to_check = Posting.objects.get(id=publi_id)
    is_liked = request.user in post_to_check.likes.all()
    likes_count = post_to_check.likes_count
    return JsonResponse({"like": is_liked, "likes": likes_count}, status = 200)

@login_required
@csrf_exempt
@require_http_methods(["PUT"])
def update_post(request, publi_id):
  post = Posting.objects.get(id=publi_id)
  if request.user != post.creator:
    return JsonResponse({"error": "Not authorized."}, status=401)
  
  data = json.loads(request.body)
  new_content = data.get("content")
  
  post.description = new_content
  post.save()
  
  return JsonResponse(post.serialize())