from django.contrib import admin
from django.urls import path
from user import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('register-ajax/', views.register_ajax, name='register_ajax'),
    path('login-ajax/', views.login_ajax, name='login_ajax'),
    path('password-reset-ajax/', views.password_reset_ajax, name='password_reset_ajax'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
]