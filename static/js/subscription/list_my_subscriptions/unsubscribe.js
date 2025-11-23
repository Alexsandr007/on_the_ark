// Функция для отмены подписки
function cancelSubscription(userSubscriptionId, button) {
    // Показываем индикатор загрузки
    const originalText = button.textContent;
    button.textContent = 'Отмена...';
    button.disabled = true;
    
    fetch('/subscription/cancel-subscription/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            user_subscription_id: userSubscriptionId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Удаляем элемент из DOM
            const subscriptionElement = document.getElementById(`subscription-${userSubscriptionId}`);
            if (subscriptionElement) {
                subscriptionElement.remove();
            }
            
            // Показываем уведомление
            showNotification(data.message, 'success');
            
            // Проверяем, остались ли еще подписки
            checkEmptyState();
        } else {
            button.textContent = originalText;
            button.disabled = false;
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        button.textContent = originalText;
        button.disabled = false;
        showNotification('Ошибка сети', 'error');
    });
}

// Функция для проверки пустого состояния
function checkEmptyState() {
    const freeSubscriptionsContainer = document.querySelector('#free .advert__sessions--container');
    const paidSubscriptionsContainer = document.querySelector('#paid .advert__pay');
    
    // Проверяем бесплатные подписки
    if (freeSubscriptionsContainer && freeSubscriptionsContainer.children.length === 0) {
        const emptyStateHTML = `
            <div class="profile__articles--item">
                <h3>У вас нет бесплатных подписок</h3>
                <p>Подпишитесь на интересных авторов, чтобы следить за их обновлениями</p>
                <img src="{% static 'images/profile/sad_men.png' %}">
            </div>
        `;
        document.querySelector('#free .advert__content--profile').innerHTML = emptyStateHTML;
    }
    
    // Проверяем платные подписки (на будущее)
    if (paidSubscriptionsContainer && paidSubscriptionsContainer.children.length === 0) {
        const emptyStateHTML = `
            <div class="profile__articles--item">
                <h3>У вас нет платных подписок</h3>
                <p>Найдите интересных авторов и оформите подписку, чтобы поддержать их творчество</p>
                <img src="{% static 'images/profile/sad_men.png' %}">
            </div>
        `;
        document.querySelector('#paid .advert__content--profile').innerHTML = emptyStateHTML;
    }
}

// Обработчики для кнопок отмены подписки
document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для бесплатных подписок
    document.querySelectorAll('.cancel-subscription-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userSubscriptionId = this.dataset.userSubscriptionId;
            if (confirm('Вы уверены, что хотите отменить подписку?')) {
                cancelSubscription(userSubscriptionId, this);
            }
        });
    });
    
    // Обработчики для платных подписок (если нужно)
    document.querySelectorAll('.tip--right').forEach(button => {
        button.addEventListener('click', function() {
            // Здесь можно добавить логику для отмены платных подписок
            alert('Функция отмены платной подписки будет реализована позже');
        });
    });
});

// Вспомогательные функции
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
