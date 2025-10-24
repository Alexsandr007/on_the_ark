document.addEventListener('DOMContentLoaded', function() {
    const professionInput = document.getElementById('professionInput');
    
    if (professionInput) {
        professionInput.addEventListener('blur', function() {  // Сохраняет при уходе с поля
            const value = this.value.trim();
            $.ajax({
                url: '/update-profession-ajax/',
                type: 'POST',
                data: { profession: value },
                headers: { "X-CSRFToken": getCookie("csrftoken") },
                success: function(data) {
                    if (data.success) {
                        console.log(data.message);
                        // Опционально: Обновить placeholder, если нужно
                        professionInput.placeholder = value || 'чем вы занимаетесь?';
                    } else {
                        alert('Ошибка сохранения');
                    }
                },
                error: function() {
                    alert('Ошибка сети');
                }
            });
        });
    }
});