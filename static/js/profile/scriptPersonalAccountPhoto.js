document.addEventListener('DOMContentLoaded', function() {
    const imageOverlay = document.getElementById('imageOverlay');
    const profileImage = document.getElementById('profileImage');
    const profileImageHeader = document.getElementById('profileImageHeader');
    const profileImageSideBar = document.getElementById('profileImageSideBar');
    const fileInput = document.createElement('input');  // Скрытый input для файла
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Клик на оверлей открывает диалог выбора файла
    imageOverlay.addEventListener('click', function() {
        fileInput.click();
    });
    
    // При выборе файла
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('photo', file);
            
            $.ajax({
                url: '/update-photo-ajax/',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                headers: { "X-CSRFToken": getCookie("csrftoken") },
                success: function(data) {
                    if (data.success) {
                        profileImage.src = data.photo_url;  // Обновить изображение
                        profileImageHeader.src = data.photo_url;
                        profileImageSideBar.src = data.photo_url;
                        console.log('Фото обновлено');
                    } else {
                        alert('Ошибка загрузки фото');
                    }
                },
                error: function() {
                    alert('Ошибка сети');
                }
            });
        }
    });
});