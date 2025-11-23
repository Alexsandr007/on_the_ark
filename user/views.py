import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth import login, authenticate, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.conf import settings
import random
import string
from subscription.models import Subscription
from user.models import CustomUser
from post.models import Like, Media, Post
from .forms import RegisterForm, LoginForm, PasswordResetForm, AboutForm, GoalForm
from .models import CustomUser, UserGoal, UserSocialLinks, UserSession
from django.core.files.storage import default_storage
from django.contrib.sessions.models import Session
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.utils import timezone
from django.db.models import Count

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
        else:
            user.save()



        
        return redirect('change_profile')
    user_sessions = UserSession.objects.filter(
    user=request.user
    ).order_by('-last_activity')
    
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
            
            social_links, created = UserSocialLinks.objects.get_or_create(user=request.user)
            
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


import logging
from smtplib import SMTPException
from django.core.mail import BadHeaderError

# Настройка логгера
logger = logging.getLogger(__name__)
def register_ajax(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            # Создаем пользователя, но не логиним
            user = form.save(commit=False)
            user.is_active = True
            user.email_verified = False
            user.verification_token = get_random_string(50)
            user.verification_sent_at = timezone.now()
            user.save()
            
            # Отправляем email с ссылкой для подтверждения
            verification_url = f"{request.scheme}://{request.get_host()}/verify-email/{user.verification_token}/"
            
            try:
                send_mail(
                    'Подтверждение email для Ковчега',
                    f'Для завершения регистрации перейдите по ссылке: {verification_url}',
                    settings.DEFAULT_FROM_EMAIL,  # ← ИСПОЛЬЗУЙТЕ НАСТРОЙКИ ИЗ settings.py
                    [user.email],
                    fail_silently=False,
                )
                
                # Сохраняем user_id в сессии для повторной отправки
                request.session['pending_verification_user_id'] = user.id
                request.session['pending_verification_email'] = user.email
                
                logger.info(f"Verification email sent successfully to {user.email}")
                
                return JsonResponse({
                    'success': True, 
                    'message': 'show_verification_step',
                    'user_id': user.id,
                    'email': user.email
                })
                
            except Exception as e:
                # Все остальные ошибки
                error_type = type(e).__name__
                logger.error(f"Unexpected error ({error_type}) when sending email to {user.email}: {str(e)}")
                user.delete()
                return JsonResponse({
                    'success': False, 
                    'errors': {'__all__': [f'Ошибка отправки email. Попробуйте позже.']}
                })
                
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    return JsonResponse({'success': False})

def verify_email(request, token):
    """Подтверждение email по токену с немедленным логином и редиректом в ЛК"""
    try:
        user = CustomUser.objects.get(verification_token=token)
        
        # Проверяем, не истекла ли ссылка (24 часа)
        if timezone.now() > user.verification_sent_at + timezone.timedelta(hours=24):
            return render(request, 'verification_expired.html')
        
        # Активируем email и логиним пользователя
        user.email_verified = True
        user.verification_token = ''
        user.save()
        
        # Логиним пользователя
        login(request, user)
        
        # Очищаем сессию
        if 'pending_verification_user_id' in request.session:
            del request.session['pending_verification_user_id']
            del request.session['pending_verification_email']
        
        # Редирект в ЛК
        return redirect('/profile/')
        
    except CustomUser.DoesNotExist:
        return render(request, 'verification_failed.html')

def resend_verification_ajax(request):
    """Повторная отправка verification email для обоих сценариев"""
    if request.method == 'POST':
        # Пробуем получить user_id из сессии (для обоих сценариев)
        user_id = request.session.get('pending_verification_user_id')
        email = request.session.get('pending_verification_email')
        
        if not user_id or not email:
            return JsonResponse({'success': False, 'message': 'Сессия истекла'})
        
        try:
            user = CustomUser.objects.get(id=user_id, email=email)
            
            # Обновляем токен и время
            user.verification_token = get_random_string(50)
            user.verification_sent_at = timezone.now()
            user.save()
            
            # Отправляем email
            verification_url = f"{request.scheme}://{request.get_host()}/verify-email/{user.verification_token}/"
            
            send_mail(
                'Подтверждение email для Ковчега',
                f'Для завершения регистрации перейдите по ссылке: {verification_url}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return JsonResponse({
                'success': True, 
                'message': 'Письмо отправлено повторно! Проверьте вашу почту.'
            })
            
        except CustomUser.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Пользователь не найден'})
    
    return JsonResponse({'success': False, 'message': 'Ошибка запроса'})

def login_ajax(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        if form.is_valid():
            user = authenticate(email=form.cleaned_data['username'], password=form.cleaned_data['password'])
            if user:
                if user.email_verified:
                    # Если email подтвержден - логиним и редиректим в ЛК
                    login(request, user)
                    return JsonResponse({'success': True, 'redirect': '/profile/'})
                else:
                    # Если email не подтвержден - сохраняем в сессии и просим подтвердить
                    request.session['pending_verification_user_id'] = user.id
                    request.session['pending_verification_email'] = user.email
                    
                    # Отправляем письмо подтверждения (если еще не отправляли)
                    if not user.verification_token:
                        user.verification_token = get_random_string(50)
                        user.verification_sent_at = timezone.now()
                        user.save()
                        
                        verification_url = f"{request.scheme}://{request.get_host()}/verify-email/{user.verification_token}/"
                        send_mail(
                            'Подтверждение email для Ковчега',
                            f'Для завершения регистрации перейдите по ссылке: {verification_url}',
                            settings.DEFAULT_FROM_EMAIL,
                            [user.email],
                            fail_silently=False,
                        )
                    
                    return JsonResponse({
                        'success': False, 
                        'email_not_verified': True,
                        'email': user.email,
                        'message': 'Подтвердите ваш email для входа'
                    })
        
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
        'likes', 'comments'
    ).order_by('-published_at')
    
    liked_post_ids = Like.objects.filter(
        user=request.user, 
        post__in=posts
    ).values_list('post_id', flat=True)
    
    liked_post_ids_set = set(liked_post_ids)
    
    post_ids = [post.id for post in posts]
    media_dict = {}
    if post_ids:
        media_objects = Media.objects.filter(post_id__in=post_ids).order_by('id')
        for media in media_objects:
            if media.post_id not in media_dict:
                media_dict[media.post_id] = []
            media_dict[media.post_id].append(media)
    
    for post in posts:
        post.is_liked_by_current_user = post.id in liked_post_ids_set
        post.media_list = media_dict.get(post.id, [])
        post.comments_count = post.comments.count()  
    
    context = {
        'user': user,
        'posts': posts,
        'posts_count': posts.count(),
    }
    return render(request, 'user/profile/profile.html', context)


def personal_account(request, user_id):
    # Находим пользователя по ID
    profile_user = get_object_or_404(get_user_model(), id=user_id)
    
    # Проверяем, авторизован ли пользователь
    is_authenticated = request.user.is_authenticated
    is_own_profile = is_authenticated and (profile_user == request.user)
    
    # Получаем активные подписки текущего пользователя (только для авторизованных)
    user_active_subscriptions = []
    if is_authenticated:
        user_active_subscriptions = list(request.user.user_subscriptions.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).values_list('subscription_id', flat=True))
    
    # Считаем количество подписчиков и подписок
    from subscription.models import UserSubscription
    
    # Количество подписчиков (сколько людей подписано на БЕСПЛАТНУЮ подписку этого автора)
    subscribers_count = UserSubscription.objects.filter(
        subscription__creator=profile_user,
        subscription__price=0,  # Только бесплатная подписка
        is_active=True,
        expires_at__gt=timezone.now()
    ).count()
    
    # Количество подписок (на сколько подписок подписан этот пользователь)
    subscriptions_count = UserSubscription.objects.filter(
        user=profile_user,
        is_active=True,
        expires_at__gt=timezone.now()
    ).count()
    
    # Проверяем, подписан ли текущий пользователь на БЕСПЛАТНУЮ подписку этого автора
    is_subscribed = False
    if is_authenticated and not is_own_profile:
        is_subscribed = UserSubscription.objects.filter(
            user=request.user,
            subscription__creator=profile_user,
            subscription__price=0,  # Только бесплатная подписка
            is_active=True,
            expires_at__gt=timezone.now()
        ).exists()
    
    # Получаем посты пользователя (только опубликованные)
    posts = Post.objects.filter(
        author=profile_user, 
        published_at__isnull=False,
        published_at__lte=timezone.now()
    ).prefetch_related(
        'likes', 'comments', 'media', 'tags', 'subscription'
    ).order_by('-published_at')
    
    # Аннотируем количество лайков и комментариев
    posts = posts.annotate(
        likes_count=Count('likes', distinct=True),
        comments_count=Count('comments', distinct=True)
    )
    
    # Функция для проверки доступности поста
    def is_post_accessible(post):
        # Для неавторизованных пользователей доступны только посты без подписки
        if not is_authenticated:
            return post.subscription is None
        
        # Для авторизованных пользователей
        if not post.subscription:
            return True  # Пост доступен всем
        
        # Если у поста есть подписка, проверяем:
        # - Это собственная подписка пользователя
        # - ИЛИ пользователь подписан на эту конкретную подписку
        # - ИЛИ пользователь подписан на бесплатную подписку автора (для бесплатных постов)
        if post.subscription.price == 0:
            # Для бесплатных постов - проверяем подписку на бесплатную подписку автора
            return (post.subscription.id in user_active_subscriptions or 
                    is_own_profile or 
                    is_subscribed)
        else:
            # Для платных постов - проверяем подписку именно на эту платную подписку
            return (post.subscription.id in user_active_subscriptions or 
                    is_own_profile)
    
    # Обрабатываем посты
    processed_posts = []
    for post in posts:
        # Получаем медиа поста
        media_list = list(post.media.all())
        
        # Проверяем, лайкнул ли пользователь пост (только для авторизованных)
        is_liked = False
        if is_authenticated:
            is_liked = post.likes.filter(user=request.user).exists()
        
        # Проверяем доступность поста
        is_accessible = is_post_accessible(post)
        
        # Безопасно получаем фото автора
        author_photo_url = None
        if post.author.photo:
            try:
                author_photo_url = post.author.photo.url
            except (ValueError, AttributeError):
                author_photo_url = None
        
        # Получаем комментарии только для доступных постов
        comments = []
        if is_accessible:
            comments = list(post.comments.all().select_related('author')[:5])
        
        processed_posts.append({
            'id': post.id,
            'author': post.author,
            'author_photo_url': author_photo_url,
            'author_joined_date': post.author.date_joined,
            'title': post.title,
            'content': post.content if is_accessible else None,
            'published_at': post.published_at,
            'media_list': media_list,
            'tags': list(post.tags.all()),
            'likes_count': post.likes_count,
            'comments_count': post.comments_count,
            'is_liked': is_liked,
            'subscription': post.subscription,
            'is_accessible': is_accessible,
            'is_ad': post.is_ad,
            'comments_disabled': post.comments_disabled,
            'comments': comments,
        })
    
    context = {
        'author': profile_user,
        'posts': processed_posts,
        'posts_count': posts.count(),
        'is_own_profile': is_own_profile,
        'is_authenticated': is_authenticated,
        'is_subscribed': is_subscribed,
        'subscribers_count': subscribers_count,
        'subscriptions_count': subscriptions_count,
    }
    
    return render(request, 'user/personalAccount/profile.html', context)


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
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'error',
                'message': 'Разрешены только AJAX запросы'
            }, status=400)
        
        current_session_key = request.session.session_key
        
        try:
            data = json.loads(request.body)
            selected_session_keys = data.get('selected_sessions', [])
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Неверный формат JSON'
            }, status=400)
        
        if current_session_key in selected_session_keys:
            selected_session_keys.remove(current_session_key)
        
        if not selected_session_keys:
            return JsonResponse({
                'status': 'error',
                'message': 'Не выбраны сессии для завершения'
            }, status=400)
        
        sessions_to_delete = UserSession.objects.filter(
            user=request.user,
            session_key__in=selected_session_keys
        ).exclude(session_key=current_session_key)
        
        deleted_sessions_count = sessions_to_delete.count()
        
        for user_session in sessions_to_delete:
            try:
                Session.objects.get(session_key=user_session.session_key).delete()
            except Session.DoesNotExist:
                pass
        
        sessions_to_delete.delete()
        
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