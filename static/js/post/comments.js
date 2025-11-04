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
    
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        commentBtn.classList.add('active');
    } else {
        commentsSection.style.display = 'none';
        commentBtn.classList.remove('active');
    }
}

function submitComment(postId) {
    const form = document.querySelector(`.comment-form[data-post-id="${postId}"]`);
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
            textarea.value = '';
            
            const commentsCount = document.querySelector(`.comment-btn[data-post-id="${postId}"] .comments-count`);
            commentsCount.textContent = data.comments_count;
            
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
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    });
}

function addCommentToUI(postId, commentData) {
    const commentsList = document.querySelector(`#comments-section-${postId} .comments-list`);
    
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

document.addEventListener('DOMContentLoaded', function() {
    const commentButtons = document.querySelectorAll('.comment-btn');
    commentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            toggleComments(postId);
        });
    });
    
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const postId = this.getAttribute('data-post-id');
            submitComment(postId);
        });
    });
    
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