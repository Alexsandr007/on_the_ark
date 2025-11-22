from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserGoal

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'phone', 'balance', 'is_visible', 'is_author', 'is_staff', 'is_active', 'email_verified', 'date_created')
    list_filter = ('is_visible', 'is_author', 'is_staff', 'is_active', 'email_verified', 'newsletter', 'privacy_policy_agreed', 'date_created', 'date_birth')
    search_fields = ('email', 'username', 'phone', 'bio', 'profession', 'about')
    ordering = ('-date_created',)
    readonly_fields = ('date_created', 'date_updated', 'verification_sent_at')
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Контактная информация', {'fields': ('phone', 'talk_link')}),
        ('Персональная информация', {'fields': ('photo', 'background_photo', 'about', 'bio', 'profession', 'date_birth')}),
        ('Финансы', {'fields': ('balance',)}),
        ('Настройки профиля', {'fields': ('is_visible', 'is_author')}),
        ('Соглашения и рассылки', {'fields': ('privacy_policy_agreed', 'newsletter')}),
        ('Верификация email', {'fields': ('email_verified', 'verification_token', 'verification_sent_at')}),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Важные даты', {'fields': ('last_login', 'date_created', 'date_updated')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'phone', 'is_visible', 'is_author', 'is_staff', 'is_active'),
        }),
    )


@admin.register(UserGoal)
class UserGoalAdmin(admin.ModelAdmin):
    list_display = ('user', 'goal_title', 'current_amount', 'goal_amount', 'goal_description')
    search_fields = ('user__email', 'goal_title') 
    list_filter = ('goal_amount','current_amount') 
    fields = ('user', 'goal_title', 'current_amount','goal_amount', 'goal_description')
    readonly_fields = ('user',)