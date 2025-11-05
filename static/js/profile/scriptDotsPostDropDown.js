// Обработчик клика по всем триггерам выпадающих меню
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики для всех выпадающих меню
    const dropdownTriggers = document.querySelectorAll('.dropdown__trigger');
    
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Закрываем все открытые меню
            const openMenus = document.querySelectorAll('.dropdown__menu.show');
            openMenus.forEach(menu => {
                menu.classList.remove('show');
            });
            
            // Открываем текущее меню
            const menu = this.nextElementSibling;
            if (menu && menu.classList.contains('dropdown__menu')) {
                menu.classList.add('show');
            }
        });
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        // Если клик не по триггеру и не по самому меню
        if (!e.target.closest('.dropdown__trigger') && !e.target.closest('.dropdown__menu')) {
            const openMenus = document.querySelectorAll('.dropdown__menu.show');
            openMenus.forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Закрытие меню при клике на пункт меню (если нужно)
    const dropdownItems = document.querySelectorAll('.dropdown__item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            const menu = this.closest('.dropdown__menu');
            if (menu) {
                menu.classList.remove('show');
            }
        });
    });
});

// Функция для удаления поста (остается без изменений)
function deletePost(postId) {
    if (confirm('Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.')) {
        const csrftoken = getCookie('csrftoken');
        
        fetch(`/post/delete/${postId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Ошибка при удалении поста');
        })
        .then(data => {
            if (data.success) {
                showNotification('Пост успешно удален', 'success');
                
                // Находим и удаляем весь элемент поста
                const postElement = document.querySelector(`.profile__articles--item [data-post-id="${postId}"]`);
                if (postElement) {
                    postElement.closest('.profile__articles--item').remove();
                }
                
                // Если постов не осталось, показываем сообщение
                if (!document.querySelector('.profile__articles--item')) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            } else {
                throw new Error(data.error || 'Ошибка при удалении');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Ошибка при удалении поста: ' + error.message, 'error');
        });
    }
}

// Остальные функции без изменений
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else {
        notification.style.background = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Добавляем CSS для анимации уведомлений
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}