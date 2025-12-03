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
    
    if (commentsSection) {
        if (commentsSection.style.display === 'none' || !commentsSection.style.display) {
            commentsSection.style.display = 'block';
            if (commentBtn) {
                commentBtn.classList.add('active');
            }
        } else {
            commentsSection.style.display = 'none';
            if (commentBtn) {
                commentBtn.classList.remove('active');
            }
        }
    }
}

function setupReplyForm(commentId) {
    const replyFormContainer = document.getElementById(`reply-form-${commentId}`);
    const commentItem = document.getElementById(`comment-${commentId}`);
    
    if (!replyFormContainer || !commentItem) return;
    
    document.querySelectorAll('.reply-form-container').forEach(form => {
        if (form.id !== `reply-form-${commentId}`) {
            form.style.display = 'none';
            const otherCommentId = form.id.replace('reply-form-', '');
            const otherComment = document.getElementById(`comment-${otherCommentId}`);
            if (otherComment) {
                otherComment.classList.remove('replying');
            }
        }
    });
    
    replyFormContainer.style.display = 'block';
    
    const replyInput = replyFormContainer.querySelector('.reply-input');
    if (replyInput) {
        replyInput.focus();
        replyInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    commentItem.classList.add('replying');
}

function closeReplyForm(commentId) {
    const replyFormContainer = document.getElementById(`reply-form-${commentId}`);
    const commentItem = document.getElementById(`comment-${commentId}`);
    
    if (replyFormContainer) {
        replyFormContainer.style.display = 'none';
    }
    
    if (commentItem) {
        commentItem.classList.remove('replying');
    }
}

function toggleReplies(commentId) {
    const repliesContainer = document.getElementById(`replies-${commentId}`);
    const toggleBtn = document.querySelector(`.toggle-replies-btn[data-comment-id="${commentId}"]`);
    
    if (!repliesContainer || !toggleBtn) return;
    
    if (repliesContainer.style.display === 'none' || !repliesContainer.style.display) {
        repliesContainer.style.display = 'block';
        toggleBtn.classList.add('active');
    } else {
        repliesContainer.style.display = 'none';
        toggleBtn.classList.remove('active');
    }
}

let isSubmitting = false;

function submitComment(postId, parentId = null, replyToId = null) {
    if (isSubmitting) {
        console.log('Отправка уже в процессе...');
        return;
    }
    
    isSubmitting = true;
    
    let form;
    if (parentId || replyToId) {
        if (replyToId && replyToId !== parentId) {
            form = document.querySelector(`.reply-form[data-reply-to-id="${replyToId}"]`);
        } 
        if (!form && parentId) {
            form = document.querySelector(`.reply-form[data-parent-id="${parentId}"]`);
        }
        if (!form && replyToId) {
            form = document.querySelector(`.reply-form[data-reply-to-id="${replyToId}"]`);
        }
    } else {
        form = document.querySelector(`.comment-form.main-form[data-post-id="${postId}"]`);
    }
    
    if (!form) {
        console.error('Форма комментария не найдена');
        isSubmitting = false;
        return;
    }
    
    const textarea = form.querySelector('.comment-input');
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        alert('Введите текст комментария');
        isSubmitting = false;
        return;
    }
    
    if (!replyToId && form.hasAttribute('data-reply-to-id')) {
        replyToId = form.getAttribute('data-reply-to-id');
    }
    
    if (replyToId && !parentId) {
        const replyToElement = document.getElementById(`comment-${replyToId}`);
        if (replyToElement) {
            const rootComment = replyToElement.closest('.comment-item[data-nesting-level="0"]');
            if (rootComment) {
                parentId = rootComment.dataset.commentId;
            }
        }
    }
    
    const submitBtn = form.querySelector('.comment-submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading-spinner">⏳</div>';
    submitBtn.disabled = true;
    
    const formData = new FormData();
    formData.append('content', commentText);
    formData.append('csrfmiddlewaretoken', getCsrfToken());
    
    if (parentId) {
        formData.append('parent_id', parentId);
    }
    
    if (replyToId) {
        formData.append('reply_to_id', replyToId);
    }
    
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
            
            const commentsCountElement = document.querySelector(`.comment-btn[data-post-id="${postId}"] .comments-count`);
            if (commentsCountElement) {
                commentsCountElement.textContent = data.comments_count;
            }
            
            addCommentToUI(
                postId, 
                data.comment, 
                data.comment.parent_id, 
                data.comment.reply_to_id || data.comment.parent_id
            );
            
            const closeCommentId = replyToId || parentId;
            if (closeCommentId) {
                closeReplyForm(closeCommentId);
            }
            
            if (parentId || data.comment.parent_id) {
                const rootCommentId = parentId || data.comment.parent_id;
                const parentRepliesBtn = document.querySelector(`.toggle-replies-btn[data-comment-id="${rootCommentId}"]`);
                if (parentRepliesBtn) {
                    const repliesCountSpan = parentRepliesBtn.querySelector('.replies-count');
                    const repliesTextSpan = parentRepliesBtn.querySelector('.replies-text');
                    if (repliesCountSpan) {
                        const currentCount = parseInt(repliesCountSpan.textContent) || 0;
                        const newCount = currentCount + 1;
                        repliesCountSpan.textContent = newCount;
                        
                        if (repliesTextSpan) {
                            if (newCount === 1) {
                                repliesTextSpan.textContent = 'ответ';
                            } else if (newCount >= 2 && newCount <= 4) {
                                repliesTextSpan.textContent = 'ответа';
                            } else {
                                repliesTextSpan.textContent = 'ответов';
                            }
                        }
                    }
                }
            }
            
            console.log('Комментарий успешно добавлен');
        } else {
            console.error('Ошибка от сервера:', data.error);
            
            if (data.error && data.error.includes('нецензурную лексику')) {
                textarea.style.border = '2px solid #ff4444';
                textarea.style.backgroundColor = '#fff5f5';
                setTimeout(() => {
                    textarea.style.border = '';
                    textarea.style.backgroundColor = '';
                }, 3000);
                
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
        isSubmitting = false;
    });
}

function showCommentError(message) {
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
    
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function addCommentToUI(postId, commentData, parentId = null, replyToId = null) {
    let targetContainer;
    
    if (parentId) {
        const repliesContainer = document.getElementById(`replies-${parentId}`);
        if (!repliesContainer) {
            const parentComment = document.getElementById(`comment-${parentId}`);
            if (parentComment) {
                const newRepliesContainer = document.createElement('div');
                newRepliesContainer.className = 'replies-container';
                newRepliesContainer.id = `replies-${parentId}`;
                parentComment.appendChild(newRepliesContainer);
                targetContainer = newRepliesContainer;
                
                const toggleBtn = parentComment.querySelector('.toggle-replies-btn');
                if (toggleBtn) {
                    toggleBtn.style.display = 'flex';
                }
            } else {
                console.error('Родительский комментарий не найден:', parentId);
                return;
            }
        } else {
            targetContainer = repliesContainer;
        }
        
        const replyToUsername = commentData.reply_to_username || commentData.parent_author || '';
        
        const photoUrl = commentData.author_photo_url || '/static/images/profile/profile_default.png';
        const createdAt = commentData.created_at_formatted || commentData.created_at;
        
        const replyHTML = `
            <div class="comment-reply-item" 
                 data-comment-id="${commentData.id}" 
                 id="comment-${commentData.id}"
                 data-reply-to-id="${replyToId || parentId}">
                
                <div class="comment-reply-header">
                    <div class="comment-reply-author">
                        <img src="${photoUrl}" 
                             alt="${commentData.author_name}" 
                             class="comment-author-avatar comment-reply-avatar">
                        <div class="comment-reply-author-info">
                            <strong>${commentData.author_name}</strong>
                            ${replyToUsername ? `<span class="reply-to">→ @${replyToUsername}</span>` : ''}
                        </div>
                    </div>
                    
                    <!-- Кнопка ответа для вложенных комментариев -->
                    <div class="comment-reply-actions">
                        <button class="reply-btn" data-comment-id="${commentData.id}">
                            <img src="/static/images/post/reply.svg" alt="Ответить" class="reply-icon">
                        </button>
                    </div>
                </div>
                
                <div class="comment-reply-content">
                    ${commentData.content}
                </div>
                
                <div class="comment-reply-footer">
                    <div class="comment-reply-date">
                        ${createdAt}
                    </div>
                </div>
                
                <!-- Форма ответа на вложенный комментарий -->
                <div class="reply-form-container nested-reply-form" id="reply-form-${commentData.id}" style="display: none;">
                    <form class="comment-form reply-form" 
                          data-post-id="${postId}" 
                          data-parent-id="${parentId}"
                          data-reply-to-id="${commentData.id}">
                        <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrfToken()}">
                        <div class="comment-input-wrapper">
                            <textarea class="comment-input reply-input" 
                                     placeholder="Напишите ответ на @${commentData.author_name}..." 
                                     rows="2" required></textarea>
                            <button type="submit" class="comment-submit-btn">
                                Отправить
                            </button>
                        </div>
                        <button type="button" class="cancel-reply-btn" data-comment-id="${commentData.id}">
                            Отмена
                        </button>
                    </form>
                </div>
            </div>
        `;
        
        targetContainer.insertAdjacentHTML('beforeend', replyHTML);
        
    } else {
        const commentsTree = document.getElementById(`comments-tree-${postId}`);
        if (!commentsTree) {
            console.error('Дерево комментариев не найдено');
            return;
        }
        
        const noComments = commentsTree.querySelector('.no-comments');
        if (noComments) {
            noComments.remove();
        }
        
        targetContainer = commentsTree;
        
        const photoUrl = commentData.author_photo_url || '/static/images/profile/profile_default.png';
        const createdAt = commentData.created_at_formatted || commentData.created_at;
        
        const commentHTML = `
            <div class="comment-item" 
                 data-comment-id="${commentData.id}" 
                 id="comment-${commentData.id}"
                 data-nesting-level="0">
                
                <div class="comment-header">
                    <div class="comment-author">
                        <img src="${photoUrl}" 
                             alt="${commentData.author_name}" 
                             class="comment-author-avatar">
                        <div class="comment-author-info">
                            <strong>${commentData.author_name}</strong>
                        </div>
                    </div>
                    
                    <div class="comment-actions">
                        <button class="reply-btn" data-comment-id="${commentData.id}">
                            <img src="/static/images/post/reply.svg" alt="Ответить" class="reply-icon">
                            <span>Ответить</span>
                        </button>
                    </div>
                </div>
                
                <div class="comment-content">
                    ${commentData.content}
                </div>
                
                <div class="comment-footer">
                    <div class="comment-date">
                        ${createdAt}
                    </div>
                </div>
                
                <div class="reply-form-container" id="reply-form-${commentData.id}" style="display: none;">
                    <form class="comment-form reply-form" 
                          data-post-id="${postId}" 
                          data-parent-id="${commentData.id}"
                          data-reply-to-id="${commentData.id}">
                        <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrfToken()}">
                        <div class="comment-input-wrapper">
                            <textarea class="comment-input reply-input" 
                                     placeholder="Напишите ответ на @${commentData.author_name}..." 
                                     rows="2" required></textarea>
                            <button type="submit" class="comment-submit-btn">
                                Отправить
                            </button>
                        </div>
                        <button type="button" class="cancel-reply-btn" data-comment-id="${commentData.id}">
                            Отмена
                        </button>
                    </form>
                </div>
                
                <div class="replies-container" id="replies-${commentData.id}" style="display: none;"></div>
            </div>
        `;
        
        targetContainer.insertAdjacentHTML('afterbegin', commentHTML);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация комментариев...');
    
    const commentButtons = document.querySelectorAll('.comment-btn:not(.reply-btn)');
    commentButtons.forEach(button => {
        button.removeEventListener('click', handleToggleComments);
        button.addEventListener('click', handleToggleComments);
    });
    
    const mainForms = document.querySelectorAll('.comment-form.main-form');
    mainForms.forEach(form => {
        form.removeEventListener('submit', handleMainFormSubmit);
        form.addEventListener('submit', handleMainFormSubmit);
    });
    
    const commentInputs = document.querySelectorAll('.comment-input');
    commentInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
    
    console.log('Инициализация статических элементов завершена');
});

function handleToggleComments(e) {
    e.preventDefault();
    const postId = this.getAttribute('data-post-id');
    if (postId) {
        toggleComments(postId);
    }
}

function handleMainFormSubmit(e) {
    e.preventDefault();
    const postId = this.getAttribute('data-post-id');
    if (postId) {
        submitComment(postId);
    }
}

document.addEventListener('click', function(e) {
    const replyBtn = e.target.closest('.reply-btn');
    if (replyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const commentId = replyBtn.getAttribute('data-comment-id');
        if (commentId) {
            setupReplyForm(commentId);
        }
        return;
    }
    
    const cancelBtn = e.target.closest('.cancel-reply-btn');
    if (cancelBtn) {
        e.preventDefault();
        e.stopPropagation();
        const commentId = cancelBtn.getAttribute('data-comment-id');
        if (commentId) {
            closeReplyForm(commentId);
        }
        return;
    }
    
    const toggleBtn = e.target.closest('.toggle-replies-btn');
    if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        const commentId = toggleBtn.getAttribute('data-comment-id');
        if (commentId) {
            toggleReplies(commentId);
        }
        return;
    }
});

document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('comment-form')) {
        e.preventDefault();
        const form = e.target;
        const postId = form.getAttribute('data-post-id');
        const parentId = form.getAttribute('data-parent-id');
        const replyToId = form.getAttribute('data-reply-to-id');
        
        if (postId) {
            if (parentId || replyToId) {
                submitComment(postId, parentId, replyToId);
            } else {
                submitComment(postId);
            }
        }
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('comment-input')) {
            const form = activeElement.closest('.comment-form');
            if (form) {
                e.preventDefault();
                const postId = form.getAttribute('data-post-id');
                const parentId = form.getAttribute('data-parent-id');
                const replyToId = form.getAttribute('data-reply-to-id');
                
                if (parentId || replyToId) {
                    submitComment(postId, parentId, replyToId);
                } else {
                    submitComment(postId);
                }
            }
        }
    }
});

window.debugComments = function(postId) {
    console.log('Отладка комментариев для поста:', postId);
    const commentsSection = document.getElementById(`comments-section-${postId}`);
    const commentsTree = document.getElementById(`comments-tree-${postId}`);
    console.log('Секция комментариев:', commentsSection);
    console.log('Дерево комментариев:', commentsTree);
    if (commentsTree) {
        const rootComments = commentsTree.querySelectorAll('.comment-item[data-nesting-level="0"]');
        console.log('Количество корневых комментариев:', rootComments.length);
        rootComments.forEach(comment => {
            const commentId = comment.dataset.commentId;
            const replies = comment.querySelectorAll('.comment-reply-item');
            console.log(`Комментарий #${commentId}: ${replies.length} ответов`);
        });
    }
};

window.toggleComments = toggleComments;
window.submitComment = submitComment;
window.showCommentError = showCommentError;
window.setupReplyForm = setupReplyForm;
window.closeReplyForm = closeReplyForm;
window.toggleReplies = toggleReplies;