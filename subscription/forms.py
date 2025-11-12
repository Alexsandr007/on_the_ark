from django import forms
from .models import Subscription

class SubscriptionForm(forms.ModelForm):
    class Meta:
        model = Subscription
        fields = [
            'name', 'description', 'price', 'image',
            'is_limited_subscribers', 'max_subscribers',
            'is_discount_active', 'discount_percent',
            'has_trial_period', 'trial_days'
        ]
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'tariff__title-input',
                'placeholder': 'Название тарифа',
                'id': 'tariffTitle',
                'autocomplete': 'off'
            }),
            'description': forms.Textarea(attrs={
                'class': 'tariff__description-input',
                'placeholder': 'Описание подписки',
                'rows': 4,
                'id': 'tariffDesc',
                'autocomplete': 'off'
            }),
            'price': forms.NumberInput(attrs={
                'class': 'tariff__price-input',
                'placeholder': 'Стоимость подписки',
                'min': '1',
                'id': 'tariffPrice',
                'autocomplete': 'off'
            }),
            'image': forms.FileInput(attrs={
                'accept': 'image/png, image/jpg, image/jpeg',
                'id': 'tariff-img-upload-btn',
                'style': 'position: absolute; opacity: 0; z-index: -1;'
            }),
            'is_limited_subscribers': forms.CheckboxInput(attrs={
                'id': 'limitedSubscribers'
            }),
            'max_subscribers': forms.NumberInput(attrs={
                'class': 'limited-subscribers-input',
                'min': '1',
                'id': 'maxSubscribers',
                'placeholder': 'Максимальное количество',
                'autocomplete': 'off'
            }),
            'is_discount_active': forms.CheckboxInput(attrs={
                'id': 'discountToggle'
            }),
            'discount_percent': forms.NumberInput(attrs={
                'type': 'range',
                'min': '0',
                'max': '50',
                'step': '1',
                'class': 'slider',
                'id': 'discountRange'
            }),
            'has_trial_period': forms.CheckboxInput(attrs={
                'id': 'trialPeriodToggle'
            }),
            'trial_days': forms.NumberInput(attrs={
                'type': 'range',
                'min': '14',
                'max': '28',
                'step': '1',
                'class': 'slider',
                'id': 'trialRange'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        # Извлекаем пользователя из kwargs
        self.creator = kwargs.pop('creator', None)
        super().__init__(*args, **kwargs)
        
        # Устанавливаем атрибуты autocomplete для всех полей
        for field_name, field in self.fields.items():
            if hasattr(field.widget, 'attrs'):
                field.widget.attrs['autocomplete'] = 'off'
        
        # Скрываем поле max_subscribers если не активировано ограничение
        if not self.instance.pk or not self.instance.is_limited_subscribers:
            self.fields['max_subscribers'].widget.attrs['style'] = 'display: none;'
    
    def save(self, commit=True):
        # Сохраняем создателя перед сохранением
        instance = super().save(commit=False)
        if self.creator:
            instance.creator = self.creator
        if commit:
            instance.save()
        return instance
    
    def clean_price(self):
        price = self.cleaned_data.get('price')
        if price and price > 100000:
            raise forms.ValidationError("Стоимость не может превышать 100 000₽")
        return price
    
    def clean_image(self):
        image = self.cleaned_data.get('image')
        if image:
            if image.size > 5 * 1024 * 1024: 
                raise forms.ValidationError("Размер изображения не должен превышать 5 МБ")
            if not image.name.lower().endswith(('.png', '.jpg', '.jpeg')):
                raise forms.ValidationError("Поддерживаются только форматы PNG, JPG и JPEG")
        return image
    
    def clean_max_subscribers(self):
        is_limited = self.cleaned_data.get('is_limited_subscribers')
        max_subscribers = self.cleaned_data.get('max_subscribers')
        
        if is_limited and (not max_subscribers or max_subscribers < 1):
            raise forms.ValidationError("Укажите максимальное количество подписчиков")
        
        if is_limited and max_subscribers > 100000:
            raise forms.ValidationError("Максимальное количество подписчиков не может превышать 100 000")
        
        return max_subscribers
    
    def clean_discount_percent(self):
        is_discount_active = self.cleaned_data.get('is_discount_active')
        discount_percent = self.cleaned_data.get('discount_percent')
        
        if is_discount_active and (not discount_percent or discount_percent < 1):
            raise forms.ValidationError("Укажите процент скидки")
        
        if is_discount_active and discount_percent > 50:
            raise forms.ValidationError("Скидка не может превышать 50%")
        
        return discount_percent
    
    def clean_trial_days(self):
        has_trial_period = self.cleaned_data.get('has_trial_period')
        trial_days = self.cleaned_data.get('trial_days')
        
        if has_trial_period and (not trial_days or trial_days < 14):
            raise forms.ValidationError("Пробный период должен быть не менее 14 дней")
        
        if has_trial_period and trial_days > 28:
            raise forms.ValidationError("Пробный период не может превышать 28 дней")
        
        return trial_days