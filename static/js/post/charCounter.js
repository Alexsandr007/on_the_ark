document.addEventListener('DOMContentLoaded', function() {
    const maxLength = 150;

    function setupCounter() {
        const textarea = document.querySelector('.af-popover__textearea');
        const counterElement = document.querySelector('.af-popover__text');

        if (textarea && counterElement) {
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

    const adItem = document.querySelector('.article__footer--item');
    if (adItem) {
        const observer = new MutationObserver(function(mutations) {
            if (document.querySelector('.af-popover__textearea')) {
                setupCounter();
                observer.disconnect(); 
            }
        });

        observer.observe(adItem, { childList: true, subtree: true });
    }
});
