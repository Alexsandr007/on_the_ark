from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.contrib import messages
from .forms import MediaForm
from .models import Like, Post, Media, Poll, PollOption, Tag
from django.views.decorators.http import require_http_methods
from utils.profanity_filter import profanity_filter 
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
import io
import mimetypes


@login_required
def create_post(request):
    temp_storage = FileSystemStorage(location=settings.TEMP_MEDIA_ROOT, base_url=settings.TEMP_MEDIA_URL)
    temp_media_url = None
    temp_media_type = None

    if request.method == 'POST':
        # Получаем данные из формы
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

        # Функция для сохранения файла в сессии
        def save_temp_file():
            file = request.FILES.get('file')
            if file and media_type:
                temp_filename = temp_storage.save(file.name, file)
                request.session['temp_media_filename'] = temp_filename
                request.session['temp_media_type'] = media_type
                return temp_storage.url(temp_filename), media_type
            # Если файл уже в сессии, используем его
            elif 'temp_media_filename' in request.session:
                return temp_storage.url(request.session['temp_media_filename']), request.session.get('temp_media_type')
            return None, None

        # БАЗОВАЯ ВАЛИДАЦИЯ
        if not content:
            messages.error(request, 'Текст поста обязателен.')
            temp_media_url, temp_media_type = save_temp_file()
            return render(request, 'post/create_post.html', {
                'form_data': form_data, 
                'temp_media_url': temp_media_url, 
                'temp_media_type': temp_media_type
            })

        # ПРОВЕРКА НА НЕЦЕНЗУРНУЮ ЛЕКСИКУ
        fields_to_check = {
            'заголовок': title,
            'текст поста': content,
            'описание рекламодателя': ad_description,
            'теги': tags_input
        }
        
        # Проверяем все поля
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

        # Обработка scheduled_at
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

        # Создание поста
        post = Post(
            author=request.user,
            title=title if title else None,
            content=content,
            visibility=visibility,
            is_ad=is_ad,
            ad_description=ad_description,
            scheduled_at=scheduled_at,
            comments_disabled=comments_disabled,
            published_at=timezone.now() if not scheduled_at else None
        )
        post.save()

        # Обработка тегов (не более 6)
        if tags_input:
            tag_names = [name.strip() for name in tags_input.split(',') if name.strip()][:6]
            for name in tag_names:
                if profanity_filter.contains_profanity(name):
                    messages.error(request, f'Тег "{name}" содержит нецензурную лексику.')
                    post.delete()
                    temp_media_url, temp_media_type = save_temp_file()
                    return render(request, 'post/create_post.html', {
                        'form_data': form_data, 
                        'temp_media_url': temp_media_url, 
                        'temp_media_type': temp_media_type
                    })
                
                tag, created = Tag.objects.get_or_create(name=name)
                post.tags.add(tag)

        # Обработка медиа
        file = request.FILES.get('file')
        if not file and media_type and 'temp_media_filename' in request.session:
            # Восстанавливаем файл из временного хранилища
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

        # Сохраняем медиа в пост
        if file and media_type:
            media = Media(
                post=post,
                file=file,
                media_type=media_type
            )
            media.save()

        # Обработка голосования
        if question and options_str:
            if (profanity_filter.contains_profanity(question) or 
                profanity_filter.contains_profanity(options_str)):
                messages.error(request, 'Вопрос или варианты ответа содержат нецензурную лексику.')
                post.delete()
                temp_media_url, temp_media_type = save_temp_file()
                return render(request, 'post/create_post.html', {
                    'form_data': form_data, 
                    'temp_media_url': temp_media_url, 
                    'temp_media_type': temp_media_type
                })
            
            poll = Poll.objects.create(post=post, question=question)
            for option in options_str.split(','):
                option_text = option.strip()
                if option_text:
                    PollOption.objects.create(poll=poll, option_text=option_text)

        # Успех: удалить временный файл из сессии и хранилища
        if 'temp_media_filename' in request.session:
            try:
                temp_storage.delete(request.session['temp_media_filename'])
            except Exception as e:
                print(f"Ошибка удаления временного файла: {e}")
            del request.session['temp_media_filename']
            if 'temp_media_type' in request.session:
                del request.session['temp_media_type']

        return redirect('profile')

    # GET запрос - проверяем есть ли временный файл в сессии
    if 'temp_media_filename' in request.session:
        try:
            temp_media_url = temp_storage.url(request.session['temp_media_filename'])
            temp_media_type = request.session.get('temp_media_type')
        except Exception as e:
            print(f"Ошибка получения временного файла: {e}")
            # Очищаем сессию если файл не найден
            if 'temp_media_filename' in request.session:
                del request.session['temp_media_filename']
            if 'temp_media_type' in request.session:
                del request.session['temp_media_type']
    
    return render(request, 'post/create_post.html', {
        'form_data': {}, 
        'temp_media_url': temp_media_url, 
        'temp_media_type': temp_media_type
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

    if request.method == 'POST':
        # Получаем данные из формы
        title = request.POST.get('title', '').strip()
        content = request.POST.get('content', '').strip()
        tags_input = request.POST.get('tags_input', '').strip()
        visibility = request.POST.get('visibility', 'all_users')
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

        # БАЗОВАЯ ВАЛИДАЦИЯ
        if not title:
            messages.error(request, 'Текст заголовка обязателен.')
            # Сохранить файл временно, если он был загружен
            file = request.FILES.get('file')
            if file and media_type:
                temp_filename = temp_storage.save(file.name, file)
                request.session['temp_media_filename'] = temp_filename
                request.session['temp_media_type'] = media_type
                temp_media_url = temp_storage.url(temp_filename)
                temp_media_type = media_type
            return render(request, 'post/create_post.html', {'form_data': form_data, 'temp_media_url': temp_media_url, 'temp_media_type': temp_media_type, 'post': post, 'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 'is_edit': True})

        if not content:
            messages.error(request, 'Текст поста обязателен.')
            # Сохранить файл временно, если он был загружен
            file = request.FILES.get('file')
            if file and media_type:
                temp_filename = temp_storage.save(file.name, file)
                request.session['temp_media_filename'] = temp_filename
                request.session['temp_media_type'] = media_type
                temp_media_url = temp_storage.url(temp_filename)
                temp_media_type = media_type
            return render(request, 'post/create_post.html', {'form_data': form_data, 'temp_media_url': temp_media_url, 'temp_media_type': temp_media_type, 'post': post, 'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 'is_edit': True})

        # ПРОВЕРКА НА НЕЦЕНЗУРНУЮ ЛЕКСИКУ
        fields_to_check = {
            'заголовок': title,
            'текст поста': content,
            'описание рекламодателя': ad_description,
            'теги': tags_input
        }
        
        # Проверяем все поля
        for field_name, field_value in fields_to_check.items():
            if field_value and profanity_filter.contains_profanity(str(field_value)):
                messages.error(
                    request, 
                    f'Поле "{field_name}" содержит нецензурную лексику. Пожалуйста, отредактируйте текст.'
                )
                # Сохранить файл временно
                file = request.FILES.get('file')
                if file and media_type:
                    temp_filename = temp_storage.save(file.name, file)
                    request.session['temp_media_filename'] = temp_filename
                    request.session['temp_media_type'] = media_type
                    temp_media_url = temp_storage.url(temp_filename)
                    temp_media_type = media_type
                return render(request, 'post/create_post.html', {'form_data': form_data, 'temp_media_url': temp_media_url, 'temp_media_type': temp_media_type, 'post': post, 'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 'is_edit': True})

        # Обработка scheduled_at
        scheduled_at = None
        if scheduled_at_str:
            try:
                scheduled_at = timezone.datetime.fromisoformat(scheduled_at_str.replace('Z', '+00:00'))
            except ValueError:
                messages.error(request, 'Неверный формат даты.')
                # Сохранить файл временно
                file = request.FILES.get('file')
                if file and media_type:
                    temp_filename = temp_storage.save(file.name, file)
                    request.session['temp_media_filename'] = temp_filename
                    request.session['temp_media_type'] = media_type
                    temp_media_url = temp_storage.url(temp_filename)
                    temp_media_type = media_type
                return render(request, 'post/create_post.html', {'form_data': form_data, 'temp_media_url': temp_media_url, 'temp_media_type': temp_media_type, 'post': post, 'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 'is_edit': True})

        # Обработка удаления медиа
        delete_media_id = request.POST.get('delete_media')
        if delete_media_id:
            try:
                media = Media.objects.get(id=delete_media_id, post=post)
                media.delete()
            except Media.DoesNotExist:
                pass
        
        # Обработка удаления голосования
        delete_poll_id = request.POST.get('delete_poll')
        if delete_poll_id and hasattr(post, 'poll'):
            post.poll.delete()

        # Обновление поста
        post.title = title if title else None
        post.content = content
        post.visibility = visibility
        post.is_ad = is_ad
        post.ad_description = ad_description
        post.scheduled_at = scheduled_at
        post.comments_disabled = comments_disabled
        
        # Если отменяем планирование, публикуем сразу
        if not scheduled_at and not post.published_at:
            post.published_at = timezone.now()
            
        post.save()

        # Обновление тегов
        post.tags.clear()
        if tags_input:
            tag_names = [name.strip() for name in tags_input.split(',') if name.strip()][:6]
            for name in tag_names:
                # Проверяем каждый тег отдельно
                if profanity_filter.contains_profanity(name):
                    messages.error(request, f'Тег "{name}" содержит нецензурную лексику.')
                    # Сохранить файл временно
                    file = request.FILES.get('file')
                    if file and media_type:
                        temp_filename = temp_storage.save(file.name, file)
                        request.session['temp_media_filename'] = temp_filename
                        request.session['temp_media_type'] = media_type
                        temp_media_url = temp_storage.url(temp_filename)
                        temp_media_type = media_type
                    return render(request, 'post/create_post.html', {'form_data': form_data, 'temp_media_url': temp_media_url, 'temp_media_type': temp_media_type, 'post': post, 'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 'is_edit': True})
                
                tag, created = Tag.objects.get_or_create(name=name)
                post.tags.add(tag)

        # Обработка нового медиа
        file = request.FILES.get('file')
        if media_type and file:
            # Удаляем старое медиа (если нужно)
            post.media.all().delete()
            
            # Создаем новое медиа
            media_form = MediaForm(data={'media_type': media_type}, files={'file': file})
            if media_form.is_valid():
                media = media_form.save(commit=False)
                media.post = post
                media.save()
            else:
                messages.error(request, f"Ошибка загрузки {media_type}: {media_form.errors}")
                # Сохранить файл временно
                temp_filename = temp_storage.save(file.name, file)
                request.session['temp_media_filename'] = temp_filename
                request.session['temp_media_type'] = media_type
                temp_media_url = temp_storage.url(temp_filename)
                temp_media_type = media_type
                return render(request, 'post/create_post.html', {'form_data': form_data, 'temp_media_url': temp_media_url, 'temp_media_type': temp_media_type, 'post': post, 'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 'is_edit': True})

        # Обновление голосования
        # Удаляем старое голосование если есть
        if hasattr(post, 'poll'):
            post.poll.delete()
            
        # Создаем новое голосование если указано
        if question and options_str:
            # Проверяем вопрос и варианты на нецензурную лексику
            if (profanity_filter.contains_profanity(question) or 
                profanity_filter.contains_profanity(options_str)):
                messages.error(request, 'Вопрос или варианты ответа содержат нецензурную лексику.')
                # Сохранить файл временно
                file = request.FILES.get('file')
                if file and media_type:
                    temp_filename = temp_storage.save(file.name, file)
                    request.session['temp_media_filename'] = temp_filename
                    request.session['temp_media_type'] = media_type
                    temp_media_url = temp_storage.url(temp_filename)
                    temp_media_type = media_type
                return render(request, 'post/create_post.html', {'form_data': form_data, 'temp_media_url': temp_media_url, 'temp_media_type': temp_media_type, 'post': post, 'existing_tags': ', '.join([tag.name for tag in post.tags.all()]), 'is_edit': True})
            
            poll = Poll.objects.create(post=post, question=question)
            for option in options_str.split(','):
                if option.strip():
                    PollOption.objects.create(poll=poll, option_text=option.strip())

        # Успех: удалить временный файл из сессии и хранилища
        if 'temp_media_filename' in request.session:
            temp_storage.delete(request.session['temp_media_filename'])
            del request.session['temp_media_filename']
            del request.session['temp_media_type']

        return redirect('profile')

    # GET-запрос: заполняем форму текущими данными
    # Восстановить временный файл из сессии, если он есть
    if 'temp_media_filename' in request.session:
        temp_media_url = temp_storage.url(request.session['temp_media_filename'])
        temp_media_type = request.session.get('temp_media_type')
    
    context = {
        'post': post,
        'existing_tags': ', '.join([tag.name for tag in post.tags.all()]),
        'is_edit': True,  # Флаг для шаблона
        'temp_media_url': temp_media_url,
        'temp_media_type': temp_media_type,
    }
    
    # Добавляем данные о голосовании если есть
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
    posts = Post.objects.filter(published_at__isnull=False).order_by('-published_at')  # Только опубликованные
    return render(request, 'post_list.html', {'posts': posts})

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk, published_at__isnull=False)
    # Логика видимости: проверьте подписчиков или оплату (добавьте свою логику)
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
        
        # Проверяем, есть ли уже лайк от этого пользователя
        like_exists = Like.objects.filter(user=user, post=post).exists()
        
        if like_exists:
            # Удаляем лайк (анлайк)
            Like.objects.filter(user=user, post=post).delete()
            liked = False
        else:
            # Создаем лайк
            Like.objects.create(user=user, post=post)
            liked = True
        
        # Получаем обновленное количество лайков
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