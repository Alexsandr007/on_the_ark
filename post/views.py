import json
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.contrib import messages

from subscription.models import Subscription, UserSubscription
from .forms import MediaForm
from .models import Like, Post, Media, Poll, PollOption, Tag
from post.models import Comment
from django.views.decorators.http import require_http_methods
from utils.profanity_filter import profanity_filter 
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
import io
import mimetypes
from django.db.models import Q, Count, Exists, OuterRef


@login_required
def create_post(request):
    temp_storage = FileSystemStorage(location=settings.TEMP_MEDIA_ROOT, base_url=settings.TEMP_MEDIA_URL)
    temp_media_url = None
    temp_media_type = None

    user_subscriptions = Subscription.objects.filter(is_active=True)

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        content = request.POST.get('content', '').strip()
        tags_input = request.POST.get('tags_input', '').strip()
        visibility = request.POST.get('visibility', 'all_users')
        is_ad = request.POST.get('is_ad') == 'on'
        ad_description = request.POST.get('ad_description', '').strip() if is_ad else ''
        scheduled_at_str = request.POST.get('scheduled_at', '').strip()
        comments_disabled = request.POST.get('comments_disabled') == 'on'
        media_type = request.POST.get('media_type', '') or request.session.get('temp_media_type', '')
        question = request.POST.get('question', '').strip()
        options_str = request.POST.get('options', '').strip()

        form_data = {
            'title': title,
            'content': content,
            'tags_input': tags_input,
            'visibility': visibility,
            'is_ad': is_ad,
            'ad_description': ad_description,
            'scheduled_at_str': scheduled_at_str,
            'comments_disabled': comments_disabled,
            'media_type': media_type,
            'question': question,
            'options_str': options_str,
        }

        def save_temp_file():
            file = request.FILES.get('file')
            if file and media_type:
                temp_filename = temp_storage.save(file.name, file)
                request.session['temp_media_filename'] = temp_filename
                request.session['temp_media_type'] = media_type
                return temp_storage.url(temp_filename), media_type
            elif 'temp_media_filename' in request.session:
                return temp_storage.url(request.session['temp_media_filename']), request.session.get('temp_media_type')
            return None, None

        if not content:
            messages.error(request, 'Текст поста обязателен.')
            temp_media_url, temp_media_type = save_temp_file()
            return render(request, 'post/create_post.html', {
                'form_data': form_data, 
                'temp_media_url': temp_media_url, 
                'temp_media_type': temp_media_type
            })

        fields_to_check = {
            'заголовок': title,
            'текст поста': content,
            'описание рекламодателя': ad_description,
            'теги': tags_input
        }
        
        for field_name, field_value in fields_to_check.items():
            if field_value and profanity_filter.contains_profanity(str(field_value)):
                messages.error(
                    request, 
                    f'Поле "{field_name}" содержит нецензурную лексику. Пожалуйста, отредактируйте текст.'
                )
                temp_media_url, temp_media_type = save_temp_file()
                return render(request, 'post/create_post.html', {
                    'form_data': form_data, 
                    'temp_media_url': temp_media_url, 
                    'temp_media_type': temp_media_type
                })

        scheduled_at = None
        if scheduled_at_str:
            try:
                scheduled_at = timezone.datetime.fromisoformat(scheduled_at_str.replace('Z', '+00:00'))
            except ValueError:
                messages.error(request, 'Неверный формат даты.')
                temp_media_url, temp_media_type = save_temp_file()
                return render(request, 'post/create_post.html', {
                    'form_data': form_data, 
                    'temp_media_url': temp_media_url, 
                    'temp_media_type': temp_media_type
                })
            

        subscription = None
        if visibility and visibility != 'all_users':  
            try:
                subscription = Subscription.objects.get(id=visibility, is_active=True)  
            except (Subscription.DoesNotExist, ValueError):
                messages.error(request, 'Выбранная подписка не найдена')
                temp_media_url, temp_media_type = save_temp_file()
                return render(request, 'post/create_post.html', {
                    'form_data': form_data, 
                    'temp_media_url': temp_media_url, 
                    'temp_media_type': temp_media_type,
                    'user_subscriptions': user_subscriptions
                })

        post = Post(
            author=request.user,
            title=title if title else None,
            content=content,
            visibility='all_users', 
            subscription=subscription, 
            is_ad=is_ad,
            ad_description=ad_description,
            scheduled_at=scheduled_at,
            comments_disabled=comments_disabled,
            published_at=timezone.now() if not scheduled_at else None
        )
        post.save()

        if tags_input:
            tag_names = [name.strip() for name in tags_input.split(',') if name.strip()][:6]
            for name in tag_names:
                if profanity_filter.contains_profanity(name):
                    messages.error(request, f'Тег "{name}" содержит нецензурную лексику.')
                    post.delete()
                    temp_media_url, temp_media_type = save_temp_file()
                    return render(request, 'post/create_post.html', {
                        'form_data': {}, 
                        'temp_media_url': temp_media_url, 
                        'temp_media_type': temp_media_type,
                        'user_subscriptions': user_subscriptions
                    })
                
                tag, created = Tag.objects.get_or_create(name=name)
                post.tags.add(tag)

        file = request.FILES.get('file')
        if not file and media_type and 'temp_media_filename' in request.session:
            temp_filename = request.session['temp_media_filename']
            try:
                with open(temp_storage.path(temp_filename), 'rb') as temp_file:
                    file_content = temp_file.read()

                content_type, _ = mimetypes.guess_type(temp_filename)
                content_type = content_type or 'application/octet-stream'
                file = InMemoryUploadedFile(
                    io.BytesIO(file_content),
                    field_name='file',
                    name=temp_filename,
                    content_type=content_type,
                    size=len(file_content),
                    charset=None
                )
                print(f"Файл восстановлен: {temp_filename}, тип: {content_type}")
            except Exception as e:
                print(f"Ошибка восстановления файла: {e}")
                messages.error(request, 'Ошибка восстановления файла.')
                file = None

        if file and media_type:
            media = Media(
                post=post,
                file=file,
                media_type=media_type
            )
            media.save()

        if question and options_str:
            if (profanity_filter.contains_profanity(question) or 
                profanity_filter.contains_profanity(options_str)):
                messages.error(request, 'Вопрос или варианты ответа содержат нецензурную лексику.')
                post.delete()
                temp_media_url, temp_media_type = save_temp_file()
                return render(request, 'post/create_post.html', {
                    'form_data': {}, 
                    'temp_media_url': temp_media_url, 
                    'temp_media_type': temp_media_type,
                    'user_subscriptions': user_subscriptions
                })
            
            poll = Poll.objects.create(post=post, question=question)
            for option in options_str.split(','):
                option_text = option.strip()
                if option_text:
                    PollOption.objects.create(poll=poll, option_text=option_text)

        if 'temp_media_filename' in request.session:
            try:
                temp_storage.delete(request.session['temp_media_filename'])
            except Exception as e:
                print(f"Ошибка удаления временного файла: {e}")
            del request.session['temp_media_filename']
            if 'temp_media_type' in request.session:
                del request.session['temp_media_type']

        return redirect('profile')

    if 'temp_media_filename' in request.session:
        try:
            temp_media_url = temp_storage.url(request.session['temp_media_filename'])
            temp_media_type = request.session.get('temp_media_type')
        except Exception as e:
            print(f"Ошибка получения временного файла: {e}")
            if 'temp_media_filename' in request.session:
                del request.session['temp_media_filename']
            if 'temp_media_type' in request.session:
                del request.session['temp_media_type']
    
    return render(request, 'post/create_post.html', {
        'form_data': {}, 
        'temp_media_url': temp_media_url, 
        'temp_media_type': temp_media_type,
        'user_subscriptions': user_subscriptions
    })

@login_required
def edit_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id, author=request.user)
    except Post.DoesNotExist:
        messages.error(request, 'Пост не найден или у вас нет прав для его редактирования.')
        return redirect('profile')

    temp_storage = FileSystemStorage(location=settings.TEMP_MEDIA_ROOT, base_url=settings.TEMP_MEDIA_URL)
    temp_media_url = None
    temp_media_type = None
    user_subscriptions = Subscription.objects.filter(is_active=True)  # ДОБАВИТЬ ЭТУ СТРОКУ

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        content = request.POST.get('content', '').strip()
        tags_input = request.POST.get('tags_input', '').strip()
        visibility = request.POST.get('visibility', 'all_users')  # ИЗМЕНИТЬ НА subscription ЕСЛИ МЕНЯЛИ HTML
        is_ad = request.POST.get('is_ad') == 'on'
        ad_description = request.POST.get('ad_description', '').strip() if is_ad else ''
        scheduled_at_str = request.POST.get('scheduled_at', '').strip()
        comments_disabled = request.POST.get('comments_disabled') == 'on'
        media_type = request.POST.get('media_type', '')
        question = request.POST.get('question', '').strip()
        options_str = request.POST.get('options', '').strip()

        form_data = {
            'title': title,
            'content': content,
            'tags_input': tags_input,
            'visibility': visibility,
            'is_ad': is_ad,
            'ad_description': ad_description,
            'scheduled_at_str': scheduled_at_str,
            'comments_disabled': comments_disabled,
            'media_type': media_type,
            'question': question,
            'options_str': options_str,
        }

        # ДОБАВИТЬ ФУНКЦИЮ save_temp_file
        def save_temp_file():
            file = request.FILES.get('file')
            if file and media_type:
                temp_filename = temp_storage.save(file.name, file)
                request.session['temp_media_filename'] = temp_filename
                request.session['temp_media_type'] = media_type
                return temp_storage.url(temp_filename), media_type
            elif 'temp_media_filename' in request.session:
                return temp_storage.url(request.session['temp_media_filename']), request.session.get('temp_media_type')
            return None, None

        if not title:
            messages.error(request, 'Текст заголовка обязателен.')
            temp_media_url, temp_media_type = save_temp_file()  # ИСПОЛЬЗОВАТЬ ФУНКЦИЮ
            return render(request, 'post/create_post.html', {
                'form_data': form_data, 
                'temp_media_url': temp_media_url, 
                'temp_media_type': temp_media_type, 
                'post': post, 
                'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 
                'is_edit': True,
                'user_subscriptions': user_subscriptions  # ДОБАВИТЬ
            })

        if not content:
            messages.error(request, 'Текст поста обязателен.')
            temp_media_url, temp_media_type = save_temp_file()  # ИСПОЛЬЗОВАТЬ ФУНКЦИЮ
            return render(request, 'post/create_post.html', {
                'form_data': form_data, 
                'temp_media_url': temp_media_url, 
                'temp_media_type': temp_media_type, 
                'post': post, 
                'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 
                'is_edit': True,
                'user_subscriptions': user_subscriptions  # ДОБАВИТЬ
            })

        fields_to_check = {
            'заголовок': title,
            'текст поста': content,
            'описание рекламодателя': ad_description,
            'теги': tags_input
        }
        
        for field_name, field_value in fields_to_check.items():
            if field_value and profanity_filter.contains_profanity(str(field_value)):
                messages.error(
                    request, 
                    f'Поле "{field_name}" содержит нецензурную лексику. Пожалуйста, отредактируйте текст.'
                )
                temp_media_url, temp_media_type = save_temp_file()  # ИСПОЛЬЗОВАТЬ ФУНКЦИЮ
                return render(request, 'post/create_post.html', {
                    'form_data': form_data, 
                    'temp_media_url': temp_media_url, 
                    'temp_media_type': temp_media_type, 
                    'post': post, 
                    'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 
                    'is_edit': True,
                    'user_subscriptions': user_subscriptions  # ДОБАВИТЬ
                })

        scheduled_at = None
        if scheduled_at_str:
            try:
                scheduled_at = timezone.datetime.fromisoformat(scheduled_at_str.replace('Z', '+00:00'))
            except ValueError:
                messages.error(request, 'Неверный формат даты.')
                temp_media_url, temp_media_type = save_temp_file()  # ИСПОЛЬЗОВАТЬ ФУНКЦИЮ
                return render(request, 'post/create_post.html', {
                    'form_data': form_data, 
                    'temp_media_url': temp_media_url, 
                    'temp_media_type': temp_media_type, 
                    'post': post, 
                    'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 
                    'is_edit': True,
                    'user_subscriptions': user_subscriptions  # ДОБАВИТЬ
                })

        # ДОБАВИТЬ ЛОГИКУ ДЛЯ ПОДПИСКИ (ТАК ЖЕ КАК В create_post)
        subscription = None
        if visibility and visibility != 'all_users':  
            try:
                subscription = Subscription.objects.get(id=visibility, is_active=True)  
            except (Subscription.DoesNotExist, ValueError):
                messages.error(request, 'Выбранная подписка не найдена')
                temp_media_url, temp_media_type = save_temp_file()
                return render(request, 'post/create_post.html', {
                    'form_data': form_data, 
                    'temp_media_url': temp_media_url, 
                    'temp_media_type': temp_media_type, 
                    'post': post, 
                    'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 
                    'is_edit': True,
                    'user_subscriptions': user_subscriptions
                })

        delete_media_id = request.POST.get('delete_media')
        if delete_media_id:
            try:
                media = Media.objects.get(id=delete_media_id, post=post)
                media.delete()
            except Media.DoesNotExist:
                pass
        
        delete_poll_id = request.POST.get('delete_poll')
        if delete_poll_id and hasattr(post, 'poll'):
            post.poll.delete()

        # ОБНОВИТЬ ПОЛЯ ПОСТА С УЧЕТОМ ПОДПИСКИ
        post.title = title if title else None
        post.content = content
        post.visibility = 'all_users'  # ВСЕГДА all_users
        post.subscription = subscription  # УСТАНОВИТЬ ПОДПИСКУ
        post.is_ad = is_ad
        post.ad_description = ad_description
        post.scheduled_at = scheduled_at
        post.comments_disabled = comments_disabled
        
        if not scheduled_at and not post.published_at:
            post.published_at = timezone.now()
            
        post.save()

        post.tags.clear()
        if tags_input:
            tag_names = [name.strip() for name in tags_input.split(',') if name.strip()][:6]
            for name in tag_names:
                if profanity_filter.contains_profanity(name):
                    messages.error(request, f'Тег "{name}" содержит нецензурную лексику.')
                    temp_media_url, temp_media_type = save_temp_file()
                    return render(request, 'post/create_post.html', {
                        'form_data': form_data, 
                        'temp_media_url': temp_media_url, 
                        'temp_media_type': temp_media_type, 
                        'post': post, 
                        'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 
                        'is_edit': True,
                        'user_subscriptions': user_subscriptions
                    })
                
                tag, created = Tag.objects.get_or_create(name=name)
                post.tags.add(tag)

        file = request.FILES.get('file')
        if media_type and file:
            post.media.all().delete()
            
            media_form = MediaForm(data={'media_type': media_type}, files={'file': file})
            if media_form.is_valid():
                media = media_form.save(commit=False)
                media.post = post
                media.save()
            else:
                messages.error(request, f"Ошибка загрузки {media_type}: {media_form.errors}")
                temp_media_url, temp_media_type = save_temp_file()
                return render(request, 'post/create_post.html', {
                    'form_data': form_data, 
                    'temp_media_url': temp_media_url, 
                    'temp_media_type': temp_media_type, 
                    'post': post, 
                    'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 
                    'is_edit': True,
                    'user_subscriptions': user_subscriptions
                })

        if hasattr(post, 'poll'):
            post.poll.delete()
            
        if question and options_str:
            if (profanity_filter.contains_profanity(question) or 
                profanity_filter.contains_profanity(options_str)):
                messages.error(request, 'Вопрос или варианты ответа содержат нецензурную лексику.')
                temp_media_url, temp_media_type = save_temp_file()
                return render(request, 'post/create_post.html', {
                    'form_data': form_data, 
                    'temp_media_url': temp_media_url, 
                    'temp_media_type': temp_media_type, 
                    'post': post, 
                    'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 
                    'is_edit': True,
                    'user_subscriptions': user_subscriptions
                })
            
            poll = Poll.objects.create(post=post, question=question)
            for option in options_str.split(','):
                if option.strip():
                    PollOption.objects.create(poll=poll, option_text=option.strip())

        if 'temp_media_filename' in request.session:
            temp_storage.delete(request.session['temp_media_filename'])
            del request.session['temp_media_filename']
            del request.session['temp_media_type']

        return redirect('profile')

    if 'temp_media_filename' in request.session:
        temp_media_url = temp_storage.url(request.session['temp_media_filename'])
        temp_media_type = request.session.get('temp_media_type')
    
    context = {
        'post': post,
        'existing_tags': ', '.join([tag.name for tag in post.tags.all()]),
        'is_edit': True,  
        'temp_media_url': temp_media_url,
        'temp_media_type': temp_media_type,
        'user_subscriptions': user_subscriptions,  # ДОБАВИТЬ В КОНТЕКСТ
    }
    
    if hasattr(post, 'poll'):
        context['poll_question'] = post.poll.question
        context['poll_options'] = ', '.join([option.option_text for option in post.poll.options.all()])
    
    return render(request, 'post/create_post.html', context)


@require_http_methods(["DELETE"])
@login_required
def delete_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id, author=request.user)
        post_title = post.title or "Без названия"
        post.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'Пост "{post_title}" успешно удален'
        })
        
    except Post.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Пост не найден или у вас нет прав для его удаления'
        }, status=404)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Ошибка при удалении: {str(e)}'
        }, status=500)


def post_list(request):
    posts = Post.objects.filter(published_at__isnull=False).order_by('-published_at')  
    return render(request, 'post_list.html', {'posts': posts})

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk, published_at__isnull=False)
    return render(request, 'post_detail.html', {'post': post})


@login_required
def clear_temp_media(request):
    if request.method == 'POST':
        if 'temp_media_filename' in request.session:
            temp_storage = FileSystemStorage(location=settings.TEMP_MEDIA_ROOT)
            temp_storage.delete(request.session['temp_media_filename'])
            del request.session['temp_media_filename']
            del request.session['temp_media_type']
    return JsonResponse({'status': 'ok'})


@login_required
@require_POST
@csrf_exempt
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        user = request.user
        
        like_exists = Like.objects.filter(user=user, post=post).exists()
        
        if like_exists:
            Like.objects.filter(user=user, post=post).delete()
            liked = False
        else:
            Like.objects.create(user=user, post=post)
            liked = True
        
        likes_count = post.likes.count()
        
        return JsonResponse({
            'success': True,
            'liked': liked,
            'likes_count': likes_count
        })
        
    except Post.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Пост не найден'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
    

@login_required
@require_POST
def add_comment(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        content = request.POST.get('content', '').strip()
        
        if not content:
            return JsonResponse({'success': False, 'error': 'Комментарий не может быть пустым'})
        
        # Проверяем, отключены ли комментарии
        if post.comments_disabled:
            return JsonResponse({'success': False, 'error': 'Комментарии отключены для этого поста'})
        
        # Проверяем доступность поста
        # Автор поста всегда имеет доступ к комментированию
        is_author = post.author == request.user
        has_access = is_author  # Автор всегда имеет доступ
        
        # Если пользователь не автор, проверяем доступ через подписку
        if not is_author and post.subscription:
            has_access = request.user.user_subscriptions.filter(
                subscription=post.subscription, 
                is_active=True,
                expires_at__gt=timezone.now()
            ).exists()
        elif not is_author and not post.subscription:
            # Если подписки нет, пост доступен всем
            has_access = True
        
        if not has_access:
            return JsonResponse({'success': False, 'error': 'У вас нет доступа к этому посту'})
        
        comment = Comment.objects.create(
            post=post,
            author=request.user,
            content=content
        )
        
        # Получаем обновленное количество комментариев
        comments_count = post.comments.count()
        
        # Безопасно получаем URL фото пользователя
        photo_url = ''
        if request.user.photo:
            try:
                photo_url = request.user.photo.url
            except (ValueError, AttributeError):
                # Если фото не загружено или произошла ошибка
                photo_url = ''
        
        return JsonResponse({
            'success': True,
            'comment': {
                'id': comment.id,
                'author_name': request.user.username,
                'author_photo_url': photo_url,
                'content': content,
                'created_at': 'Только что',
                'created_at_formatted': comment.created_at.strftime('%d %b %Y H:%M')
            },
            'comments_count': comments_count
        })
        
    except Post.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Пост не найден'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    

def get_visible_posts(user):
    """Получить посты, доступные пользователю"""
    if user.is_authenticated:
        # Посты без подписки (доступны всем)
        public_posts = Post.objects.filter(
            published_at__isnull=False,
            subscription__isnull=True
        )
        
        # Посты пользователя (автор всегда видит свои посты)
        user_posts = Post.objects.filter(
            published_at__isnull=False,
            author=user
        )
        
        # Посты по активным подпискам пользователя
        user_active_subscriptions = UserSubscription.objects.filter(
            user=user, 
            is_active=True
        ).values_list('subscription_id', flat=True)
        
        subscription_posts = Post.objects.filter(
            published_at__isnull=False,
            subscription_id__in=user_active_subscriptions
        )
        
        # Объединяем все доступные посты
        all_posts = public_posts.union(user_posts, subscription_posts).order_by('-published_at')
        return all_posts
    else:
        # Для неавторизованных пользователей - только публичные посты
        return Post.objects.filter(
            published_at__isnull=False,
            subscription__isnull=True
        ).order_by('-published_at')
    

@login_required
def feed(request):
    """Лента новостей с постами всех авторов"""
    # Получаем активные подписки пользователя
    user_active_subscriptions = request.user.user_subscriptions.filter(
        is_active=True,
        expires_at__gt=timezone.now()
    ).values_list('subscription_id', flat=True)
    
    # Получаем все активные подписки для модального окна
    available_subscriptions = Subscription.objects.filter(is_active=True)
    
    # Обрабатываем подписки для отображения
    processed_subscriptions = []
    for subscription in available_subscriptions:
        # Разбиваем описание на список для отображения
        description_lines = subscription.description.split('\n')
        
        processed_subscriptions.append({
            'id': subscription.id,
            'name': subscription.name,
            'description': subscription.description,
            'description_lines': [line.strip() for line in description_lines if line.strip()],
            'price': subscription.price,
            'final_price': subscription.final_price,
            'image': subscription.image,
            'is_discount_active': subscription.is_discount_active,
            'discount_percent': subscription.discount_percent,  # ДОБАВЛЕНО
            'has_trial_period': subscription.has_trial_period,
            'trial_days': subscription.trial_days,
            'is_limited_subscribers': subscription.is_limited_subscribers,  # ДОБАВЛЕНО
            'max_subscribers': subscription.max_subscribers,  # ДОБАВЛЕНО
        })
    
    # Базовый запрос для опубликованных постов
    posts = Post.objects.filter(
        published_at__isnull=False,
        published_at__lte=timezone.now()
    ).select_related('author', 'subscription').prefetch_related(
        'media', 'tags', 'likes', 'comments', 'comments__author'
    ).order_by('-published_at')
    
    # Аннотируем посты информацией о лайках и комментариях
    posts = posts.annotate(
        likes_count=Count('likes', distinct=True),
        comments_count=Count('comments', distinct=True)
    )
    
    # Определяем, доступен ли пост пользователю
    def is_post_accessible(post):
        if not post.subscription:
            return True  # Пост доступен всем
        return post.subscription.id in user_active_subscriptions
    
    # Обрабатываем посты для отображения
    processed_posts = []
    for post in posts:
        # Получаем медиа поста
        media_list = list(post.media.all())
        
        # Получаем комментарии для поста (только для доступных постов)
        comments = []
        if is_post_accessible(post):
            comments = list(post.comments.all().select_related('author')[:5])
        
        # Проверяем, лайкнул ли пользователь пост
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
        
        processed_posts.append({
            'id': post.id,
            'author': post.author,
            'author_photo_url': author_photo_url,
            'title': post.title,
            'author_joined_date': post.author.date_joined,
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
            'ad_description': post.ad_description,
            'comments_disabled': post.comments_disabled,
            'comments': comments,
        })

    context = {
        'posts': processed_posts,
        'user_subscriptions': user_active_subscriptions,
        'available_subscriptions': processed_subscriptions,
    }
    
    return render(request, 'post/news_feed.html', context)