# middleware.py
from .models import UserSession
from django.utils import timezone
import user_agents

class UserSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        if request.user.is_authenticated:
            session_key = request.session.session_key
            if session_key:
                user_agent_string = request.META.get('HTTP_USER_AGENT', '')
                user_agent = user_agents.parse(user_agent_string)
                
                if user_agent.is_mobile:
                    if user_agent.device.family == "iPhone":
                        device_info = f"IPhone {request.user.first_name or request.user.username}"
                    else:
                        device_info = f"{user_agent.device.family} {request.user.first_name or request.user.username}"
                else:
                    device_info = f"{user_agent.browser.family} {user_agent.browser.version_string}, {user_agent.os.family}"
                
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    ip = x_forwarded_for.split(',')[0]
                else:
                    ip = request.META.get('REMOTE_ADDR')
                
                print(f"Сохранение сессии: {session_key} для пользователя {request.user.username}") 
                
                UserSession.objects.update_or_create(
                    session_key=session_key,
                    user=request.user,
                    defaults={
                        'user_agent': user_agent_string,
                        'ip_address': ip,
                        'device_info': device_info,
                        'location': 'Россия',  
                        'last_activity': timezone.now(),
                        'is_current': True
                    }
                )
        
        return response