document.addEventListener('DOMContentLoaded', function() {
    const mediaQuery = window.matchMedia('(max-width: 1140px)');
    const headerItems = document.querySelectorAll('.article__header--item');

    // Сохраняем текст элементов в data-атрибуты
    headerItems.forEach(item => {
        const textNodes = Array.from(item.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        const textContent = textNodes.map(node => node.textContent).join('').trim();
        item.setAttribute('data-original-text', textContent);
    });

    function handleMediaChange(e) {
        if (e.matches) {
            // Если ширина экрана ≤ 1140px, удаляем только текстовые узлы, оставляя изображения
            headerItems.forEach(item => {
                const textNodes = Array.from(item.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(node => node.textContent = '');
            });
        } else {
            // Если ширина экрана > 1140px, удаляем все текстовые узлы и вставляем текст из data-атрибута после изображения
            headerItems.forEach(item => {
                const originalText = item.getAttribute('data-original-text');
                if (originalText) {
                    // Удаляем все текстовые узлы
                    const textNodes = Array.from(item.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                    textNodes.forEach(node => node.remove());

                    // Вставляем текст после изображения
                    const img = item.querySelector('img');
                    if (img) {
                        const textNode = document.createTextNode(originalText);
                        img.after(textNode);
                    }
                }
            });
        }
    }

    // Вызываем функцию сразу при загрузке страницы
    handleMediaChange(mediaQuery);

    // Добавляем слушатель на изменение медиа-запроса
    mediaQuery.addListener(handleMediaChange);
});


