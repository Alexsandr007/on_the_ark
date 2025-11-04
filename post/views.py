from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib import messages
from .forms import MediaForm
from .models import Post, Media, Poll, PollOption, Tag
from django.views.decorators.http import require_http_methods

@login_required
def create_post(request):
    if request.method == 'POST':
        # Получаем данные из формы напрямую (соответствует name в HTML)
        title = request.POST.get('title', '').strip()
        content = request.POST.get('content', '').strip()
        tags_input = request.POST.get('tags_input', '').strip()
        visibility = request.POST.get('visibility', 'all_users')
        is_ad = request.POST.get('is_ad') == 'on'  # Чекбокс
        ad_description = request.POST.get('ad_description', '').strip() if is_ad else ''
        scheduled_at_str = request.POST.get('scheduled_at', '').strip()
        comments_disabled = request.POST.get('comments_disabled') == 'on'  # Чекбокс

        # Валидация (базовая, можно расширить)
        if not content:
            messages.error(request, 'Текст поста обязателен.')
            return redirect('create_post')

        # Обработка scheduled_at
        scheduled_at = None
        if scheduled_at_str:
            try:
                scheduled_at = timezone.datetime.fromisoformat(scheduled_at_str.replace('Z', '+00:00'))
            except ValueError:
                messages.error(request, 'Неверный формат даты.')
                return redirect('create_post')

        # Создание поста (переместил сюда, перед обработкой медиа)
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
                tag, created = Tag.objects.get_or_create(name=name)
                post.tags.add(tag)

        # Обработка медиа (теперь post определен)
        media_type = request.POST.get('media_type')
        file = request.FILES.get('file')
        if media_type and file:
            # Создаем форму для валидации
            media_form = MediaForm(data={'media_type': media_type}, files={'file': file})
            if media_form.is_valid():
                media = media_form.save(commit=False)
                media.post = post
                media.save()
            else:
                messages.error(request, f"Ошибка загрузки {media_type}: {media_form.errors}")
                return redirect('create_post')

        # Обработка голосования
        question = request.POST.get('question', '').strip()
        options_str = request.POST.get('options', '').strip()
        if question and options_str:
            poll = Poll.objects.create(post=post, question=question)
            for option in options_str.split(','):
                if option.strip():
                    PollOption.objects.create(poll=poll, option_text=option.strip())

        messages.success(request, 'Пост создан!')
        return redirect('profile')  # Замените на ваш URL для списка постов

    # GET-запрос: рендерим шаблон
    return render(request, 'post/create_post.html')


# views.py
@login_required
def edit_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id, author=request.user)
    except Post.DoesNotExist:
        messages.error(request, 'Пост не найден или у вас нет прав для его редактирования.')
        return redirect('profile')

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

        # Валидация
        if not content:
            messages.error(request, 'Текст поста обязателен.')
            return redirect('edit_post', post_id=post.id)

        # Обработка scheduled_at
        scheduled_at = None
        if scheduled_at_str:
            try:
                scheduled_at = timezone.datetime.fromisoformat(scheduled_at_str.replace('Z', '+00:00'))
            except ValueError:
                messages.error(request, 'Неверный формат даты.')
                return redirect('edit_post', post_id=post.id)
            
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
                tag, created = Tag.objects.get_or_create(name=name)
                post.tags.add(tag)

        # Обработка нового медиа
        media_type = request.POST.get('media_type')
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
                return redirect('edit_post', post_id=post.id)

        # Обновление голосования
        question = request.POST.get('question', '').strip()
        options_str = request.POST.get('options', '').strip()
        
        # Удаляем старое голосование если есть
        if hasattr(post, 'poll'):
            post.poll.delete()
            
        # Создаем новое голосование если указано
        if question and options_str:
            poll = Poll.objects.create(post=post, question=question)
            for option in options_str.split(','):
                if option.strip():
                    PollOption.objects.create(poll=poll, option_text=option.strip())

        messages.success(request, 'Пост успешно обновлен!')
        return redirect('profile')

    # GET-запрос: заполняем форму текущими данными
    context = {
        'post': post,
        'existing_tags': ', '.join([tag.name for tag in post.tags.all()]),
        'is_edit': True,  # Флаг для шаблона
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


