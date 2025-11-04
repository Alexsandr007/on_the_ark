function handleLike(postId) {
    const likeBtn = document.querySelector(`.like-btn[data-post-id="${postId}"]`);
    const likeIcon = likeBtn.querySelector('.like-icon');
    const likesCount = likeBtn.querySelector('.likes-count');
    
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
            likesCount.textContent = data.likes_count;
            
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

document.addEventListener('DOMContentLoaded', function() {
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            handleLike(postId);
        });
    });
});