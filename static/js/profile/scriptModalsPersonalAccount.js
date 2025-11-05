

document.addEventListener('DOMContentLoaded', function() {

    const bottomSheet = document.getElementById('bottom-sheet-description');
    const openBtn = document.getElementById('aboutBtnMobile');
    const overlay = document.getElementById('overlay');
    
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
            bottomSheet.classList.add('description-full');
            bottomSheet.style.transform = ''; // Сброс inline-стиля на всякий случай
            document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
            
             overlay.classList.add('show');
        }
    });
    

    bottomSheet.addEventListener('mousedown', (e) => {
        // Исключаем поля ввода
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
            return;  // Не начинаем drag
        }
        startY = e.clientY;
        isDragging = true;
        bottomSheet.style.transition = 'none';
        console.log('Mousedown (drag started)');
    });
    // Для touch-событий (добавьте аналогично)
    bottomSheet.addEventListener('touchstart', (e) => {
        // Исключаем поля ввода
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
            return;
        }
        if (e.touches.length > 0) {
            startY = e.touches[0].clientY;
            isDragging = true;
            bottomSheet.style.transition = 'none';
            console.log('Touchstart (drag started)');
        }
    });


      bottomSheet.addEventListener('touchstart', (e) => {
        console.log('Touchstart event:', e);  // Проверяет, срабатывает ли событие
        startY = e.touches[0].clientY;
        console.log('startY:', startY);
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
        console.log('Touchend event, deltaY:', currentY - startY, 'state:', state);
        if (!isDragging) return;
        isDragging = false;
        bottomSheet.style.transition = 'transform 0.3s ease'; // Включаем обратно

        const deltaY = currentY - startY;
        const threshold = 50; // Порог для переключения

        if (state === 'full') {
            if (deltaY > threshold) {
                // Потащили вниз -> закрыть
                state = 'closed';
                bottomSheet.classList.remove('half', 'description-full');
                    overlay.classList.remove('show');
                document.body.style.overflow = ''; // Разблокируем скролл страницы
            } else {
                // Вернуть на полный (ничего не меняем)
            }
        }

        // Всегда сбрасываем inline-стиль, чтобы классы работали
        bottomSheet.style.transform = '';
    });

    // Добавьте после touch-событий
bottomSheet.addEventListener('mousedown', (e) => {
    startY = e.clientY;
    isDragging = true;
    bottomSheet.style.transition = 'none';
    console.log('Mousedown');
});
bottomSheet.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentY = e.clientY;
    const deltaY = currentY - startY;
    const translateY = Math.max(0, deltaY);
    bottomSheet.style.transform = `translateY(${translateY}px)`;
});
bottomSheet.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    bottomSheet.style.transition = 'transform 0.3s ease';
    const deltaY = currentY - startY;
    if (state === 'full' && deltaY > 50) {
        state = 'closed';
        bottomSheet.classList.remove('half', 'description-full');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
    bottomSheet.style.transform = '';
});
});



document.addEventListener('DOMContentLoaded', function() {

    const bottomSheet = document.getElementById('bottom-sheet-target');
    const openBtn = document.getElementById('targetBtnMobile');
        const overlay = document.getElementById('overlayTarget');
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
            
    overlay.classList.add('show');
        }
    });

    bottomSheet.addEventListener('mousedown', (e) => {
        // Исключаем поля ввода
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
            return;  // Не начинаем drag
        }
        startY = e.clientY;
        isDragging = true;
        bottomSheet.style.transition = 'none';
        console.log('Mousedown (drag started)');
    });
    // Для touch-событий (добавьте аналогично)
    bottomSheet.addEventListener('touchstart', (e) => {
        // Исключаем поля ввода
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
            return;
        }
        if (e.touches.length > 0) {
            startY = e.touches[0].clientY;
            isDragging = true;
            bottomSheet.style.transition = 'none';
            console.log('Touchstart (drag started)');
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
                // Потащили вниз -> закрыть
                state = 'closed';
                bottomSheet.classList.remove('half', 'full');
                document.body.style.overflow = ''; // Разблокируем скролл страницы
                    overlay.classList.remove('show');
            } else {
                // Вернуть на полный (ничего не меняем)
            }
        }

        // Всегда сбрасываем inline-стиль, чтобы классы работали
        bottomSheet.style.transform = '';
    });


    
    // Добавьте после touch-событий
bottomSheet.addEventListener('mousedown', (e) => {
    startY = e.clientY;
    isDragging = true;
    bottomSheet.style.transition = 'none';
    console.log('Mousedown');
});
bottomSheet.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentY = e.clientY;
    const deltaY = currentY - startY;
    const translateY = Math.max(0, deltaY);
    bottomSheet.style.transform = `translateY(${translateY}px)`;
});
bottomSheet.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    bottomSheet.style.transition = 'transform 0.3s ease';
    const deltaY = currentY - startY;
    if (state === 'full' && deltaY > 50) {
        state = 'closed';
        bottomSheet.classList.remove('half', 'full');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
    bottomSheet.style.transform = '';
});

});



// Функция для получения CSRF-токена (уже есть, используйте)

// Счётчик символов для textarea
function updateCharCount(textarea, counterId, maxLength) {
  const remaining = maxLength - textarea.value.length;
  document.getElementById(counterId).textContent = remaining;
}

document.addEventListener('DOMContentLoaded', function() {
  // Для десктопного about
  const aboutTextarea = document.querySelector('#aboutForm textarea[name="about"]');
  if (aboutTextarea) {
    aboutTextarea.addEventListener('input', () => updateCharCount(aboutTextarea, 'charCountAbout', 200));
  }

  // Для мобильного about
  const aboutTextareaMobile = document.querySelector('#aboutFormMobile textarea[name="about"]');
  if (aboutTextareaMobile) {
    aboutTextareaMobile.addEventListener('input', () => updateCharCount(aboutTextareaMobile, 'charCountAboutMobile', 200));
  }

  // Для десктопного goal
  const goalTextarea = document.querySelector('#goalForm textarea[name="goal_description"]');
  if (goalTextarea) {
    goalTextarea.addEventListener('input', () => updateCharCount(goalTextarea, 'charCountGoal', 200));
  }

  // Для мобильного goal
  const goalTextareaMobile = document.querySelector('#goalFormMobile textarea[name="goal_description"]');
  if (goalTextareaMobile) {
    goalTextareaMobile.addEventListener('input', () => updateCharCount(goalTextareaMobile, 'charCountGoalMobile', 200));
  }
});

// AJAX для about (десктоп)
$('#aboutForm').on('submit', function(e) {
  e.preventDefault();
  if ($(this).data('submitting')) return;
  $(this).data('submitting', true);

  var formData = $(this).serialize();
  $('#aboutMessage').text('');

  $.ajax({
    url: '/update-about-ajax/',
    type: 'POST',
    data: formData,
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    success: function(data) {
      if (data.success) {
        $('#aboutMessage').text(data.message).css('color', 'green');
        
        // Асинхронное обновление контента
        if (data.about) {
          // Обновляем текст "Об авторе"
          $('.profile__item--about .profile__card--body p').text(data.about);
          // Меняем кнопку на "Изменить"
          $('#aboutBtn').html('Изменить историю <img src="/static/images/profile/pen.png">');
        }
        
        setTimeout(() => {
          $('#modalOverlayAbout').removeClass('active');
          $('#aboutForm')[0].reset();
          document.body.style.overflow = '';
        }, 1000);
      } else {
        var errorMsg = data.errors ? Object.values(data.errors).join(', ') : 'Ошибка';
        $('#aboutMessage').text('Ошибка: ' + errorMsg);
      }
    },
    error: function() {
      $('#aboutMessage').text('Ошибка сети');
    },
    complete: function() {
      $('#aboutForm').data('submitting', false);
    }
  });
});

// AJAX для goal (десктоп)
// AJAX для goal (десктоп)
$('#goalForm').on('submit', function(e) {
  e.preventDefault();
  if ($(this).data('submitting')) return;
  $(this).data('submitting', true);

  var formData = $(this).serialize();
  $('#goalMessage').text('');

  $.ajax({
    url: '/update-goal-ajax/',
    type: 'POST',
    data: formData,
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    success: function(data) {
      if (data.success) {
        $('#goalMessage').text(data.message).css('color', 'green');
        
        // Асинхронное обновление контента
        if (data.goal) {
          // Обновляем заголовок
          $('.profile__item--destination .profile__card--header h2').text(data.goal.goal_title || 'Цель:');
          // Обновляем описание
          $('.profile__item--destination .profile__card--body p').first().text(data.goal.goal_description);
          
          // Если блока прогресса еще нет (первое создание цели), создаем его
          if (!$('.profile__progress').length) {
            const progressHTML = `
              <div class="profile__progress">
                <h3 id="progress-text">0 из ${data.goal.goal_amount}</h3>
                <div class="profile__progress--block">
                  <div class="profile__progress--bar"></div>
                </div>
              </div>
            `;
            $('.profile__item--destination .profile__card--body p').after(progressHTML);
          } else {
            // Если блок уже есть, просто обновляем текст
            $('.profile__progress h3').text('0 из ' + data.goal.goal_amount);
          }
          
          // Меняем кнопку на "Изменить"
          $('#targetBtn').html('Изменить цель <img src="/static/images/profile/pen.png">');
          
          // Обновляем прогресс-бар
          setTimeout(updateProgressBar, 50);
        }
        
        setTimeout(() => {
          $('#modalOverlay').removeClass('active');
          $('#goalForm')[0].reset();
          
          // РАЗБЛОКИРОВКА ПРОКРУТКИ - добавляем эту строку
          $('body').css('overflow', 'auto');
        }, 1000);
      } else {
        var errorMsg = data.errors ? Object.values(data.errors).join(', ') : 'Ошибка';
        $('#goalMessage').text('Ошибка: ' + errorMsg);
      }
    },
    error: function() {
      $('#goalMessage').text('Ошибка сети');
    },
    complete: function() {
      $('#goalForm').data('submitting', false);
    }
  });
});