from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.conf import settings
import random
import string
from .forms import RegisterForm, LoginForm, PasswordResetForm
from .models import CustomUser

import logging

logger = logging.getLogger(__name__)


def home(request):
    if request.user.is_authenticated:
        return render(request, 'user/dashboard.html')
    return render(request, 'user/home.html', {
        'register_form': RegisterForm(),
        'login_form': LoginForm(),
        'reset_form': PasswordResetForm(),
    })

def register_ajax(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return JsonResponse({'success': True, 'redirect': '/dashboard/'})
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    return JsonResponse({'success': False})

def login_ajax(request):
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        if form.is_valid():
            user = authenticate(email=form.cleaned_data['username'], password=form.cleaned_data['password'])
            if user:
                login(request, user)
                return JsonResponse({'success': True, 'redirect': '/dashboard/'})
        return JsonResponse({'success': False, 'errors': {'__all__': ['Неверный email или пароль']}})
    return JsonResponse({'success': False})

def password_reset_ajax(request):
    if request.method == 'POST':
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            try:
                user = CustomUser.objects.get(email=email)
                new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
                user.set_password(new_password)
                user.save()
                send_mail(
                    'Восстановление пароля',
                    f'Ваш новый пароль: {new_password}',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                return JsonResponse({'success': True, 'message': 'Новый пароль отправлен на email'})
            except Exception as e:
                print(e)
                return JsonResponse({'success': False, 'errors': {'email': f'Ошибка отправки: {str(e)}'}})
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    return JsonResponse({'success': False})

@login_required
def dashboard(request):
    return render(request, 'user/dashboard.html')


def logout_view(request):
    logout(request)
    return redirect('home')  # Редирект на главную страницу