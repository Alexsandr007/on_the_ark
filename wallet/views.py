from django.shortcuts import render

def wallet_view(request):
    return render(request, 'wallet/wallet.html')