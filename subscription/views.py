from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.generic import CreateView, UpdateView, ListView
from django.urls import reverse_lazy
from .models import Subscription
from .forms import SubscriptionForm

class SubscriptionCreateView(CreateView):
    model = Subscription
    form_class = SubscriptionForm
    template_name = 'subscription/create_subscription.html'
    success_url = reverse_lazy('subscription:subscription_list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Подписка успешно создана!')
        return super().form_valid(form)
    
    def form_invalid(self, form):
        messages.error(self.request, 'Пожалуйста, исправьте ошибки в форме.')
        return super().form_invalid(form)

def create_subscription(request):
    if request.method == 'POST':
        form = SubscriptionForm(request.POST, request.FILES)
        if form.is_valid():
            subscription = form.save()
            messages.success(request, 'Подписка успешно создана!')
            return redirect('subscription:subscription_list')
        else:
            messages.error(request, 'Пожалуйста, исправьте ошибки в форме.')
    else:
        form = SubscriptionForm()
    
    return render(request, 'subscription/create_subscription.html', {'form': form})

class SubscriptionListView(ListView):
    model = Subscription
    template_name = 'subscription/subscription_list.html'
    context_object_name = 'subscriptions'
    paginate_by = 10

class SubscriptionUpdateView(UpdateView):
    model = Subscription
    form_class = SubscriptionForm
    template_name = 'subscription/create_subscription.html'
    success_url = reverse_lazy('subscription:subscription_list')