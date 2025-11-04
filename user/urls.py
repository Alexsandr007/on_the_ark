from django.contrib import admin
from django.urls import path
from user import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('about-us/', views.about_us, name='about_us'),
    path('blog/', views.blog, name='blog'),
    path('support/', views.support, name='support'),
    path('change-profile/', views.change_profile, name='change_profile'),
    path('register-ajax/', views.register_ajax, name='register_ajax'),
    path('login-ajax/', views.login_ajax, name='login_ajax'),
    path('password-reset-ajax/', views.password_reset_ajax, name='password_reset_ajax'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('update-about-ajax/', views.update_about_ajax, name='update_about_ajax'),
    path('update-goal-ajax/', views.update_goal_ajax, name='update_goal_ajax'),
    path('update-user-settings-ajax/', views.update_user_settings_ajax, name='update_user_settings_ajax'),
    path('update-profession-ajax/', views.update_profession_ajax, name='update_profession_ajax'),
    path('update-photo-ajax/', views.update_photo_ajax, name='update_photo_ajax'),
    path('update-background-ajax/', views.update_background_ajax, name='update_background_ajax'),
    path('profile/agree-privacy-policy/', views.agree_privacy_policy, name='agree_privacy_policy'),
    path('profile/update-social-links/', views.update_social_links, name='update_social_links'), 
    path('sessions/terminate/', views.terminate_sessions, name='terminate_sessions'),
]


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
