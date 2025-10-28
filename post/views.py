from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib import messages
from .forms import MediaForm
from .models import Post, Media, Poll, PollOption, Tag

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

def post_list(request):
    posts = Post.objects.filter(published_at__isnull=False).order_by('-published_at')  # Только опубликованные
    return render(request, 'post_list.html', {'posts': posts})

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk, published_at__isnull=False)
    # Логика видимости: проверьте подписчиков или оплату (добавьте свою логику)
    return render(request, 'post_detail.html', {'post': post})

def post_list(request):
    posts = Post.objects.filter(published_at__isnull=False).order_by('-published_at')  # Только опубликованные
    return render(request, 'post_list.html', {'posts': posts})

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk, published_at__isnull=False)
    # Логика видимости: проверьте подписчиков или оплату (добавьте свою логику)
    return render(request, 'post_detail.html', {'post': post})
