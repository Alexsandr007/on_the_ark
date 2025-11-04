document.addEventListener('DOMContentLoaded', function() {
    const terminateBtn = document.getElementById('terminate-sessions-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const sessionsContainer = document.getElementById('sessions-container');
    const messageContainer = document.getElementById('session-message');

    // Проверяем, что элементы существуют
    if (!terminateBtn || !sessionsContainer) {
        console.error('Не найдены необходимые элементы на странице');
        return;
    }

    // Обработчик изменения состояния чекбоксов
    sessionsContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('session-checkbox')) {
            updateTerminateButtonState();
        }
    });

    // Кнопка "Выбрать все"
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.session-checkbox');
            const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = !allChecked;
            });
            
            updateTerminateButtonState();
            selectAllBtn.textContent = allChecked ? 'Выбрать все' : 'Снять все';
        });
    }

    // Кнопка завершения сессий
    terminateBtn.addEventListener('click', function() {
        const selectedSessions = getSelectedSessions();
        
        if (selectedSessions.length === 0) {
            showMessage('Выберите хотя бы одну сессию для завершения', 'error');
            return;
        }

        // Показываем индикатор загрузки
        terminateBtn.disabled = true;
        const originalText = terminateBtn.textContent;
        terminateBtn.textContent = 'Завершение...';
        
        // Получаем CSRF токен
        const csrftoken = getCookie('csrftoken');
        
        // Отправляем AJAX запрос
        fetch('/sessions/terminate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                selected_sessions: selectedSessions
            })
        })
        .then(response => {
            // Сначала проверяем статус ответа
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Проверяем Content-Type перед парсингом JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Ожидался JSON ответ, но получили: ' + contentType);
            }
            
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                showMessage(data.message, 'success');
                updateSessionsList(data.sessions);
                updateTerminateButtonState();
                
                // Обновляем кнопку "Выбрать все" если она есть
                if (selectAllBtn) {
                    selectAllBtn.textContent = 'Выбрать все';
                }
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message.includes('JSON')) {
                showMessage('Ошибка сервера: неверный формат ответа', 'error');
            } else if (error.message.includes('HTTP error! status: 403')) {
                showMessage('Ошибка доступа. Пожалуйста, обновите страницу.', 'error');
            } else if (error.message.includes('HTTP error! status: 401')) {
                showMessage('Вы не авторизованы. Пожалуйста, войдите снова.', 'error');
            } else {
                showMessage('Произошла ошибка при завершении сессий: ' + error.message, 'error');
            }
        })
        .finally(() => {
            // Восстанавливаем кнопку
            terminateBtn.disabled = false;
            terminateBtn.textContent = originalText;
        });
    });

    function getSelectedSessions() {
        const checkboxes = document.querySelectorAll('.session-checkbox:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    function updateTerminateButtonState() {
        const selectedCount = getSelectedSessions().length;
        if (terminateBtn) {
            terminateBtn.disabled = selectedCount === 0;
            
            if (selectedCount > 0) {
                terminateBtn.textContent = `Завершить выбранные (${selectedCount})`;
            } else {
                terminateBtn.textContent = 'Завершить выбранные сессии';
            }
        }
    }

    function updateSessionsList(sessions) {
        // Очищаем контейнер
        sessionsContainer.innerHTML = '';
        
        if (sessions.length === 0) {
            const noSessionsElem = document.createElement('div');
            noSessionsElem.id = 'no-sessions-message';
            noSessionsElem.style.textAlign = 'center';
            noSessionsElem.style.padding = '20px';
            noSessionsElem.style.color = '#666';
            noSessionsElem.innerHTML = `
                <p>Нет активных сессий</p>
                <small>Сессии появятся после авторизации на разных устройствах</small>
            `;
            sessionsContainer.appendChild(noSessionsElem);
        } else {
            sessions.forEach(session => {
                const sessionItem = createSessionElement(session);
                sessionsContainer.appendChild(sessionItem);
            });
        }
        
        // Добавляем footer текст
        const footerText = document.createElement('p');
        footerText.className = 'edit__sessions--footer-text';
        footerText.textContent = sessions.length > 1 ? 
            'Выберите сессии, которые хотите завершить.' : 
            'Для завершения других сессий войдите с другого устройства.';
        sessionsContainer.appendChild(footerText);
    }

    function createSessionElement(session) {
        const sessionItem = document.createElement('div');
        sessionItem.className = 'edit__sessions--item';
        sessionItem.dataset.sessionKey = session.session_key;
        
        if (session.is_current) {
            sessionItem.dataset.current = 'true';
        }

        const sessionBlock = document.createElement('div');
        sessionBlock.className = 'edit__sessions--block';
        
        // Используем правильные пути к статическим файлам
        const browserIcon = '/static/images/profile/settingsProfile/icon4-4.png';
        const appleIcon = '/static/images/profile/settingsProfile/social/apple.png';
        
        if (session.is_current) {
            sessionBlock.innerHTML = `
                <img src="${browserIcon}" alt="Текущее устройство">
                <span style="color: green; margin-left: 5px;">(Текущая)</span>
                <div class="edit__sessions--info">
                    <p>${escapeHtml(session.device_info)}</p>
                    <p>${escapeHtml(session.location)}, ${escapeHtml(session.ip_address)}</p>
                </div>
            `;
        } else {
            const icon = session.device_info.includes('IPhone') ? appleIcon : browserIcon;
            sessionBlock.innerHTML = `
                <input type="checkbox" name="session_ids" value="${session.session_key}" class="session-checkbox">
                <img src="${icon}" alt="${session.device_info.includes('IPhone') ? 'Apple' : 'Browser'}">
                <div class="edit__sessions--info">
                    <p>${escapeHtml(session.device_info)}</p>
                    <p>${escapeHtml(session.location)}, ${escapeHtml(session.ip_address)}</p>
                </div>
            `;
        }

        const sessionDate = document.createElement('div');
        sessionDate.className = 'edit__sessions--date';
        sessionDate.innerHTML = `<p>${escapeHtml(session.last_activity)}</p>`;

        sessionItem.appendChild(sessionBlock);
        sessionItem.appendChild(sessionDate);
        
        return sessionItem;
    }

    function showMessage(message, type) {
        if (!messageContainer) return;
        
        messageContainer.textContent = message;
        messageContainer.className = type === 'success' ? 'alert alert-success' : 'alert alert-error';
        messageContainer.style.display = 'block';
        
        setTimeout(() => {
            if (messageContainer) {
                messageContainer.style.display = 'none';
            }
        }, 5000);
    }

    // Функция для экранирования HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    // Инициализация состояния кнопки
    updateTerminateButtonState();
});