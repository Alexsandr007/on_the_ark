from django.contrib import admin
from .models import Post, Media, Poll, PollOption, Tag

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)  # Отображение имени тега в списке
    search_fields = ('name',)  # Поиск по имени

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'visibility', 'is_ad', 'published_at', 'created_at')  # Ключевые поля в списке
    list_filter = ('visibility', 'is_ad', 'comments_disabled', 'published_at')  # Фильтры
    search_fields = ('title', 'content', 'author__email')  # Поиск по заголовку, тексту и email автора
    ordering = ('-created_at',)  # Сортировка по дате создания (новые сверху)
    readonly_fields = ('created_at', 'updated_at', 'published_at')  # Только для чтения
    filter_horizontal = ('tags',)  # Удобный виджет для ManyToMany (теги)

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('post', 'media_type', 'uploaded_at')  # Отображение поста, типа и даты
    list_filter = ('media_type',)  # Фильтр по типу медиа
    search_fields = ('post__title',)  # Поиск по заголовку поста

@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ('question', 'post', 'created_at')  # Вопрос, пост и дата
    search_fields = ('question', 'post__title')  # Поиск по вопросу и заголовку поста

@admin.register(PollOption)
class PollOptionAdmin(admin.ModelAdmin):
    list_display = ('poll', 'option_text', 'votes')  # Опция, текст и голоса
    list_filter = ('votes',)  # Фильтр по количеству голосов
    search_fields = ('option_text', 'poll__question')  # Поиск по тексту опции и вопросу
