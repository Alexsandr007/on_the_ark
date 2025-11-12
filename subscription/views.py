from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import CreateView, UpdateView, ListView
from django.urls import reverse_lazy
from .models import Subscription, UserSubscription
from .forms import SubscriptionForm

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
        return Subscription.objects.filter(
            creator=self.request.user
        ).order_by('-created_at')

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

# Новое представление для отображения подписок пользователя
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
                'is_paid': user_sub.subscription.price > 0
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