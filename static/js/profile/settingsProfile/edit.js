
document.addEventListener('DOMContentLoaded', () => {
    const sidebarItems = Array.from(document.querySelectorAll('.edit__sidebar--item'));
    const contentItems = Array.from(document.querySelectorAll('.edit__content--item'));

    // ---- ПАРЫ ИКОНКИ (base: с суффиксом -N, active: без суффикса) ----
    function parseIconPair(src) {
        const url = new URL(src, location.href);
        const file = url.pathname.split('/').pop();               // icon3-3.png / icon1.png
        const m = file.match(/^(.*?)(-\d+)?(\.\w+)$/);            // name, -N, .ext
        if (!m) return { base: src, active: src };
        const name = m[1], dash = m[2], ext = m[3];

        if (dash) {
            // В HTML уже "iconN-N.png": считаем это базой (неактивное), активная — без суффикса
            return {
                base: src,
                active: new URL(`${name}${ext}`, url).toString()
            };
        } else {
            // В HTML без суффикса: активная — это src, базу делаем name-1.ext
            return {
                base: new URL(`${name}-1${ext}`, url).toString(),
                active: src
            };
        }
    }

    // Кешируем пары и ставим БАЗОВЫЕ (c -N) иконки для всех пунктов.
    sidebarItems.forEach(item => {
        const img = item.querySelector('.edit__sidebar--item-image img');
        if (!img) return;
        const { base, active } = parseIconPair(img.getAttribute('src'));
        item.dataset.iconBase = base;     // неактивная картинка (с суффиксом)
        item.dataset.iconActive = active; // активная картинка (без суффикса)
        img.src = item.dataset.iconBase;  // по умолчанию у всех base (iconX-X.png)
    });

    function setIconState(item, isActive) {
        const img = item.querySelector('.edit__sidebar--item-image img');
        if (!img) return;
        img.src = isActive ? item.dataset.iconActive : item.dataset.iconBase;
    }

    let activeIndex = -1;

    function setSidebarActive(index) {
        sidebarItems.forEach((el, i) => {
            const isAct = i === index;
            el.classList.toggle('active', isAct);
            setIconState(el, isAct);
        });
    }

    function setContentActive(index) {
        contentItems.forEach((el, i) => el.classList.toggle('active', i === index));
    }

    function activateByIndex(index) {
        activeIndex = index;
        setSidebarActive(activeIndex);
        setContentActive(activeIndex);
    }

    function activateBySelector(selector) {
        const target = document.querySelector(selector);
        if (!target) return;
        contentItems.forEach(el => el.classList.toggle('active', el === target));
        const idx = sidebarItems.findIndex(el => el.dataset.target === selector);
        activeIndex = idx >= 0 ? idx : activeIndex;
        setSidebarActive(activeIndex);
    }

    // ---- СЛУШАТЕЛИ ----
    sidebarItems.forEach((item, index) => {
        item.style.cursor = 'pointer';

        // Клик — фиксируем активный (меняем иконку на без-суффикса и класс active)
        item.addEventListener('click', () => {
            const sel = item.dataset.target;
            sel ? activateBySelector(sel) : activateByIndex(index);
        });

        // Клавиатура
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });

        // Hover: временно делаем таб активным для подсветки и иконки (без смены контента)
        item.addEventListener('mouseenter', () => {
            setSidebarActive(index); // добавит .active и поставит активную иконку (iconX.png)
        });
        item.addEventListener('mouseleave', () => {
            if (activeIndex < 0) return;
            setSidebarActive(activeIndex);  // вернёт реальный активный; остальным — base (iconX-X.png)
        });
    });

    // ---- ИНИЦИАЛИЗАЦИЯ ----
    const preset = sidebarItems.findIndex(el => el.classList.contains('active'));
    if (preset >= 0) {
        const sel = sidebarItems[preset].dataset.target;
        activeIndex = preset;
        setSidebarActive(activeIndex);      // выбранный — iconX.png; остальные — iconX-X.png
        sel ? activateBySelector(sel) : setContentActive(activeIndex);
    } else {
        activateByIndex(0);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.querySelector('.edit__verification--checkout input[type="checkbox"]');
    const button = document.querySelector('.edit__verification--button button');

    const sync = () => {
        button.disabled = !checkbox.checked; 
    };
    sync();                      
    checkbox.addEventListener('change', sync);
});


document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector(".header__burger");
    const menu = document.querySelector(".header__links");

    burger.addEventListener("click", () => {
        menu.classList.toggle("active");
        burger.classList.toggle("open");
    });
});