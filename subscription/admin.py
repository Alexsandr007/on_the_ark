from django.contrib import admin
from .models import Subscription

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'final_price', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'is_limited_subscribers', 'has_trial_period']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'price', 'image', 'is_active')
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