from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.conf import settings
import random
import string
from user.models import CustomUser
from post.models import Media, Post
from .forms import RegisterForm, LoginForm, PasswordResetForm, AboutForm, GoalForm
from .models import CustomUser, UserGoal
from django.core.files.storage import default_storage

import logging

logger = logging.getLogger(__name__)


def home(request):
    if request.user.is_authenticated:
        return render(request, 'user/profile/profile.html')
    return render(request, 'user/homePage.html', {
        'register_form': RegisterForm(),
        'login_form': LoginForm(),
        'reset_form': PasswordResetForm(),
    })

def register_ajax(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return JsonResponse({'success': True, 'redirect': '/profile/'})
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    return JsonResponse({'success': False})

def login_ajax(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        if form.is_valid():
            user = authenticate(email=form.cleaned_data['username'], password=form.cleaned_data['password'])
            if user:
                login(request, user)
                return JsonResponse({'success': True, 'redirect': '/profile/'})
        return JsonResponse({'success': False, 'errors': {'__all__': ['Неверный email или пароль']}})
    return JsonResponse({'success': False})

def password_reset_ajax(request):
    if request.method == 'POST':
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email'].strip()
            print(f"Email после strip: '{email}' (len={len(email)}, type={type(email)})")
            
            if not email:
                return JsonResponse({'success': False, 'errors': {'email': 'Email не может быть пустым'}})
            
            try:
                user = CustomUser.objects.get(email=email)
                new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
                user.set_password(new_password)
                user.save()
                
                print(f"Перед send_mail: email='{email}' (repr={repr(email)})")
                print(f"From: '{settings.DEFAULT_FROM_EMAIL}'")
                print(f"To: {[email]}")
                
                send_mail(
                    'Восстановление пароля',
                    f'Ваш новый пароль: {new_password}',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                return JsonResponse({'success': True, 'message': 'Новый пароль отправлен на email'})
            except CustomUser.DoesNotExist:
                return JsonResponse({'success': False, 'errors': {'email': 'Пользователь с таким email не найден'}})
            except Exception as e:
                print(f"Ошибка отправки: {str(e)}")
                return JsonResponse({'success': False, 'errors': {'email': f'Ошибка отправки: {str(e)}'}})
        else:
            print(f"Ошибки формы: {form.errors}")
            return JsonResponse({'success': False, 'errors': form.errors})
    return JsonResponse({'success': False})

@login_required
def profile(request):
    user = request.user
    posts = Post.objects.filter(author=user, published_at__isnull=False).order_by('-published_at')
    
    # Добавляем медиа к постам для удобства
    for post in posts:
        post.media_list = Media.objects.filter(post=post)
    
    context = {
        'user': user,
        'posts': posts,
        'posts_count': posts.count(),
    }
    return render(request, 'user/profile/profile.html', context)

def logout_view(request):
    logout(request)
    return redirect('home') 


@login_required
def update_about_ajax(request):
    if request.method == 'POST':
        form = AboutForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return JsonResponse({
                'success': True, 
                'message': 'Информация о себе сохранена',
                'about': request.user.about 
            })
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    return JsonResponse({'success': False})
@login_required
def update_goal_ajax(request):
    if request.method == 'POST':
        goal, created = UserGoal.objects.get_or_create(user=request.user)
        form = GoalForm(request.POST, instance=goal)
        if form.is_valid():
            form.save()
            return JsonResponse({
                'success': True, 
                'message': 'Цель сохранена',
                'goal': {
                    'goal_title': goal.goal_title,
                    'goal_description': goal.goal_description,
                    'goal_amount': goal.goal_amount,
                }
            })
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    return JsonResponse({'success': False})


@login_required
def update_user_settings_ajax(request):
    if request.method == 'POST':
        user = request.user
        field = request.POST.get('field')
        value = request.POST.get('value') == 'true'
        
        if field == 'is_visible':
            user.is_visible = value
        elif field == 'is_author':
            user.is_author = value
        else:
            return JsonResponse({'success': False, 'error': 'Invalid field'})
        
        user.save()
        return JsonResponse({'success': True, 'message': 'Настройки обновлены'})
    
    return JsonResponse({'success': False})


@login_required
def update_profession_ajax(request):
    if request.method == 'POST':
        user = request.user
        profession = request.POST.get('profession', '').strip()
        user.profession = profession
        user.save()
        return JsonResponse({'success': True, 'message': 'Профессия обновлена'})
    return JsonResponse({'success': False})


@login_required
def update_photo_ajax(request):
    if request.method == 'POST' and request.FILES.get('photo'):
        user = request.user
        photo = request.FILES['photo']
        
        if user.photo:
            default_storage.delete(user.photo.path)
        
        user.photo = photo
        user.save()
        return JsonResponse({'success': True, 'photo_url': user.photo.url})
    
    return JsonResponse({'success': False})


@login_required
def update_background_ajax(request):
    if request.method == 'POST' and request.FILES.get('background_photo'):
        user = request.user
        photo = request.FILES['background_photo']

        if user.background_photo:
            default_storage.delete(user.background_photo.path)
        
        user.background_photo = photo
        user.save()
        return JsonResponse({'success': True, 'background_url': user.background_photo.url})
    
    return JsonResponse({'success': False})

def support(request):
    return render(request, 'user/profile/support.html')

def about_us(request):
    return render(request, 'user/profile/aboutUs.html')

def blog(request):
    return render(request, 'user/profile/blog.html')