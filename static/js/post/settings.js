document.addEventListener('DOMContentLoaded', function() {
    const mediaQuery = window.matchMedia('(max-width: 1140px)');
    const extraSmallMediaQuery = window.matchMedia('(max-width: 400px)');
    const settingsButton = document.querySelector('.article__header--item-setting');
    const settingsCard = document.querySelector('.article__body--card');

    // Проверяем наличие элементов
    if (!settingsButton || !settingsCard) return;

    // Изначально скрываем карточку только на мобильных устройствах
    function initSettingsCard() {
        if (window.innerWidth <= 1140) {
            settingsCard.style.display = 'none';
        } else {
            // На десктопах карточка может быть видимой по умолчанию
            settingsCard.style.display = 'block';
            // Сбрасываем позиционирование для десктопа
            resetDesktopStyles();
        }
    }

    // Функция для позиционирования карточки настроек
    function positionSettingsCard() {
        if (settingsCard.style.display === 'none') return;

        const buttonRect = settingsButton.getBoundingClientRect();
        const cardWidth = settingsCard.offsetWidth;

        // Позиционируем карточку в зависимости от размера экрана
        if (extraSmallMediaQuery.matches) {
            // На очень маленьких экранах (<=400px) прижимаем к правому краю
            settingsCard.style.position = 'absolute';
            settingsCard.style.top = `${buttonRect.bottom + window.scrollY}px`;
            settingsCard.style.right = '0';
            settingsCard.style.left = 'auto';
            settingsCard.style.zIndex = '1000';
            settingsCard.style.margin = '5px';
        } else if (mediaQuery.matches) {
            // На мобильных экранах (<=1140px) располагаем под кнопкой
            settingsCard.style.position = 'absolute';
            settingsCard.style.top = `${buttonRect.bottom + window.scrollY}px`;
            settingsCard.style.left = `${buttonRect.right - cardWidth + window.scrollX}px`;
            settingsCard.style.zIndex = '1000';
            settingsCard.style.margin = '5px';
        }
    }

    // Сброс стилей для десктопной версии
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

    // Функция для обработки клика на кнопку настроек
    function handleSettingsClick(e) {
        e.stopPropagation();
        
        if (window.innerWidth <= 1140) {
            // На мобильных: переключаем видимость
            const isVisible = settingsCard.style.display === 'block';
            settingsCard.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                positionSettingsCard();
            }
        } else {
            // На десктопах: всегда показываем при клике и сбрасываем стили
            settingsCard.style.display = 'block';
            resetDesktopStyles();
        }
    }

    // Функция для закрытия карточки при клике вне её
    function handleDocumentClick(e) {
        if (settingsCard.style.display === 'block' &&
            !settingsCard.contains(e.target) && 
            !settingsButton.contains(e.target) &&
            window.innerWidth <= 1140) {
            settingsCard.style.display = 'none';
        }
    }

    // Обработчик изменения размера экрана
    function handleResize() {
        if (window.innerWidth <= 1140) {
            // Переход на мобильный вид
            if (settingsCard.style.display === 'block') {
                positionSettingsCard();
            }
        } else {
            // Переход на десктопный вид
            resetDesktopStyles();
            // На десктопе карточка может оставаться видимой
            // или управляться другой логикой
        }
    }

    // Обработчик медиа-запросов
    function handleMediaChange(e) {
        if (e.matches) {
            // Стало <= 1140px (мобильный вид)
            settingsCard.style.display = 'none';
        } else {
            // Стало > 1140px (десктопный вид)
            resetDesktopStyles();
            settingsCard.style.display = 'block';
        }
    }

    // Добавляем обработчики событий
    settingsButton.addEventListener('click', handleSettingsClick);
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('resize', handleResize);
    mediaQuery.addListener(handleMediaChange);

    // Инициализация при загрузке
    initSettingsCard();

    // Дополнительно: обновляем позицию при прокрутке (для мобильных)
    window.addEventListener('scroll', function() {
        if (window.innerWidth <= 1140 && settingsCard.style.display === 'block') {
            positionSettingsCard();
        }
    });
});