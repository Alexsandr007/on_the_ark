import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.conf import settings
import random
import string
from user.models import CustomUser
from post.models import Like, Media, Post
from .forms import RegisterForm, LoginForm, PasswordResetForm, AboutForm, GoalForm
from .models import CustomUser, UserGoal, UserSocialLinks, UserSession
from django.core.files.storage import default_storage
from django.contrib.sessions.models import Session
from django.utils import timezone

from django.views.decorators.http import require_http_methods
import logging

logger = logging.getLogger(__name__)


def home(request):
    if request.user.is_authenticated:
        return redirect('profile')
    return render(request, 'user/homePage.html', {
        'register_form': RegisterForm(),
        'login_form': LoginForm(),
        'reset_form': PasswordResetForm(),
    })

@login_required
def change_profile(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        phone = request.POST.get('phone')
        email = request.POST.get('email')
        
        user = request.user
        user.username = username
        user.phone = phone
        
        if email != user.email:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            if User.objects.filter(email=email).exclude(pk=user.pk).exists():
                messages.error(request, 'Этот email уже используется другим пользователем.')
            else:
                user.email = email
                user.save()
                messages.success(request, 'Профиль успешно обновлен!')
        else:
            user.save()
            messages.success(request, 'Профиль успешно обновлен!')


        
        return redirect('change_profile')
    user_sessions = UserSession.objects.filter(
    user=request.user
    ).order_by('-last_activity')
    
    # Помечаем текущую сессию
    current_session_key = request.session.session_key
    for session in user_sessions:
        session.is_current = (session.session_key == current_session_key)
    
    context = {
        'user_sessions': user_sessions,
        'current_session_key': current_session_key
    }

    return render(request, 'user/profile/settings/settingsProfile.html', context)


@login_required
def agree_privacy_policy(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            data = json.loads(request.body)
            agree = data.get('agree', False)
            
            if agree:
                user = request.user
                user.privacy_policy_agreed = True
                user.save()
                
                return JsonResponse({
                    'success': True, 
                    'message': 'Согласие с политикой конфиденциальности принято!'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Необходимо согласиться с политикой конфиденциальности'
                }, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Ошибка обработки данных'
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'message': 'Метод не разрешен'
    }, status=405)


@login_required
def update_social_links(request):
    """Обработка AJAX запроса для обновления социальных ссылок"""
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            data = json.loads(request.body)
            
            # Получаем или создаем объект социальных ссылок для пользователя
            social_links, created = UserSocialLinks.objects.get_or_create(user=request.user)
            
            # Обновляем поля
            social_links.tiktok = data.get('tiktok', '')
            social_links.youtube = data.get('youtube', '')
            social_links.vk = data.get('vk', '')
            social_links.b = data.get('b', '')
            social_links.website = data.get('website', '')
            
            social_links.save()
            
            return JsonResponse({
                'success': True, 
                'message': 'Социальные ссылки успешно обновлены!'
            })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Ошибка обработки данных'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Произошла ошибка: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Метод не разрешен'
    }, status=405)


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
    posts = Post.objects.filter(author=user, published_at__isnull=False).prefetch_related(
        'likes'
    ).order_by('-published_at')
    
    # Получаем ID всех постов, которые лайкнул текущий пользователь
    liked_post_ids = Like.objects.filter(
        user=request.user, 
        post__in=posts
    ).values_list('post_id', flat=True)
    
    liked_post_ids_set = set(liked_post_ids)
    
    # Добавляем флаг is_liked_by_current_user к каждому посту
    for post in posts:
        post.is_liked_by_current_user = post.id in liked_post_ids_set
        # Просто загружаем медиа для каждого поста
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


@login_required
@require_http_methods(["POST"])
def terminate_sessions(request):
    try:
        # Проверяем, что это AJAX запрос
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'error',
                'message': 'Разрешены только AJAX запросы'
            }, status=400)
        
        current_session_key = request.session.session_key
        
        # Получаем данные из AJAX запроса
        try:
            data = json.loads(request.body)
            selected_session_keys = data.get('selected_sessions', [])
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Неверный формат JSON'
            }, status=400)
        
        # Проверяем, что не пытаемся удалить текущую сессию
        if current_session_key in selected_session_keys:
            selected_session_keys.remove(current_session_key)
        
        if not selected_session_keys:
            return JsonResponse({
                'status': 'error',
                'message': 'Не выбраны сессии для завершения'
            }, status=400)
        
        # Удаляем только выбранные сессии
        sessions_to_delete = UserSession.objects.filter(
            user=request.user,
            session_key__in=selected_session_keys
        ).exclude(session_key=current_session_key)
        
        deleted_sessions_count = sessions_to_delete.count()
        
        # Удаляем сессии из базы данных Django
        for user_session in sessions_to_delete:
            try:
                Session.objects.get(session_key=user_session.session_key).delete()
            except Session.DoesNotExist:
                pass
        
        # Удаляем записи из нашей модели
        sessions_to_delete.delete()
        
        # Получаем обновленный список сессий
        user_sessions = UserSession.objects.filter(user=request.user).order_by('-last_activity')
        sessions_data = []
        
        for session in user_sessions:
            sessions_data.append({
                'session_key': session.session_key,
                'device_info': session.device_info,
                'location': session.location,
                'ip_address': session.ip_address,
                'last_activity': session.last_activity.strftime('%d.%m.%Y'),
                'is_current': session.session_key == current_session_key
            })
        
        return JsonResponse({
            'status': 'success',
            'message': f'Завершено сессий: {deleted_sessions_count}',
            'sessions': sessions_data,
            'remaining_sessions': len(sessions_data),
            'deleted_count': deleted_sessions_count
        })
        
    except Exception as e:
        import traceback
        print(f"Ошибка в terminate_sessions: {e}")
        print(traceback.format_exc())
        
        return JsonResponse({
            'status': 'error',
            'message': f'Произошла ошибка: {str(e)}'
        }, status=500)

def support(request):
    return render(request, 'user/profile/support.html')

def about_us(request):
    return render(request, 'user/profile/aboutUs.html')

def blog(request):
    return render(request, 'user/profile/blog.html')