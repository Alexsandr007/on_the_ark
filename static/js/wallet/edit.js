
document.addEventListener('DOMContentLoaded', () => {
    const sidebarItems = Array.from(document.querySelectorAll('.wallet__sidebar--item'));
    const contentItems = Array.from(document.querySelectorAll('.wallet__content--item'));

    function parseIconPair(src) {
        const url = new URL(src, location.href);
        const file = url.pathname.split('/').pop();               
        const m = file.match(/^(.*?)(-\d+)?(\.\w+)$/);            
        if (!m) return { base: src, active: src };
        const name = m[1], dash = m[2], ext = m[3];

        if (dash) {
            return {
                base: src,
                active: new URL(`${name}${ext}`, url).toString()
            };
        } else {
            return {
                base: new URL(`${name}-1${ext}`, url).toString(),
                active: src
            };
        }
    }

    sidebarItems.forEach(item => {
        const img = item.querySelector('.wallet__sidebar--item-image img');
        if (!img) return;
        const { base, active } = parseIconPair(img.getAttribute('src'));
        item.dataset.iconBase = base;    
        item.dataset.iconActive = active; 
        img.src = item.dataset.iconBase;  
    });

    function setIconState(item, isActive) {
        const img = item.querySelector('.wallet__sidebar--item-image img');
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

    sidebarItems.forEach((item, index) => {
        item.style.cursor = 'pointer';

        item.addEventListener('click', () => {
            const sel = item.dataset.target;
            sel ? activateBySelector(sel) : activateByIndex(index);
        });

        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });

    
    });

    const preset = sidebarItems.findIndex(el => el.classList.contains('active'));
    if (preset >= 0) {
        const sel = sidebarItems[preset].dataset.target;
        activeIndex = preset;
        setSidebarActive(activeIndex);      
        sel ? activateBySelector(sel) : setContentActive(activeIndex);
    } else {
        activateByIndex(0);
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector(".header__burger");
    const menu = document.querySelector(".header__links");

    burger.addEventListener("click", () => {
        menu.classList.toggle("active");
        burger.classList.toggle("open");
    });
});