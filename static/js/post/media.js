document.addEventListener('DOMContentLoaded', function() {
    const mediaQuery = window.matchMedia('(max-width: 1140px)');
    const headerItems = document.querySelectorAll('.article__header--item');

    headerItems.forEach(item => {
        const textNodes = Array.from(item.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        const textContent = textNodes.map(node => node.textContent).join('').trim();
        item.setAttribute('data-original-text', textContent);
    });

    function handleMediaChange(e) {
        if (e.matches) {
            headerItems.forEach(item => {
                const textNodes = Array.from(item.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                textNodes.forEach(node => node.textContent = '');
            });
        } else {
            headerItems.forEach(item => {
                const originalText = item.getAttribute('data-original-text');
                if (originalText) {
                    const textNodes = Array.from(item.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                    textNodes.forEach(node => node.remove());

                    const img = item.querySelector('img');
                    if (img) {
                        const textNode = document.createTextNode(originalText);
                        img.after(textNode);
                    }
                }
            });
        }
    }

    handleMediaChange(mediaQuery);

    mediaQuery.addListener(handleMediaChange);
});


