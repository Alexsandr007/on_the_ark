from django.urls import path
from . import views

app_name = 'subscription'

urlpatterns = [
    path('create/', views.SubscriptionCreateView.as_view(), name='create_subscription'),
    path('', views.SubscriptionListView.as_view(), name='subscription_list'),
    path('<int:pk>/edit/', views.SubscriptionUpdateView.as_view(), name='edit_subscription'),
    path('my-subscriptions/', views.UserSubscriptionsListView.as_view(), name='my_subscriptions'),
]