document.addEventListener('DOMContentLoaded', function() {
    const changeBackgroundBtn = document.getElementById('changeBackgroundBtn');
    const backgroundContainer = document.getElementById('backgroundContainer');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Клик на кнопку открывает диалог
    changeBackgroundBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // При выборе файла
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('background_photo', file);
            
            $.ajax({
                url: '/update-background-ajax/',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                headers: { "X-CSRFToken": getCookie("csrftoken") },
                success: function(data) {
                    if (data.success) {
                        backgroundContainer.style.backgroundImage = `url('${data.background_url}')`;
                        console.log('Фон обновлён');
                    } else {
                        alert('Ошибка загрузки фона');
                    }
                },
                error: function() {
                    alert('Ошибка сети');
                }
            });
        }
    });
});