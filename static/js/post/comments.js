function getCsrfToken() {
    const csrfTokenInput = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfTokenInput) {
        return csrfTokenInput.value;
    }
    
    return getCookie('csrftoken');
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

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-section-${postId}`);
    const commentBtn = document.querySelector(`.comment-btn[data-post-id="${postId}"]`);
    
    if (commentsSection.style.display === 'none' || !commentsSection.style.display) {
        commentsSection.style.display = 'block';
        commentBtn.classList.add('active');
    } else {
        commentsSection.style.display = 'none';
        commentBtn.classList.remove('active');
    }
}

function submitComment(postId) {
    const form = document.querySelector(`.comment-form[data-post-id="${postId}"]`);
    if (!form) {
        console.error('Форма комментария не найдена для поста:', postId);
        return;
    }
    
    const textarea = form.querySelector('.comment-input');
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        alert('Введите текст комментария');
        return;
    }
    
    const submitBtn = form.querySelector('.comment-submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading-spinner"></div>';
    submitBtn.disabled = true;
    
    // Создаем FormData для правильной отправки
    const formData = new FormData();
    formData.append('content', commentText);
    formData.append('csrfmiddlewaretoken', getCsrfToken());
    
    fetch(`/post/${postId}/comment/`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            textarea.value = '';
            
            // Обновляем счетчик комментариев
            const commentsCountElement = document.querySelector(`.comment-btn[data-post-id="${postId}"] .comments-count`);
            if (commentsCountElement) {
                commentsCountElement.textContent = data.comments_count;
            }
            
            // Добавляем комментарий в UI
            addCommentToUI(postId, data.comment);
            
            console.log('Комментарий успешно добавлен');
        } else {
            // Показываем ошибку, включая ошибку нецензурной лексики
            console.error('Ошибка от сервера:', data.error);
            
            // Специальная обработка для ошибки нецензурной лексики
            if (data.error && data.error.includes('нецензурную лексику')) {
                // Выделяем поле ввода
                textarea.style.border = '2px solid #ff4444';
                textarea.style.backgroundColor = '#fff5f5';
                setTimeout(() => {
                    textarea.style.border = '';
                    textarea.style.backgroundColor = '';
                }, 3000);
                
                // Показываем сообщение об ошибке
                showCommentError(data.error);
            } else {
                alert('Ошибка при отправке комментария: ' + data.error);
            }
        }
    })
    .catch(error => {
        console.error('Ошибка сети:', error);
        alert('Произошла ошибка при отправке комментария');
    })
    .finally(() => {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    });
}

// Функция для показа ошибки комментария
function showCommentError(message) {
    // Создаем или находим элемент для показа ошибок
    let errorElement = document.querySelector('.comment-error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'comment-error-message';
        errorElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgb(229 179 26);;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(errorElement);
        
        // Добавляем CSS анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Обновите функцию addCommentToUI для использования правильного формата даты
function addCommentToUI(postId, commentData) {
    const commentsList = document.querySelector(`#comments-section-${postId} .comments-list`);
    if (!commentsList) {
        console.error('Список комментариев не найден для поста:', postId);
        return;
    }
    
    const noComments = commentsList.querySelector('.no-comments');
    if (noComments) {
        noComments.remove();
    }
    
    // Используем фото из данных или дефолтное
    const photoUrl = commentData.author_photo_url || '/static/images/profile/profile_default.png';
    // Используем форматированную дату или стандартную
    const createdAt = commentData.created_at_formatted || commentData.created_at;
    
    const commentHTML = `
        <div class="comment-item">
            <div class="comment-author">
                <img src="${photoUrl}" 
                     alt="${commentData.author_name}" 
                     class="comment-author-avatar">
                <strong>${commentData.author_name}</strong>
            </div>
            <div class="comment-content">
                ${commentData.content}
            </div>
            <div class="comment-date">
                ${createdAt}
            </div>
        </div>
    `;
    
    commentsList.insertAdjacentHTML('afterbegin', commentHTML);
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для кнопок комментариев
    const commentButtons = document.querySelectorAll('.comment-btn');
    commentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            toggleComments(postId);
        });
    });
    
    // Обработчики для форм комментариев
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const postId = this.getAttribute('data-post-id');
            submitComment(postId);
        });
    });
    
    // Обработчики Enter для текстовых полей
    const commentInputs = document.querySelectorAll('.comment-input');
    commentInputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const postId = this.closest('.comment-form').getAttribute('data-post-id');
                submitComment(postId);
            }
        });
        
        // Автоматическое увеличение высоты текстового поля
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
});

// Глобальная функция для отладки
window.debugComments = function(postId) {
    console.log('Отладка комментариев для поста:', postId);
    const commentsSection = document.getElementById(`comments-section-${postId}`);
    const form = document.querySelector(`.comment-form[data-post-id="${postId}"]`);
    console.log('Секция комментариев:', commentsSection);
    console.log('Форма:', form);
};