document.querySelectorAll(".accordion__title").forEach(title => {
    title.addEventListener("click", () => {
      const parent = title.parentElement;
      parent.classList.toggle("active");
    });
  });


  document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector(".header__burger");
    const menu = document.querySelector(".header__links");
    const buttons = document.querySelector(".header__buttons");

    burger.addEventListener("click", () => {
      menu.classList.toggle("active");
      buttons.classList.toggle("active");
      burger.classList.toggle("open");
    });
  });
  

document.addEventListener('DOMContentLoaded', function() {
    // Пятая секция - слайдер
    const fiveSection = document.querySelector('.five-section');
    const fiveSlidesContainer = fiveSection.querySelector('.content');
    const fiveSlidesWrapper = fiveSection.querySelector('.text-block');
    const fiveSlides = fiveSection.querySelectorAll('.how-it-works');
    const fiveDots = fiveSection.querySelectorAll('.circle');
    const fiveArrowLeft = fiveSection.querySelector('.arrow-left');
    const fiveArrowRight = fiveSection.querySelector('.arrow-right');
    
    let currentFiveSlide = 0;
    const totalFiveSlides = 3;
    let isFiveDragging = false;
    let fiveStartPos = 0;
    let fiveCurrentTranslate = 0;
    let fivePrevTranslate = 0;
    let fiveAnimationID = 0;
    
    // Функция для обновления состояния стрелок
    function updateFiveArrows() {
        // Левая стрелка - активна, если не на первом слайде
        if (currentFiveSlide === 0) {
            fiveArrowLeft.style.opacity = '0.4';
        } else {
            fiveArrowLeft.style.opacity = '1';
        }
        
        // Правая стрелка - активна, если не на последнем слайде
        if (currentFiveSlide === totalFiveSlides - 1) {
            fiveArrowRight.style.opacity = '0.4';
        } else {
            fiveArrowRight.style.opacity = '1';
        }
    }
    
    // Функция для обновления слайдера
    function updateFiveSlider(slideIndex = currentFiveSlide, animate = true) {
        if (animate) {
            fiveSlidesWrapper.style.transition = 'transform 0.5s ease';
        } else {
            fiveSlidesWrapper.style.transition = 'none';
        }
        
        // ИСПРАВЛЕНИЕ: Смещение рассчитывается относительно ширины одного слайда
        // Каждый слайд занимает 33.333% от общей ширины text-block (300%)
        // Но нам нужно смещать на ширину видимой области (100% от контейнера)
        const slideWidth = fiveSlidesContainer.offsetWidth;
        fiveCurrentTranslate = -slideIndex * slideWidth;
        fiveSlidesWrapper.style.transform = `translateX(${fiveCurrentTranslate}px)`;
        
        // Обновляем точки навигации
        updateFiveDots(slideIndex);
        
        // Обновляем состояние стрелок
        updateFiveArrows();
    }
    
    // Функция для обновления точек навигации
    function updateFiveDots(slideIndex) {
        fiveDots.forEach((dot, index) => {
            if (index === slideIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Функция для получения позиции события (мышь или касание)
    function getFivePositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }
    
    // Функция анимации при перетаскивании
    function fiveAnimation() {
        fiveSlidesWrapper.style.transform = `translateX(${fiveCurrentTranslate}px)`;
        if (isFiveDragging) {
            requestAnimationFrame(fiveAnimation);
        }
    }
    
    // События для мыши
    fiveSlidesContainer.addEventListener('mousedown', fiveDragStart);
    fiveSlidesContainer.addEventListener('mousemove', fiveDrag);
    fiveSlidesContainer.addEventListener('mouseup', fiveDragEnd);
    fiveSlidesContainer.addEventListener('mouseleave', fiveDragEnd);
    
    // События для касаний (для мобильных устройств)
    fiveSlidesContainer.addEventListener('touchstart', fiveDragStart);
    fiveSlidesContainer.addEventListener('touchmove', fiveDrag);
    fiveSlidesContainer.addEventListener('touchend', fiveDragEnd);
    
    // Начало перетаскивания
    function fiveDragStart(event) {
        if (event.type === 'touchstart') {
            fiveStartPos = getFivePositionX(event);
        } else {
            fiveStartPos = getFivePositionX(event);
        }
        isFiveDragging = true;
        fiveSlidesWrapper.style.transition = 'none';
        
        fiveAnimationID = requestAnimationFrame(fiveAnimation);
        fiveSlidesContainer.style.cursor = 'grabbing';
    }
    
    // Процесс перетаскивания
    function fiveDrag(event) {
        if (isFiveDragging) {
            const currentPosition = getFivePositionX(event);
            fiveCurrentTranslate = fivePrevTranslate + currentPosition - fiveStartPos;
        }
    }
    
    // Конец перетаскивания
    function fiveDragEnd() {
        if (!isFiveDragging) return;
        
        isFiveDragging = false;
        cancelAnimationFrame(fiveAnimationID);
        fiveSlidesContainer.style.cursor = 'grab';
        
        const movedBy = fiveCurrentTranslate - fivePrevTranslate;
        const slideWidth = fiveSlidesContainer.offsetWidth;
        
        // Если перемещение было значительным, переключаем слайд
        if (movedBy < -slideWidth * 0.2 && currentFiveSlide < totalFiveSlides - 1) {
            currentFiveSlide += 1;
        }
        
        if (movedBy > slideWidth * 0.2 && currentFiveSlide > 0) {
            currentFiveSlide -= 1;
        }
        
        // Обновляем позицию
        setFiveSlidePosition();
    }
    
    // Устанавливаем позицию слайда
    function setFiveSlidePosition() {
        const slideWidth = fiveSlidesContainer.offsetWidth;
        fiveCurrentTranslate = -currentFiveSlide * slideWidth;
        fivePrevTranslate = fiveCurrentTranslate;
        updateFiveSlider(currentFiveSlide);
    }
    
    // Обработчик для стрелки вправо
    fiveArrowRight.addEventListener('click', function() {
        if (currentFiveSlide < totalFiveSlides - 1) {
            currentFiveSlide += 1;
            setFiveSlidePosition();
        }
    });
    
    // Обработчик для стрелки влево
    fiveArrowLeft.addEventListener('click', function() {
        if (currentFiveSlide > 0) {
            currentFiveSlide -= 1;
            setFiveSlidePosition();
        }
    });
    
    // Обработчики для точек навигации
    fiveDots.forEach(dot => {
        dot.addEventListener('click', function() {
            const slideIndex = parseInt(this.getAttribute('data-index'));
            if (slideIndex !== currentFiveSlide) {
                currentFiveSlide = slideIndex;
                setFiveSlidePosition();
            }
        });
    });
    
    // Предотвращение перетаскивания изображений внутри слайдов
    fiveSection.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });
    
    // Инициализация слайдера - показываем первый слайд
    setFiveSlidePosition();
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', () => {
        setFiveSlidePosition();
    });
});