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
                'id': 'tariffTitle'
            }),
            'description': forms.Textarea(attrs={
                'class': 'tariff__description-input',
                'placeholder': 'Описание подписки',
                'rows': 4,
                'id': 'tariffDesc'
            }),
            'price': forms.NumberInput(attrs={
                'class': 'tariff__price-input',
                'placeholder': 'Стоимость подписки',
                'min': '1',
                'id': 'tariffPrice'
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
                'id': 'maxSubscribers'
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