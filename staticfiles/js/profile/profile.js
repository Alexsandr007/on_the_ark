    document.querySelectorAll(".accordion__title").forEach(title => {
        title.addEventListener("click", () => {
            const parent = title.parentElement;
            parent.classList.toggle("active");
        });
    });

    const track = document.querySelector('.profile__music--track');
    const slides = document.querySelectorAll('.profile__music--slide');
    const prevBtn = document.querySelector('.profile__music--btn.prev');
    const nextBtn = document.querySelector('.profile__music--btn.next');
    let index = 0;
    const slidesToShow = 3;
    function updateSlider() {
        if (!slides.length) return;
        const slideStyle = getComputedStyle(track);
        const gap = parseInt(slideStyle.gap) || 0;
        const slideWidth = slides[0].offsetWidth + gap;
        const maxIndex = Math.max(0, slides.length - slidesToShow);
        index = Math.max(0, Math.min(index, maxIndex));
        track.style.transform = `translateX(${-index * slideWidth}px)`;
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i >= index && i < index + slidesToShow);
        });
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index >= maxIndex;
    }

    nextBtn.addEventListener('click', () => {
        const maxIndex = Math.max(0, slides.length - slidesToShow);
        if (index < maxIndex) {
            index++;
            updateSlider();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (index > 0) {
            index--;
            updateSlider();
        }
    });
    window.addEventListener('resize', updateSlider);
    updateSlider();
    document.addEventListener("DOMContentLoaded", () => {
        const burger = document.querySelector(".header__burger");
        const menu = document.querySelector(".header__links");

        burger.addEventListener("click", () => {
            menu.classList.toggle("active");
            burger.classList.toggle("open");
        });
    });