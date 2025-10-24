// Обработчик для чекбоксов
document.addEventListener('DOMContentLoaded', function() {
    const isVisibleToggle = document.getElementById('isVisibleToggle');
    const isAuthorToggle = document.getElementById('isAuthorToggle');
    
    // Функция для отправки AJAX
    function updateSetting(field, value) {
        $.ajax({
            url: '/update-user-settings-ajax/',
            type: 'POST',
            data: { field: field, value: value },
            headers: { "X-CSRFToken": getCookie("csrftoken") },
            success: function(data) {
                if (data.success) {
                    console.log(data.message);
                } else {
                    alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
                }
            },
            error: function() {
                alert('Ошибка сети');
            }
        });
    }
    
    // События изменения
    if (isVisibleToggle) {
        isVisibleToggle.addEventListener('change', function() {
            updateSetting('is_visible', this.checked);
        });
    }
    
    if (isAuthorToggle) {
        isAuthorToggle.addEventListener('change', function() {
            updateSetting('is_author', this.checked);
        });
    }
});

