// faqAccordion.js
// Плавное раскрытие .main-block__text по клику на .main-block__item_focus
// + поворот/подсветка стрелки внутри .main-block__item_focus > *:last-child

(function () {
    // Хелпер для плавного скрытия/показа по max-height
    function expand(panel) {
      panel.style.display = 'block';
      const full = panel.scrollHeight;
      panel.style.maxHeight = '0px';
      panel.style.overflow = 'hidden';
      panel.style.transition = 'max-height 300ms ease';
      requestAnimationFrame(() => {
        panel.style.maxHeight = full + 'px';
      });
    }
  
    function collapse(panel) {
      const full = panel.scrollHeight;
      panel.style.maxHeight = full + 'px';
      panel.style.overflow = 'hidden';
      panel.style.transition = 'max-height 300ms ease';
      requestAnimationFrame(() => {
        panel.style.maxHeight = '0px';
      });
    }
  
    function afterTransition(panel) {
      // Сбрасываем стили после анимации, чтобы контент мог изменяться по высоте
      panel.addEventListener(
        'transitionend',
        (e) => {
          if (e.propertyName !== 'max-height') return;
          if (panel.style.maxHeight === '0px') {
            panel.style.display = 'none';
          } else {
            panel.style.maxHeight = 'none';
            panel.style.overflow = 'visible';
            panel.style.transition = 'none';
          }
        },
        { once: true }
      );
    }
  
    function toggleItem(item) {
      const focus = item.querySelector('.main-block__item_focus');
      const panel = item.querySelector('.main-block__text');
      const arrow = focus?.lastElementChild; // div со знаком ">"
  
      const isOpen = item.classList.contains('is-open');
  
      if (isOpen) {
        // закрываем
        item.classList.remove('is-open');
        focus.setAttribute('aria-expanded', 'false');
        if (arrow) {
          arrow.style.transform = 'rotate(90deg)'; // вверх (из ">" делаем "^"-образно)
          arrow.style.color = '';
          item.querySelector('.main-block__number').style.background = '#110401';
        }
        collapse(panel);
        afterTransition(panel);
      } else {
        // открываем
        item.classList.add('is-open');
        focus.setAttribute('aria-expanded', 'true');
        if (arrow) {
          arrow.style.transform = 'rotate(270deg)'; // вниз
          arrow.style.color = '#C4321A';

          item.querySelector('.main-block__number').style.background = '#C4321A';
        }
        expand(panel);
        afterTransition(panel);
      }
    }
  
    function init() {
      // Инициализируем все пункты
      const items = document.querySelectorAll('.main-block__item');
  
      items.forEach((item) => {
        const focus = item.querySelector('.main-block__item_focus');
        const panel = item.querySelector('.main-block__text');
        const arrow = focus?.lastElementChild;
  
        if (!focus || !panel) return;
  
        // Доступность
        focus.setAttribute('role', 'button');
        focus.setAttribute('tabindex', '0');
        focus.setAttribute('aria-expanded', 'false');
  
        // Начальные стили панели (скрыта)
        panel.style.display = 'none';
        panel.style.maxHeight = '0px';
        panel.style.overflow = 'hidden';
  
        // Начальное состояние стрелки (вверх)
        if (arrow) {
          arrow.style.display = 'flex';
          arrow.style.alignItems = 'center';
          arrow.style.justifyContent = 'center';
          arrow.style.transition = 'transform 200ms ease, color 200ms ease';
          arrow.style.transform = 'rotate(90deg)'; // вверх относительно ">"
        }
  
        // Клики
        focus.addEventListener('click', () => toggleItem(item));
  
        // Клавиатура (Enter/Space)
        focus.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleItem(item);
          }
        });
      });
    }
  
    // Запуск после готовности DOM (если файл подключён в <head>)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  