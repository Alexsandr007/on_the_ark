document.addEventListener('DOMContentLoaded', function () {
    const btn = document.querySelector('.header__burger-button');
    const menu = document.querySelector('.header__burger-menu');
    const overlay = document.querySelector('.page-overlay');

    function closeMenu() {
        menu.classList.remove('_active');
        overlay.classList.remove('_visible');
    }

    document.addEventListener('click', (e) => {
        const clickOnButton = btn.contains(e.target);
        const clickInsideMenu = menu.contains(e.target);
        const clickOnOverlay = overlay.contains(e.target);
        const isMobile = window.innerWidth <= 1140;

        // если ширина экрана больше 1140 — скрываем оверлей всегда
        if (!isMobile) {
            overlay.classList.remove('_visible');
            return;
        }

        // Переключаем меню по клику на кнопку
        if (clickOnButton) {
            menu.classList.toggle('_active');
            overlay.classList.toggle('_visible', menu.classList.contains('_active'));
        }

        // Клик вне меню и вне кнопки — закрыть
        if (!clickOnButton && !clickInsideMenu) closeMenu();

        // Клик по оверлею — закрыть
        if (clickOnOverlay) closeMenu();
    });

    // при изменении размера окна — убираем оверлей и меню, если ширина больше 1140px
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1140) closeMenu();
    });
});
