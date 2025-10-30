document.addEventListener('DOMContentLoaded', function() {
    const slidesContainer = document.querySelector('.slides-container');
    const slidesWrapper = document.querySelector('.slides-wrapper');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.circle');
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    
    // Начинаем с первого слайда (индекс 0)
    let currentSlide = 0;
    const totalSlides = slides.length;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    
    // Функция для обновления состояния стрелок
    function updateArrows() {
        // Левая стрелка - активна, если не на первом слайде
        if (currentSlide === 0) {
            arrowLeft.style.opacity = '0.4';
        } else {
            arrowLeft.style.opacity = '1';
        }
        
        // Правая стрелка - активна, если не на последнем слайде
        if (currentSlide === totalSlides - 1) {
            arrowRight.style.opacity = '0.4';
        } else {
            arrowRight.style.opacity = '1';
        }
    }
    
    // Функция для обновления слайдера
    function updateSlider(slideIndex = currentSlide, animate = true) {
        if (animate) {
            slidesWrapper.style.transition = 'transform 0.5s ease';
        } else {
            slidesWrapper.style.transition = 'none';
        }
        
        // Смещение рассчитывается относительно текущего слайда
        currentTranslate = -slideIndex * slidesContainer.offsetWidth;
        slidesWrapper.style.transform = `translateX(${currentTranslate}px)`;
        
        // Обновляем точки навигации
        updateDots(slideIndex);
        
        // Обновляем состояние стрелок
        updateArrows();
    }
    
    // Функция для обновления точек навигации
    function updateDots(slideIndex) {
        dots.forEach((dot, index) => {
            if (index === slideIndex+1) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Функция для получения позиции события (мышь или касание)
    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }
    
    // Функция анимации при перетаскивании
    function animation() {
        slidesWrapper.style.transform = `translateX(${currentTranslate}px)`;
        if (isDragging) {
            requestAnimationFrame(animation);
        }
    }
    
    // События для мыши
    slidesContainer.addEventListener('mousedown', dragStart);
    slidesContainer.addEventListener('mousemove', drag);
    slidesContainer.addEventListener('mouseup', dragEnd);
    slidesContainer.addEventListener('mouseleave', dragEnd);
    
    // События для касаний (для мобильных устройств)
    slidesContainer.addEventListener('touchstart', dragStart);
    slidesContainer.addEventListener('touchmove', drag);
    slidesContainer.addEventListener('touchend', dragEnd);
    
    // Начало перетаскивания
    function dragStart(event) {
        if (event.type === 'touchstart') {
            startPos = getPositionX(event);
        } else {
            startPos = getPositionX(event);
        }
        isDragging = true;
        slidesWrapper.style.transition = 'none';
        
        animationID = requestAnimationFrame(animation);
        slidesContainer.style.cursor = 'grabbing';
    }
    
    // Процесс перетаскивания
    function drag(event) {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    }
    
    // Конец перетаскивания
    function dragEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        cancelAnimationFrame(animationID);
        slidesContainer.style.cursor = 'grab';
        
        const movedBy = currentTranslate - prevTranslate;
        
        // Если перемещение было значительным, переключаем слайд
        if (movedBy < -100 && currentSlide < totalSlides - 1) {
            currentSlide += 1;
        }
        
        if (movedBy > 100 && currentSlide > 0) {
            currentSlide -= 1;
        }
        
        // Обновляем позицию
        setSlidePosition();
    }
    
    // Устанавливаем позицию слайда
    function setSlidePosition() {
        currentTranslate = -currentSlide * slidesContainer.offsetWidth;
        prevTranslate = currentTranslate;
        updateSlider(currentSlide);
    }
    
    // Обработчик для стрелки вправо
    arrowRight.addEventListener('click', function() {
        if (currentSlide < totalSlides - 1) {
            currentSlide += 1;
            setSlidePosition();
        }
    });
    
    // Обработчик для стрелки влево
    arrowLeft.addEventListener('click', function() {
        if (currentSlide > 0) {
            currentSlide -= 1;
            setSlidePosition();
        }
    });
    
    // Обработчики для точек навигации
    dots.forEach(dot => {
        dot.addEventListener('click', function() {
            const slideIndex = parseInt(this.getAttribute('data-index'));
            if (slideIndex !== currentSlide) {
                currentSlide = slideIndex;
                setSlidePosition();
            }
        });
    });
    
    // Предотвращение перетаскивания изображений внутри слайдов
    document.querySelectorAll('.slide img').forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });
    
    // Инициализация слайдера - показываем первый слайд
    setSlidePosition();
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', () => {
        setSlidePosition();
    });
});