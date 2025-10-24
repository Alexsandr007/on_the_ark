document.addEventListener('DOMContentLoaded', function() {
    const slidesContainer = document.querySelector('.slides-container');
    const slidesWrapper = document.querySelector('.slides-wrapper');
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.circle'); // Предполагаем, что dots есть и имеют data-index от 0 до 2
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');
    
    // Начинаем с первого слайда (индекс 0)
    let currentSlide = 0;
    const totalSlides = slides.length; // Теперь 4
    const visibleSlides = 2; // Показываем 2 слайда одновременно
    const maxSlide = totalSlides - visibleSlides; // Максимальный индекс: 4 - 2 = 2
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
        if (currentSlide === maxSlide) {
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
        
        // Смещение рассчитывается на ширину одного слайда (50% от ширины контейнера)
        const slideWidth = slidesContainer.offsetWidth / visibleSlides;
        currentTranslate = -slideIndex * slideWidth;
        slidesWrapper.style.transform = `translateX(${currentTranslate}px)`;
        
        // Обновляем точки навигации
        updateDots(slideIndex);
        
        // Обновляем состояние стрелок
        updateArrows();
    }
    
    // Функция для обновления точек навигации
    function updateDots(slideIndex) {
        dots.forEach((dot, index) => {
            if (index === slideIndex) {
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
        const slideWidth = slidesContainer.offsetWidth / visibleSlides;
        
        // Если перемещение было значительным, переключаем слайд
        if (movedBy < -50 && currentSlide < maxSlide) {
            currentSlide += 1;
        }
        
        if (movedBy > 50 && currentSlide > 0) {
            currentSlide -= 1;
        }
        
        // Обновляем позицию
        setSlidePosition();
    }
    
    // Устанавливаем позицию слайда
    function setSlidePosition() {
        const slideWidth = slidesContainer.offsetWidth / visibleSlides;
        currentTranslate = -currentSlide * slideWidth;
        prevTranslate = currentTranslate;
        updateSlider(currentSlide);
    }
    
    // Обработчик для стрелки вправо
    arrowRight.addEventListener('click', function() {
        if (currentSlide < maxSlide) {
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
            if (slideIndex !== currentSlide && slideIndex >= 0 && slideIndex <= maxSlide) {
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


