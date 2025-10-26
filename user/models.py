from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    username = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True, max_length=255, verbose_name='email address')
    about = models.TextField(null=True, blank=True, max_length=200)  
    profession = models.CharField(max_length=100, blank=True, null=True)
    is_visible = models.BooleanField(default=True)
    is_author = models.BooleanField(default=False)
    newsletter = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='uploads/%Y/%m/%d', blank=True, null=True)
    background_photo = models.ImageField(upload_to='backgrounds/%Y/%m/%d', blank=True, null=True, verbose_name="Фоновое фото")
    bio = models.CharField(max_length=255, blank=True, null=True)
    date_birth = models.DateField(blank=True, null=True)
    balance = models.IntegerField(default=0)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    vk_link = models.URLField(max_length=100, blank=True, null=True)
    instagram_link = models.URLField(max_length=100, blank=True, null=True)
    twitter_link = models.URLField(max_length=100, blank=True, null=True)
    youtube_link = models.URLField(max_length=100, blank=True, null=True)
    talk_link = models.URLField(max_length=100, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    

class UserGoal(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='goal')
    goal_title = models.CharField(max_length=255, blank=True, null=True, verbose_name="Название цели")
    current_amount = models.PositiveIntegerField(default=0, verbose_name="Текущая сумма")
    goal_amount = models.PositiveIntegerField(blank=True, null=True, verbose_name="Сумма цели")
    goal_description = models.TextField(blank=True, null=True, max_length=200, verbose_name="Описание цели")
    
    def __str__(self):
        return f"Цель для {self.user.email}"
