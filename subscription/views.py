from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import CreateView, UpdateView, ListView
from django.urls import reverse_lazy
from django.views import View
import json
from user.models import CustomUser
from .models import Subscription, UserSubscription
from .forms import SubscriptionForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from datetime import timedelta



class SubscriptionCreateView(LoginRequiredMixin, CreateView):
    model = Subscription
    form_class = SubscriptionForm
    template_name = 'subscription/create_subscription.html'
    success_url = reverse_lazy('subscription:subscription_list')
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['creator'] = self.request.user
        return kwargs
    
    def form_valid(self, form):
        messages.success(self.request, 'Подписка успешно создана!')
        return super().form_valid(form)
    
    def form_invalid(self, form):
        messages.error(self.request, 'Пожалуйста, исправьте ошибки в форме.')
        return super().form_invalid(form)

def create_subscription(request):
    if request.method == 'POST':
        form = SubscriptionForm(request.POST, request.FILES, creator=request.user)
        if form.is_valid():
            subscription = form.save()
            messages.success(request, 'Подписка успешно создана!')
            return redirect('subscription:subscription_list')
        else:
            messages.error(request, 'Пожалуйста, исправьте ошибки в форме.')
    else:
        form = SubscriptionForm(creator=request.user)
    
    return render(request, 'subscription/create_subscription.html', {'form': form})

class SubscriptionListView(LoginRequiredMixin, ListView):
    model = Subscription
    template_name = 'subscription/list_subscription.html'
    context_object_name = 'subscriptions'
    paginate_by = 10
    
    def get_queryset(self):
        # Фильтруем только платные подписки текущего пользователя
        return Subscription.objects.filter(
            creator=self.request.user,
            price__gt=0  # Только платные подписки (цена > 0)
        ).order_by('-created_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Можно добавить информацию о количестве подписок
        queryset = self.get_queryset()
        context['subscriptions_count'] = queryset.count()
        context['has_subscriptions'] = queryset.exists()
        return context

class SubscriptionUpdateView(LoginRequiredMixin, UpdateView):
    model = Subscription
    form_class = SubscriptionForm
    template_name = 'subscription/create_subscription.html'
    success_url = reverse_lazy('subscription:subscription_list')
    
    def get_queryset(self):
        return Subscription.objects.filter(creator=self.request.user)
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['creator'] = self.request.user
        return kwargs
    
    def form_valid(self, form):
        messages.success(self.request, 'Подписка успешно обновлена!')
        return super().form_valid(form)

class UserSubscriptionsListView(LoginRequiredMixin, ListView):
    model = UserSubscription
    template_name = 'subscription/list_my_subscriptions.html'
    context_object_name = 'user_subscriptions'
    paginate_by = 12
    
    def get_queryset(self):
        # Получаем активные подписки пользователя
        return UserSubscription.objects.filter(
            user=self.request.user,
            is_active=True
        ).select_related('subscription', 'subscription__creator').order_by('-subscribed_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Разделяем на платные и бесплатные подписки
        user_subscriptions = self.get_queryset()
        
        paid_subscriptions = []
        free_subscriptions = []
        
        for user_sub in user_subscriptions:
            subscription_data = {
                'user_subscription': user_sub,
                'subscription': user_sub.subscription,
                'creator': user_sub.subscription.creator,
                'days_left': self.calculate_days_left(user_sub.expires_at),
                'price': user_sub.subscription.final_price,
                'is_paid': user_sub.subscription.price > 0,
                'user_subscription_id': user_sub.id  # Добавляем ID для отписки
            }
            
            if user_sub.subscription.price > 0:
                paid_subscriptions.append(subscription_data)
            else:
                free_subscriptions.append(subscription_data)
        
        context['paid_subscriptions'] = paid_subscriptions
        context['free_subscriptions'] = free_subscriptions
        context['has_paid_subscriptions'] = len(paid_subscriptions) > 0
        context['has_free_subscriptions'] = len(free_subscriptions) > 0
        
        return context
    
    def calculate_days_left(self, expires_at):
        """Рассчитывает количество дней до истечения подписки"""
        from django.utils import timezone
        today = timezone.now().date()
        expires_date = expires_at.date()
        days_left = (expires_date - today).days
        return max(0, days_left)
    

@method_decorator(csrf_exempt, name='dispatch')
class SubscribeView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            subscription_id = data.get('subscription_id')
            author_id = data.get('author_id')
            
            subscription = get_object_or_404(Subscription, id=subscription_id)
            author = get_object_or_404(CustomUser, id=author_id)
            
            # Проверяем, не подписан ли уже пользователь
            existing_subscription = UserSubscription.objects.filter(
                user=request.user,
                subscription=subscription,
                is_active=True
            ).first()
            
            if existing_subscription:
                return JsonResponse({
                    'success': False,
                    'message': 'Вы уже подписаны на эту подписку'
                })
            
            # Создаем подписку пользователя

            
            expires_at = timezone.now()
            if subscription.has_trial_period:
                expires_at += timedelta(days=subscription.trial_days)
            else:
                expires_at += timedelta(days=30)  # Стандартный период 30 дней
            
            user_subscription = UserSubscription.objects.create(
                user=request.user,
                subscription=subscription,
                expires_at=expires_at,
                is_active=True
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Вы успешно подписались!',
                'subscription_id': subscription_id
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Ошибка при подписке: {str(e)}'
            })

@method_decorator(csrf_exempt, name='dispatch')
class UnsubscribeView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            subscription_id = data.get('subscription_id')
            
            # Деактивируем подписку пользователя
            user_subscription = UserSubscription.objects.filter(
                user=request.user,
                subscription_id=subscription_id,
                is_active=True
            ).first()
            
            if user_subscription:
                user_subscription.is_active = False
                user_subscription.save()
                
                return JsonResponse({
                    'success': True,
                    'message': 'Вы успешно отписались'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Подписка не найдена'
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Ошибка при отписке: {str(e)}'
            })
        

@method_decorator(csrf_exempt, name='dispatch')
class ToggleSubscriptionView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            author_id = data.get('author_id')
            
            author = get_object_or_404(CustomUser, id=author_id)
            
            # Проверяем, что пользователь не пытается подписаться на себя
            if author == request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'Нельзя подписаться на самого себя'
                })
            
            # Ищем ТОЛЬКО бесплатную подписку автора
            free_subscription = Subscription.objects.filter(
                creator=author,
                price=0,  # Только бесплатная подписка
                is_active=True
            ).first()
            
            # Если нет бесплатной подписки - создаем ее
            if not free_subscription:
                free_subscription = Subscription.objects.create(
                    name="Бесплатная подписка",
                    description="Базовая бесплатная подписка на контент автора",
                    creator=author,
                    price=0,
                    is_active=True
                )
            
            # Ищем подписку пользователя на БЕСПЛАТНУЮ подписку этого автора
            user_subscription = UserSubscription.objects.filter(
                user=request.user,
                subscription=free_subscription  # Только бесплатная подписка
            ).first()
            
            if user_subscription:
                # Переключаем статус ТОЛЬКО этой бесплатной подписки
                if user_subscription.is_active:
                    # Отписываемся от бесплатной подписки
                    user_subscription.is_active = False
                    user_subscription.save()
                    message = 'Вы успешно отписались от бесплатной подписки'
                    is_subscribed = False
                    button_text = 'Подписаться'
                else:
                    # Подписываемся на бесплатную подписку
                    user_subscription.is_active = True
                    user_subscription.expires_at = timezone.now() + timedelta(days=365 * 10)
                    user_subscription.save()
                    message = 'Вы успешно подписались на бесплатную подписку!'
                    is_subscribed = True
                    button_text = 'Отписаться'
            else:
                # Создаем новую подписку на бесплатный контент
                UserSubscription.objects.create(
                    user=request.user,
                    subscription=free_subscription,
                    expires_at=timezone.now() + timedelta(days=365 * 10),
                    is_active=True
                )
                message = 'Вы успешно подписались на бесплатную подписку!'
                is_subscribed = True
                button_text = 'Отписаться'
            
            # Считаем только подписчиков на БЕСПЛАТНУЮ подписку этого автора
            subscribers_count = UserSubscription.objects.filter(
                subscription__creator=author,
                subscription__price=0,  # Только бесплатные подписки
                is_active=True,
                expires_at__gt=timezone.now()
            ).count()
            
            return JsonResponse({
                'success': True,
                'message': message,
                'is_subscribed': is_subscribed,
                'subscribers_count': subscribers_count,
                'button_text': button_text
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Ошибка: {str(e)}'
            })
        

@method_decorator(csrf_exempt, name='dispatch')
class CancelSubscriptionView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            user_subscription_id = data.get('user_subscription_id')
            
            # Находим подписку пользователя
            user_subscription = get_object_or_404(
                UserSubscription, 
                id=user_subscription_id,
                user=request.user  # Проверяем, что подписка принадлежит пользователю
            )
            
            # Деактивируем подписку
            user_subscription.is_active = False
            user_subscription.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Подписка успешно отменена'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Ошибка при отмене подписки: {str(e)}'
            })