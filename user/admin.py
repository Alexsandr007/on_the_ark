from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserGoal

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'balance', 'is_visible', 'is_staff', 'is_active', 'date_created')
    list_filter = ('is_visible', 'is_staff', 'is_active', 'date_created', 'date_birth')
    search_fields = ('email', 'username', 'bio')
    ordering = ('-date_created',)
    readonly_fields = ('date_created', 'date_updated')
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Персональная информация', {'fields': ('photo', 'about', 'bio', 'date_birth', 'balance')}),
        ('Настройки', {'fields': ('is_visible',)}),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Важные даты', {'fields': ('last_login', 'date_created', 'date_updated')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_visible', 'is_staff', 'is_active'),
        }),
    )


@admin.register(UserGoal)
class UserGoalAdmin(admin.ModelAdmin):
    list_display = ('user', 'goal_title', 'current_amount', 'goal_amount', 'goal_description')
    search_fields = ('user__email', 'goal_title') 
    list_filter = ('goal_amount','current_amount') 
    fields = ('user', 'goal_title', 'current_amount','goal_amount', 'goal_description')
    readonly_fields = ('user',)