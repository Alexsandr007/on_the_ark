from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import random
import string
from .models import CustomUser, UserGoal

User = get_user_model()

class RegisterForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, label="Пароль")
    password_confirm = forms.CharField(widget=forms.PasswordInput, label="Повторите пароль")
    is_author = forms.BooleanField(required=False, label="Стать автором")
    newsletter = forms.BooleanField(required=False, label="Получать рассылку")

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'is_author', 'newsletter']

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password_confirm = cleaned_data.get('password_confirm')
        if password != password_confirm:
            raise ValidationError("Пароли не совпадают")
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user

class LoginForm(AuthenticationForm):
    username = forms.EmailField(label="Email")  # Переопределяем на email

class PasswordResetForm(forms.Form):
    email = forms.EmailField(label="Email")

    def clean_email(self):
        email = self.cleaned_data['email']
        if not User.objects.filter(email=email).exists():
            raise ValidationError("Пользователь с таким email не найден")
        return email
    

class AboutForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['about']
        widgets = {
            'about': forms.Textarea(attrs={'placeholder': 'Напишите пару слов о себе', 'maxlength': 200}),
        }

class GoalForm(forms.ModelForm):
    class Meta:
        model = UserGoal  
        fields = ['goal_title', 'goal_amount', 'goal_description']
        widgets = {
            'goal_title': forms.TextInput(attrs={'placeholder': 'Я хочу'}),
            'goal_amount': forms.NumberInput(attrs={'placeholder': 'Сумма сбора'}),
            'goal_description': forms.Textarea(attrs={'placeholder': 'Цель мотивирует людей помочь вам быстрее.', 'maxlength': 200}),
        }