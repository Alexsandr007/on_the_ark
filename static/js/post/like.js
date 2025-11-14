function handleLike(postId) {
    const likeBtn = document.querySelector(`.like-btn[data-post-id="${postId}"]`);
    
    if (!likeBtn) {
        console.error('Кнопка лайка не найдена для поста:', postId);
        return;
    }
    
    const likesCount = likeBtn.querySelector('.likes-count');
    
    if (!likesCount) {
        console.error('Элемент счетчика лайков не найден для поста:', postId);
        return;
    }
    
    fetch(`/post/like/${postId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Обновляем счетчик только для текущей кнопки
            likesCount.textContent = data.likes_count;
            
            if (data.liked) {
                likeBtn.classList.add('active');
            } else {
                likeBtn.classList.remove('active');
            }
            
            console.log('Лайк обновлен:', data);
        } else {
            console.error('Ошибка от сервера:', data.error);
        }
    })
    .catch(error => {
        console.error('Ошибка сети:', error);
    });
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

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const postId = this.getAttribute('data-post-id');
            console.log('Лайк для поста:', postId);
            handleLike(postId);
        });
    });
    
    console.log('Инициализировано кнопок лайка:', likeButtons.length);
});

// Функция для отладки
window.debugLikes = function() {
    const likeButtons = document.querySelectorAll('.like-btn');
    console.log('Все кнопки лайков:', likeButtons);
    likeButtons.forEach(btn => {
        const postId = btn.getAttribute('data-post-id');
        const count = btn.querySelector('.likes-count');
        console.log(`Пост ${postId}:`, {
            element: btn,
            countElement: count,
            currentCount: count ? count.textContent : 'не найден'
        });
    });
};