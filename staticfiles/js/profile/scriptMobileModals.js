document.addEventListener('DOMContentLoaded', function() {

    const bottomSheet = document.getElementById('bottom-sheet');
    const openBtn = document.getElementById('paymentBtn');
    
    const openBtnMobile = document.getElementById('payment-method-btn-mobile');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let state = 'closed'; // 'closed', 'half', 'full'

    openBtn.addEventListener('click', () => {
        const screenWidth = window.innerWidth - 20;
        console.log("click");
        console.log(window.innerWidth);
        if (screenWidth < 1140) {
            console.log("click if");
            state = 'full'; // Устанавливаем состояние
            bottomSheet.classList.add('full');
            bottomSheet.style.transform = ''; // Сброс inline-стиля на всякий случай
            document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
        }
    });

    openBtnMobile.addEventListener('click', () => {
        state = 'closed';
        bottomSheet.classList.remove('half', 'full');
        document.body.style.overflow = ''; // Разблокируем скролл страницы
    });

    bottomSheet.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
        bottomSheet.style.transition = 'none'; // Отключаем анимацию во время drag
    });

    bottomSheet.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Предотвращаем скролл страницы во время drag
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        const translateY = Math.max(0, deltaY); // Не даем уйти выше 0
        bottomSheet.style.transform = `translateY(${translateY}px)`;
    });

    bottomSheet.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        bottomSheet.style.transition = 'transform 0.3s ease'; // Включаем обратно

        const deltaY = currentY - startY;
        const threshold = 50; // Порог для переключения

        if (state === 'full') {
            if (deltaY > threshold) {
                // Потащили вниз -> закрыть
                state = 'closed';
                bottomSheet.classList.remove('half', 'full');
                document.body.style.overflow = ''; // Разблокируем скролл страницы
            } else {
                // Вернуть на полный (ничего не меняем)
            }
        }

        // Всегда сбрасываем inline-стиль, чтобы классы работали
        bottomSheet.style.transform = '';
    });
});






document.addEventListener('DOMContentLoaded', function() {

    const bottomSheet = document.getElementById('bottom-sheet-payment');
    const openBtn = document.querySelectorAll('.payment-method-btn-mobile');
    const openBtnMobile = document.getElementById('paymentBtnPayErrorMobile');
    const openBtnMobileSuccess = document.getElementById('paymentBtnPaySuccessMobile');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let state = 'closed'; // 'closed', 'half', 'full'

    openBtn.forEach(function(button) {
        button.addEventListener('click', () => {
            const screenWidth = window.innerWidth;
            console.log("click");
            if (screenWidth < 1140) {
                console.log("click if");
                state = 'full';
                bottomSheet.classList.add('full');
                bottomSheet.style.transform = ''; // Сброс inline-стиля на всякий случай
                document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
            }
        
        });
    });

            openBtnMobile.addEventListener('click', () => {
            state = 'closed';
            bottomSheet.classList.remove('half', 'full');
            document.body.style.overflow = ''; // Разблокируем скролл страницы
    
    });


    openBtnMobileSuccess.addEventListener('click', () => {
            state = 'closed';
            bottomSheet.classList.remove('half', 'full');
            document.body.style.overflow = ''; // Разблокируем скролл страницы
    
    });

    bottomSheet.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    isDragging = true;
    bottomSheet.style.transition = 'none'; // Отключаем анимацию во время drag
    });

    bottomSheet.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Предотвращаем скролл страницы во время drag
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    const translateY = Math.max(0, deltaY); // Не даем уйти выше 0
    bottomSheet.style.transform = `translateY(${translateY}px)`;
    });

    bottomSheet.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    bottomSheet.style.transition = 'transform 0.3s ease'; // Включаем обратно

    const deltaY = currentY - startY;
    const threshold = 50; // Порог для переключения

   if (state === 'full') {
        if (deltaY > threshold) {
        // Потащили вниз -> на половину

        bottomSheet.classList.remove('full');
        // Скролл остается заблокированным
        } else {
        // Вернуть на полный
        // Ничего не меняем
        }
        if (deltaY > threshold) {
            // Потащили вниз -> закрыть
            state = 'closed';
            bottomSheet.classList.remove('half', 'full');
            document.body.style.overflow = ''; // Разблокируем скролл страницы
            }
    }

    // Всегда сбрасываем inline-стиль, чтобы классы работали
    bottomSheet.style.transform = '';
    });

});





document.addEventListener('DOMContentLoaded', function() {

    const bottomSheet = document.getElementById('bottom-sheet-payment-error');
    const openBtn = document.getElementById('paymentBtnPayErrorMobile');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let state = 'closed'; // 'closed', 'half', 'full'

    openBtn.addEventListener('click', () => {
        const screenWidth = window.innerWidth;
        console.log("click");
        if (screenWidth < 1140) {
            console.log("click if");
            state = 'full';
            bottomSheet.classList.add('full');
            bottomSheet.style.transform = ''; // Сброс inline-стиля на всякий случай
            document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
        }
    
    });



    bottomSheet.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    isDragging = true;
    bottomSheet.style.transition = 'none'; // Отключаем анимацию во время drag
    });

    bottomSheet.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Предотвращаем скролл страницы во время drag
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    const translateY = Math.max(0, deltaY); // Не даем уйти выше 0
    bottomSheet.style.transform = `translateY(${translateY}px)`;
    });

    bottomSheet.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    bottomSheet.style.transition = 'transform 0.3s ease'; // Включаем обратно

    const deltaY = currentY - startY;
    const threshold = 50; // Порог для переключения

    if (state === 'full') {
        if (deltaY > threshold) {
        // Потащили вниз -> на половину
        state = 'half';
        bottomSheet.classList.add('half');
        bottomSheet.classList.remove('full');
        // Скролл остается заблокированным
        } else {
        // Вернуть на полный
        // Ничего не меняем
        }

                if (deltaY > threshold) {
            // Потащили вниз -> закрыть
            state = 'closed';
            bottomSheet.classList.remove('half', 'full');
            document.body.style.overflow = ''; // Разблокируем скролл страницы
            }
    }


    // Всегда сбрасываем inline-стиль, чтобы классы работали
    bottomSheet.style.transform = '';
    });

});








document.addEventListener('DOMContentLoaded', function() {

    const bottomSheet = document.getElementById('bottom-sheet-payment-success');
    const openBtn = document.getElementById('paymentBtnPaySuccessMobile');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let state = 'closed'; // 'closed', 'half', 'full'

    openBtn.addEventListener('click', () => {
        const screenWidth = window.innerWidth;
        console.log("click");
        if (screenWidth < 1140) {
            console.log("click if");
            state = 'full';
            bottomSheet.classList.add('full');
            bottomSheet.style.transform = ''; // Сброс inline-стиля на всякий случай
            document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
        }
    
    });



    bottomSheet.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    isDragging = true;
    bottomSheet.style.transition = 'none'; // Отключаем анимацию во время drag
    });

    bottomSheet.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Предотвращаем скролл страницы во время drag
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    const translateY = Math.max(0, deltaY); // Не даем уйти выше 0
    bottomSheet.style.transform = `translateY(${translateY}px)`;
    });

    bottomSheet.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    bottomSheet.style.transition = 'transform 0.3s ease'; // Включаем обратно

    const deltaY = currentY - startY;
    const threshold = 50; // Порог для переключения

    if (state === 'full') {
        if (deltaY > threshold) {
        // Потащили вниз -> на половину
        state = 'half';
        bottomSheet.classList.add('half');
        bottomSheet.classList.remove('full');
        // Скролл остается заблокированным
        } else {
        // Вернуть на полный
        // Ничего не меняем
        }

                if (deltaY > threshold) {
            // Потащили вниз -> закрыть
            state = 'closed';
            bottomSheet.classList.remove('half', 'full');
            document.body.style.overflow = ''; // Разблокируем скролл страницы
            }
    }


    // Всегда сбрасываем inline-стиль, чтобы классы работали
    bottomSheet.style.transform = '';
    });

});
