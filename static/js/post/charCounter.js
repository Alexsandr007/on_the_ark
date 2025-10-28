document.addEventListener('DOMContentLoaded', function() {
    const maxLength = 150;

    function setupCounter() {
        const textarea = document.querySelector('.af-popover__textearea');
        const counterElement = document.querySelector('.af-popover__text');

        if (textarea && counterElement) {
            // Удаляем предыдущие обработчики, чтобы избежать дублирования
            textarea.removeEventListener('input', updateCounter);

            function updateCounter() {
                const currentLength = textarea.value.length;
                const remaining = maxLength - currentLength;
                counterElement.textContent = `До ${maxLength} символов (осталось ${remaining})`;
            }

            textarea.addEventListener('input', updateCounter);
            updateCounter();
        }
    }

    // Наблюдаем за изменениями в DOM, но только в нужном контейнере
    const adItem = document.querySelector('.article__footer--item');
    if (adItem) {
        const observer = new MutationObserver(function(mutations) {
            if (document.querySelector('.af-popover__textearea')) {
                setupCounter();
                observer.disconnect(); // Отключаем наблюдатель после первого срабатывания
            }
        });

        observer.observe(adItem, { childList: true, subtree: true });
    }
});
