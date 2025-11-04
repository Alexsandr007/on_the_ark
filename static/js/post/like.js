// Функция для обработки лайков
function handleLike(postId) {
    const likeBtn = document.querySelector(`.like-btn[data-post-id="${postId}"]`);
    const likeIcon = likeBtn.querySelector('.like-icon');
    const likesCount = likeBtn.querySelector('.likes-count');
    
    // Отправляем AJAX запрос
    fetch(`/post/like/${postId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Обновляем счетчик лайков
            likesCount.textContent = data.likes_count;
            
            // Управляем CSS классом вместо прямого изменения стилей
            if (data.liked) {
                likeBtn.classList.add('active');
            } else {
                likeBtn.classList.remove('active');
            }
        } else {
            console.error('Ошибка:', data.error);
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
}

// Функция для получения CSRF токена
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

// Добавляем обработчики событий для всех кнопок лайков
document.addEventListener('DOMContentLoaded', function() {
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            handleLike(postId);
        });
    });
});