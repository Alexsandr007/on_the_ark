document.addEventListener('DOMContentLoaded', function() {
    const subscriptionToggleBtn = document.getElementById('subscriptionToggleBtn');
    
    if (subscriptionToggleBtn) {
        subscriptionToggleBtn.addEventListener('click', function() {
            const authorId = this.dataset.authorId;
            const isCurrentlySubscribed = this.classList.contains('subscribed');
            
            toggleSubscription(authorId, isCurrentlySubscribed, this);
        });
    }
    
    function toggleSubscription(authorId, isCurrentlySubscribed, button) {
        // Показываем индикатор загрузки
        const originalText = button.querySelector('#subscriptionText').textContent;
        button.querySelector('#subscriptionText').textContent = 'Загрузка...';
        button.disabled = true;
        
        fetch('/subscription/toggle-subscription/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                author_id: authorId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Обновляем текст кнопки
                button.querySelector('#subscriptionText').textContent = data.button_text;
                
                // Обновляем класс кнопки
                if (data.is_subscribed) {
                    button.classList.add('subscribed');
                } else {
                    button.classList.remove('subscribed');
                }
                
                // Обновляем счетчик подписчиков
                document.getElementById('subscribersCount').textContent = 
                    data.subscribers_count + ' Подписчиков';
                
                // Показываем уведомление
                showNotification(data.message, 'success');
                
                // Обновляем доступ к постам (если нужно)
                updatePostsAccess(data.is_subscribed);
            } else {
                button.querySelector('#subscriptionText').textContent = originalText;
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            button.querySelector('#subscriptionText').textContent = originalText;
            showNotification('Ошибка сети', 'error');
        })
        .finally(() => {
            button.disabled = false;
        });
    }
    
    function updatePostsAccess(isSubscribed) {
        // Если нужно динамически обновлять доступ к постам
        // Можно добавить логику здесь
        console.log('Subscription status changed:', isSubscribed);
    }
    
    function showNotification(message, type) {
        // Создаем и показываем уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 50000);
    }
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
