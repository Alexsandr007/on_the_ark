from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from user.models import CustomUser

class Subscription(models.Model):
    name = models.CharField(max_length=200, verbose_name="Название подписки")
    description = models.TextField(verbose_name="Описание подписки")
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name="Стоимость за месяц"
    )
    image = models.ImageField(
        upload_to='subscriptions/%Y/%m/%d/',
        blank=True,
        null=True,
        verbose_name="Иллюстрация подписки"
    )
    
    is_limited_subscribers = models.BooleanField(
        default=False,
        verbose_name="Ограниченное количество подписчиков"
    )
    max_subscribers = models.PositiveIntegerField(
        default=1000,
        verbose_name="Максимальное количество подписчиков"
    )
    
    is_discount_active = models.BooleanField(
        default=False,
        verbose_name="Активирована скидка"
    )
    discount_percent = models.PositiveIntegerField(
        default=0,
        verbose_name="Процент скидки"
    )
    
    has_trial_period = models.BooleanField(
        default=False,
        verbose_name="Есть пробный период"
    )
    trial_days = models.PositiveIntegerField(
        default=14,
        verbose_name="Дни пробного периода"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, verbose_name="Активная")
    
    class Meta:
        verbose_name = "Подписка"
        verbose_name_plural = "Подписки"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def final_price(self):
        if self.is_discount_active and self.discount_percent > 0:
            discount_amount = (self.price * self.discount_percent) / 100
            return self.price - discount_amount
        return self.price
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if self.price > 100000:
            raise ValidationError({'price': 'Стоимость не может превышать 100 000₽'})
        


class UserSubscription(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='user_subscriptions')
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'subscription']