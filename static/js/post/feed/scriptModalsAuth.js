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

    // Функции для работы с модальными окнами
    function openRegisterModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        modalOverlay.classList.add('active');
        
        // Автофокус на первое поле
        setTimeout(() => {
            const firstInput = document.querySelector('#registerForm input:not([type="hidden"])');
            if (firstInput) {
                firstInput.focus();
            }
        }, 150);
    }

    function openAuthModal() {
        const modalOverlay = document.getElementById('modalOverlayAuth');
        modalOverlay.classList.add('active');
        
        // Автофокус на первое поле
        setTimeout(() => {
            const firstInput = document.querySelector('#loginForm input:not([type="hidden"])');
            if (firstInput) {
                firstInput.focus();
            }
        }, 150);
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Инициализация обработчиков событий
    document.addEventListener('DOMContentLoaded', function() {
        // Обработчики для открытия модальных окон
        document.querySelectorAll('.open-register-modal').forEach(element => {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                openRegisterModal();
            });
        });

        document.querySelectorAll('.open-auth-modal').forEach(element => {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                openAuthModal();
            });
        });

        // Закрытие модальных окон
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', closeAllModals);
        });

        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeAllModals();
                }
            });
        });

        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });

        // Переход между модальными окнами
        document.getElementById('recoveryBtn')?.addEventListener('click', function(e) {
            e.preventDefault();
            closeAllModals();
            document.getElementById('modalOverlayRecovery').classList.add('active');
        });

        // Валидация формы регистрации
        function validateRegisterForm() {
            const politicCheckbox = document.querySelector('input[name="privacy_policy_agreed"]');
            const submitButton = document.querySelector('#registerForm .modal-button');
            
            if (!politicCheckbox.checked) {
                submitButton.disabled = true;
                submitButton.style.opacity = '0.6';
                submitButton.style.cursor = 'not-allowed';
            } else {
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
                submitButton.style.cursor = 'pointer';
            }
        }

        // Проверка при загрузке страницы
        validateRegisterForm();
        
        // Слушаем изменения чекбокса политики
        const politicCheckbox = document.querySelector('input[name="privacy_policy_agreed"]');
        if (politicCheckbox) {
            politicCheckbox.addEventListener('change', validateRegisterForm);
        }

        // AJAX обработчики форм
        // Регистрация
        $('#registerForm').on('submit', function(e) {
            e.preventDefault();
            
            // Проверка галочки политики конфиденциальности
            const politicChecked = $('input[name="privacy_policy_agreed"]').is(':checked');
            if (!politicChecked) {
                $('#registerMessage').text('Для регистрации необходимо согласие с политикой конфиденциальности');
                return false;
            }
            
            if ($(this).data('submitting')) return;
            $(this).data('submitting', true);
            
            var formData = $(this).serialize();
            $('#registerMessage').text('');
            
            $.ajax({
                url: '/register-ajax/',
                type: 'POST',
                data: formData,
                headers: {
                    "X-CSRFToken": getCookie("csrftoken")
                },
                success: function(data) {
                    if (data.success) {
                        window.location.href = data.redirect;
                    } else {
                        var errorMsg = data.errors ? Object.values(data.errors).join(', ') : 'Ошибка';
                        $('#registerMessage').text('Ошибка: ' + errorMsg);
                    }
                },
                error: function(xhr, status, error) {
                    $('#registerMessage').text('Ошибка сети');
                },
                complete: function() {
                    $('#registerForm').data('submitting', false);
                }
            });
        });

        // Вход
        $('#loginForm').on('submit', function(e) {
            e.preventDefault();
            if ($(this).data('submitting')) return;
            $(this).data('submitting', true);
            
            var formData = $(this).serialize();
            $('#loginMessage').text('');
            
            $.ajax({
                url: '/login-ajax/',
                type: 'POST',
                data: formData,
                headers: {
                    "X-CSRFToken": getCookie("csrftoken")
                },
                success: function(data) {
                    if (data.success) {
                        window.location.href = data.redirect;
                    } else {
                        var errorMsg = data.errors ? Object.values(data.errors).join(', ') : 'Ошибка';
                        $('#loginMessage').text('Ошибка: ' + errorMsg);
                    }
                },
                error: function(xhr, status, error) {
                    $('#loginMessage').text('Ошибка сети');
                },
                complete: function() {
                    $('#loginForm').data('submitting', false);
                }
            });
        });

        // Восстановление пароля
        $('#resetForm').on('submit', function(e) {
            e.preventDefault();
            if ($(this).data('submitting')) return;
            $(this).data('submitting', true);
            
            var formData = $(this).serialize();
            $('#resetMessage').text('');
            
            $.ajax({
                url: '/password-reset-ajax/',
                type: 'POST',
                data: formData,
                headers: {
                    "X-CSRFToken": getCookie("csrftoken")
                },
                success: function(data) {
                    if (data.success) {
                        $('#resetMessage').text(data.message).css('color', 'green');
                        setTimeout(() => {
                            $('#modalOverlayRecovery').removeClass('active');
                            $('#resetForm')[0].reset();
                        }, 2000);
                    } else {
                        var errorMsg = data.errors ? Object.values(data.errors).join(', ') : 'Ошибка';
                        $('#resetMessage').text('Ошибка: ' + errorMsg).css('color', 'red');
                    }
                },
                error: function(xhr, status, error) {
                    $('#resetMessage').text('Ошибка сети').css('color', 'red');
                },
                complete: function() {
                    $('#resetForm').data('submitting', false);
                }
            });
        });
    });