from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import CreateView, UpdateView, ListView
from django.urls import reverse_lazy
from .models import Subscription
from .forms import SubscriptionForm

class SubscriptionCreateView(LoginRequiredMixin, CreateView):
    model = Subscription
    form_class = SubscriptionForm
    template_name = 'subscription/create_subscription.html'
    success_url = reverse_lazy('subscription:subscription_list')
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        # Передаем текущего пользователя как создателя
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
        # Фильтруем подписки по текущему пользователю
        return Subscription.objects.filter(
            creator=self.request.user
        ).order_by('-created_at')

class SubscriptionUpdateView(LoginRequiredMixin, UpdateView):
    model = Subscription
    form_class = SubscriptionForm
    template_name = 'subscription/create_subscription.html'
    success_url = reverse_lazy('subscription:subscription_list')
    
    def get_queryset(self):
        # Разрешаем редактировать только свои подписки
        return Subscription.objects.filter(creator=self.request.user)
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        # При редактировании также передаем пользователя
        kwargs['creator'] = self.request.user
        return kwargs
    
    def form_valid(self, form):
        messages.success(self.request, 'Подписка успешно обновлена!')
        return super().form_valid(form)