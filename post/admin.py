from django.contrib import admin
from .models import Post, Media, Poll, PollOption, Tag, Comment

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


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'post', 'short_content', 'created_at', 'parent', 'is_reply']
    list_filter = ['created_at', 'author', 'post']
    search_fields = ['content', 'author__username', 'post__title']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 50
    
    def short_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    short_content.short_description = 'Содержание'
    
    def is_reply(self, obj):
        return bool(obj.parent)
    is_reply.short_description = 'Ответ'
    is_reply.boolean = True