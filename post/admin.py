from django.contrib import admin
from .models import Post, Media, Poll, PollOption, Tag

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)  
    search_fields = ('name',) 

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'get_visibility_display_custom', 'is_ad', 'published_at', 'created_at')
    list_filter = ('visibility', 'is_ad', 'comments_disabled', 'published_at', 'subscription')
    search_fields = ('title', 'content', 'author__email', 'subscription__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'published_at')
    filter_horizontal = ('tags',)
    
    def get_visibility_display_custom(self, obj):
        """Кастомное отображение видимости"""
        if obj.subscription:
            return f"Подписка: {obj.subscription.name}"
        return obj.get_visibility_display()
    get_visibility_display_custom.short_description = 'Видимость'
    get_visibility_display_custom.admin_order_field = 'subscription__name'

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('post', 'media_type', 'uploaded_at')  
    list_filter = ('media_type',) 
    search_fields = ('post__title',)  

@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ('question', 'post', 'created_at') 
    search_fields = ('question', 'post__title') 

@admin.register(PollOption)
class PollOptionAdmin(admin.ModelAdmin):
    list_display = ('poll', 'option_text', 'votes')  
    list_filter = ('votes',)  
    search_fields = ('option_text', 'poll__question') 
