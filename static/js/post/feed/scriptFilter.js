document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', e => {
        const btn = document.getElementById('filter__button');
        const box = document.getElementById('filter');
        const select = document.getElementById('filter__select');

        const clickOnButton = btn.contains(e.target);
        const clickInsideBox = box.contains(e.target);

        // если клик по кнопке — переключаем
        if (clickOnButton) btn.classList.toggle('_active');

        // если клик вне кнопки и вне блока — закрываем
        if (!clickOnButton && !clickInsideBox) btn.classList.remove('_active');

        // показываем / скрываем фильтр и селект
        const active = btn.classList.contains('_active');
        [box, select].forEach(el => el.classList.toggle('_hidden', !active));
    });
});