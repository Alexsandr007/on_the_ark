from django.contrib import admin
from .models import Subscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['name', 'creator', 'price', 'final_price', 'is_active', 'created_at']
    list_filter = ['creator', 'is_active', 'created_at', 'is_limited_subscribers', 'has_trial_period']
    search_fields = ['name', 'description', 'creator__username', 'creator__email']
    readonly_fields = ['created_at', 'updated_at']
    list_select_related = ['creator']
    raw_id_fields = ['creator']
    fieldsets = (
        ('Основная информация', {
            'fields': ('creator', 'name', 'description', 'price', 'image', 'is_active')
        }),
        ('Дополнительные опции', {
            'fields': (
                'is_limited_subscribers', 'max_subscribers',
                'is_discount_active', 'discount_percent',
                'has_trial_period', 'trial_days'
            )
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        # Оптимизируем запрос, загружая связанного пользователя
        return super().get_queryset(request).select_related('creator')
    
    def final_price(self, obj):
        return f"{obj.final_price}₽"
    final_price.short_description = 'Итоговая цена'
    
    def creator_username(self, obj):
        return obj.creator.username if obj.creator else '-'
    creator_username.short_description = 'Имя создателя'
    
    def creator_email(self, obj):
        return obj.creator.email if obj.creator else '-'
    creator_email.short_description = 'Email создателя'