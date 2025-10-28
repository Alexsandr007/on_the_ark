from django import forms
from .models import Post, Tag, Media, Poll, PollOption
from django.core.validators import FileExtensionValidator

class PostForm(forms.ModelForm):
    tags_input = forms.CharField(max_length=500, required=False, widget=forms.TextInput(attrs={'placeholder': 'Теги, не более 6'}), label="Теги")
    ad_description = forms.CharField(max_length=150, required=False, widget=forms.Textarea(attrs={'placeholder': 'О рекламодателе'}), label="Описание рекламодателя")

    class Meta:
        model = Post
        fields = ['title', 'content', 'visibility', 'is_ad', 'scheduled_at', 'comments_disabled']
        widgets = {
            'title': forms.TextInput(attrs={'placeholder': 'Заголовок'}),
            'content': forms.Textarea(attrs={'placeholder': 'Текст поста'}),
            'scheduled_at': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            self.fields['tags_input'].initial = ', '.join([tag.name for tag in self.instance.tags.all()])

    def save(self, commit=True):
        instance = super().save(commit=False)
        tags_str = self.cleaned_data.get('tags_input', '')
        tag_names = [name.strip() for name in tags_str.split(',') if name.strip()][:6]  # Ограничение 6 тегами
        if commit:
            instance.save()
            instance.tags.set([Tag.objects.get_or_create(name=name)[0] for name in tag_names])
        return instance
class MediaForm(forms.ModelForm):
    class Meta:
        model = Media
        fields = ['media_type', 'file']
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Добавляем валидаторы в зависимости от media_type
        if 'media_type' in self.data:
            media_type = self.data['media_type']
            if media_type == 'photo':
                self.fields['file'].validators.append(FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']))
            elif media_type == 'video':
                self.fields['file'].validators.append(FileExtensionValidator(['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']))
            elif media_type == 'audio':
                self.fields['file'].validators.append(FileExtensionValidator(['mp3', 'wav', 'flac', 'aac', 'ogg']))
            # Для голосования файлы не нужны, но если случайно, блокируем
    def clean_file(self):
        file = self.cleaned_data.get('file')
        if file:
            # Проверка MIME-типа для дополнительной защиты
            allowed_mime = {
                'photo': ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'],
                'video': ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm'],
                'audio': ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg']
            }
            media_type = self.data.get('media_type')
            if media_type in allowed_mime and file.content_type not in allowed_mime[media_type]:
                raise forms.ValidationError(f"Неверный тип файла для {media_type}.")
        return file

class PollForm(forms.ModelForm):
    options = forms.CharField(widget=forms.Textarea(attrs={'placeholder': 'Варианты через запятую'}), label="Варианты голосования")

    class Meta:
        model = Poll
        fields = ['question']

    def save(self, commit=True):
        poll = super().save(commit=False)
        if commit:
            poll.save()
            options_str = self.cleaned_data.get('options', '')
            for option in options_str.split(','):
                if option.strip():
                    PollOption.objects.create(poll=poll, option_text=option.strip())
        return poll