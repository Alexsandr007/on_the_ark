document.addEventListener('DOMContentLoaded', function() {
    const mediaQuery = window.matchMedia('(max-width: 1140px)');
    const extraSmallMediaQuery = window.matchMedia('(max-width: 400px)');
    const settingsButton = document.querySelector('.article__header--item-setting');
    const settingsCard = document.querySelector('.article__body--card');

    if (!settingsButton || !settingsCard) return;

    function initSettingsCard() {
        if (window.innerWidth <= 1140) {
            settingsCard.style.display = 'none';
        } else {
            settingsCard.style.display = 'block';
            resetDesktopStyles();
        }
    }

    function positionSettingsCard() {
        if (settingsCard.style.display === 'none') return;

        const buttonRect = settingsButton.getBoundingClientRect();
        const cardWidth = settingsCard.offsetWidth;

        if (extraSmallMediaQuery.matches) {
            settingsCard.style.position = 'absolute';
            settingsCard.style.top = `${buttonRect.bottom + window.scrollY}px`;
            settingsCard.style.right = '0';
            settingsCard.style.left = 'auto';
            settingsCard.style.zIndex = '1000';
            settingsCard.style.margin = '5px';
        } else if (mediaQuery.matches) {
            settingsCard.style.position = 'absolute';
            settingsCard.style.top = `${buttonRect.bottom + window.scrollY}px`;
            settingsCard.style.left = `${buttonRect.right - cardWidth + window.scrollX}px`;
            settingsCard.style.zIndex = '1000';
            settingsCard.style.margin = '5px';
        }
    }

    function resetDesktopStyles() {
        if (window.innerWidth > 1140) {
            settingsCard.style.position = '';
            settingsCard.style.top = '';
            settingsCard.style.left = '';
            settingsCard.style.right = '';
            settingsCard.style.margin = '';
            settingsCard.style.zIndex = '';
        }
    }

    function handleSettingsClick(e) {
        e.stopPropagation();
        
        if (window.innerWidth <= 1140) {
            const isVisible = settingsCard.style.display === 'block';
            settingsCard.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                positionSettingsCard();
            }
        } else {
            settingsCard.style.display = 'block';
            resetDesktopStyles();
        }
    }

    function handleDocumentClick(e) {
        if (settingsCard.style.display === 'block' &&
            !settingsCard.contains(e.target) && 
            !settingsButton.contains(e.target) &&
            window.innerWidth <= 1140) {
            settingsCard.style.display = 'none';
        }
    }

    function handleResize() {
        if (window.innerWidth <= 1140) {
            if (settingsCard.style.display === 'block') {
                positionSettingsCard();
            }
        } else {
            resetDesktopStyles();
        }
    }

    function handleMediaChange(e) {
        if (e.matches) {
            settingsCard.style.display = 'none';
        } else {
            resetDesktopStyles();
            settingsCard.style.display = 'block';
        }
    }

    settingsButton.addEventListener('click', handleSettingsClick);
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('resize', handleResize);
    mediaQuery.addListener(handleMediaChange);

    initSettingsCard();

    window.addEventListener('scroll', function() {
        if (window.innerWidth <= 1140 && settingsCard.style.display === 'block') {
            positionSettingsCard();
        }
    });
});