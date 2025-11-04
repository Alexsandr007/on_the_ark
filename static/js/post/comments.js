// Функция для получения CSRF токена
function getCsrfToken() {
    // Сначала попробуем найти токен в форме
    const csrfTokenInput = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfTokenInput) {
        return csrfTokenInput.value;
    }
    
    // Если нет в форме, ищем в cookies
    return getCookie('csrftoken');
}

// Функция для получения cookie
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

// Функция для переключения отображения комментариев
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-section-${postId}`);
    const commentBtn = document.querySelector(`.comment-btn[data-post-id="${postId}"]`);
    
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        commentBtn.classList.add('active');
    } else {
        commentsSection.style.display = 'none';
        commentBtn.classList.remove('active');
    }
}

// Функция для отправки комментария
function submitComment(postId) {
    const form = document.querySelector(`.comment-form[data-post-id="${postId}"]`);
    const textarea = form.querySelector('.comment-input');
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        alert('Введите текст комментария');
        return;
    }
    
    // Показываем индикатор загрузки
    const submitBtn = form.querySelector('.comment-submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading-spinner"></div>';
    submitBtn.disabled = true;
    
    // Отправка AJAX запроса
    fetch(`/post/${postId}/comment/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken(),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `content=${encodeURIComponent(commentText)}&csrfmiddlewaretoken=${getCsrfToken()}`
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Очищаем текстовое поле
            textarea.value = '';
            
            // Обновляем счетчик комментариев
            const commentsCount = document.querySelector(`.comment-btn[data-post-id="${postId}"] .comments-count`);
            commentsCount.textContent = data.comments_count;
            
            // Добавляем новый комментарий в список
            addCommentToUI(postId, data.comment);
        } else {
            alert('Ошибка при отправке комментария: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке комментария');
    })
    .finally(() => {
        // Восстанавливаем кнопку
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    });
}

// Функция для добавления комментария в UI
function addCommentToUI(postId, commentData) {
    const commentsList = document.querySelector(`#comments-section-${postId} .comments-list`);
    
    // Если есть сообщение "нет комментариев", удаляем его
    const noComments = commentsList.querySelector('.no-comments');
    if (noComments) {
        noComments.remove();
    }
    
    const commentHTML = `
        <div class="comment-item">
            <div class="comment-author">
                <strong>${commentData.author_name}</strong>
            </div>
            <div class="comment-content">
                ${commentData.content}
            </div>
            <div class="comment-date">
                Только что
            </div>
        </div>
    `;
    
    commentsList.insertAdjacentHTML('afterbegin', commentHTML);
}

// Инициализация обработчиков событий
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
    
    // Обработчик для отправки комментария по Enter (с Shift+Enter для новой строки)
    const commentInputs = document.querySelectorAll('.comment-input');
    commentInputs.forEach(input => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const postId = this.closest('.comment-form').getAttribute('data-post-id');
                submitComment(postId);
            }
        });
    });
});