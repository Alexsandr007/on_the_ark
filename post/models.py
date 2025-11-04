from django.db import models
from user.models import CustomUser
from django.utils import timezone

# Ваши существующие модели (CustomUser и UserGoal) остаются без изменений

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Название тега")

    def __str__(self):
        return self.name

class Post(models.Model):
    VISIBILITY_CHOICES = [
        ('all_users', 'Все пользователи'),
        ('subscribers_only', 'Только подписчики'),
        ('one_time_payment', 'Разовая оплата'),
    ]

    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='posts', verbose_name="Автор")
    title = models.CharField(max_length=255, blank=True, null=True, verbose_name="Заголовок")
    content = models.TextField(blank=True, null=True, verbose_name="Текст поста")
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts', verbose_name="Теги")
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='all_users', verbose_name="Видимость")
    is_ad = models.BooleanField(default=False, verbose_name="Рекламный пост")
    ad_description = models.CharField(max_length=150, blank=True, null=True, verbose_name="Описание рекламодателя")
    scheduled_at = models.DateTimeField(blank=True, null=True, verbose_name="Запланированное время публикации")
    comments_disabled = models.BooleanField(default=False, verbose_name="Отключить комментарии")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    published_at = models.DateTimeField(blank=True, null=True, verbose_name="Дата публикации")  # Для планирования

    def __str__(self):
        return self.title or f"Пост от {self.author.email}"

    def publish(self):
        """Метод для публикации поста (если запланирован)"""
        if self.scheduled_at and self.scheduled_at <= timezone.now():
            self.published_at = timezone.now()
            self.save()

class Media(models.Model):
    MEDIA_TYPES = [
        ('photo', 'Фото'),
        ('video', 'Видео'),
        ('audio', 'Аудио'),
    ]

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media', verbose_name="Пост")
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, verbose_name="Тип медиа")
    file = models.FileField(upload_to='posts/media/%Y/%m/%d/', verbose_name="Файл")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.media_type} для {self.post.title}"

class Poll(models.Model):
    post = models.OneToOneField(Post, on_delete=models.CASCADE, related_name='poll', verbose_name="Пост")
    question = models.CharField(max_length=255, verbose_name="Вопрос голосования")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question

class PollOption(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options', verbose_name="Голосование")
    option_text = models.CharField(max_length=255, verbose_name="Вариант ответа")
    votes = models.PositiveIntegerField(default=0, verbose_name="Количество голосов")

    def __str__(self):
        return self.option_text
    
class Like(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='likes', verbose_name="Пользователь")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes', verbose_name="Пост")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        unique_together = ('user', 'post')  # Один пользователь может лайкнуть пост только один раз
        verbose_name = "Лайк"
        verbose_name_plural = "Лайки"

    def __str__(self):
        return f"{self.user.email} лайкнул пост {self.post.id}"


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments', verbose_name="Пост")
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='comments', verbose_name="Автор")
    content = models.TextField(verbose_name="Текст комментария")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name="Родительский комментарий")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Комментарий"
        verbose_name_plural = "Комментарии"

    def __str__(self):
        return f"Комментарий от {self.author.email} к посту {self.post.id}"