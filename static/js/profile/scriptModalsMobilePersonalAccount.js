// JavaScript для модального окна
  document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlay');
    const registerBtn = document.getElementById('targetBtn');
    const modalClose = document.getElementById('modalClose');
    // const registerBtnBurger = document.getElementById('registerBtnBurger');

    function openModal() {
      modalOverlay.classList.add('active');
              document.body.style.overflow = 'hidden';
    }
    // const openButtons = [registerBtn, registerBtnBurger]; // добавьте второй элемент
    const openButtons = [registerBtn]; 

    openButtons.forEach(button => {
      button.addEventListener('click', openModal);
    });    

    // Закрытие модального окна по крестику
    modalClose.addEventListener('click', function() {
      modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
    });

    // Закрытие модального окна по клику на фон
    modalOverlay.addEventListener('click', function(event) {
      if (event.target === modalOverlay) {
        modalOverlay.classList.remove('active');
              document.body.style.overflow = '';
      }
    });

    // Закрытие модального окна по клавише Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
              document.body.style.overflow = '';
      }
    });
  });


  function updateOverlayHeight() {
  const modalOverlay = document.getElementById('modalOverlay');
  const bodyHeight = document.body.scrollHeight;
  modalOverlay.style.height = bodyHeight + 'px';
}

// Обновлять при загрузке и изменении контента
updateOverlayHeight();
window.addEventListener('resize', updateOverlayHeight);

// Если контент динамически меняется
const observerTarget = new MutationObserver(updateOverlayHeight);
observerTarget.observe(document.body, { 
  childList: true, 
  subtree: true,
  characterData: true 
});


// JavaScript для модального окна
  document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlayAbout');
    const registerBtn = document.getElementById('aboutBtn');
    const modalClose = document.getElementById('modalCloseAbout');
    // const registerBtnBurger = document.getElementById('registerBtnBurger');

    function openModal() {
      modalOverlay.classList.add('active');
              document.body.style.overflow = 'hidden';
    }
    // const openButtons = [registerBtn, registerBtnBurger]; // добавьте второй элемент
    const openButtons = [registerBtn]; 

    openButtons.forEach(button => {
      button.addEventListener('click', openModal);
    });    

    // Закрытие модального окна по крестику
    modalClose.addEventListener('click', function() {
      modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
    });

    // Закрытие модального окна по клику на фон
    modalOverlay.addEventListener('click', function(event) {
      if (event.target === modalOverlay) {
        modalOverlay.classList.remove('active');
              document.body.style.overflow = '';
      }
    });

    // Закрытие модального окна по клавише Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
              document.body.style.overflow = '';
      }
    });
  });


  function updateOverlayHeightAbout() {
  const modalOverlay = document.getElementById('modalOverlayAbout');
  const bodyHeight = document.body.scrollHeight;
  modalOverlay.style.height = bodyHeight + 'px';
}

// Обновлять при загрузке и изменении контента
updateOverlayHeightAbout();
window.addEventListener('resize', updateOverlayHeightAbout);

// Если контент динамически меняется
const observerAboutMobile = new MutationObserver(updateOverlayHeight);
observerAboutMobile.observe(document.body, { 
  childList: true, 
  subtree: true,
  characterData: true 
});


// AJAX для about (мобильный)
$('#aboutFormMobile').on('submit', function(e) {
  e.preventDefault();
  if ($(this).data('submitting')) return;
  $(this).data('submitting', true);

  var formData = $(this).serialize();
  $('#aboutMessageMobile').text('');

  $.ajax({
    url: '/update-about-ajax/',
    type: 'POST',
    data: formData,
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    success: function(data) {
      if (data.success) {
        $('#aboutMessageMobile').text(data.message).css('color', 'green');
        
        // Асинхронное обновление контента
        if (data.about) {
          // Обновляем текст "Об авторе"
          $('.profile__item--about .profile__card--body p').text(data.about);
          // Меняем кнопку на "Изменить" (для мобильной кнопки)
          $('#aboutBtnMobile').html('Об авторе<img src="/static/images/profile/pen-gray.svg">');
        }
        
        setTimeout(() => {
          $('#bottom-sheet-description').classList.remove('description-full');
          $('#overlay').classList.remove('show');
          $('#aboutFormMobile')[0].reset();
          document.body.style.overflow = '';
        }, 1000);
      } else {
        var errorMsg = data.errors ? Object.values(data.errors).join(', ') : 'Ошибка';
        $('#aboutMessageMobile').text('Ошибка: ' + errorMsg);
      }
    },
    error: function() {
      $('#aboutMessageMobile').text('Ошибка сети');
    },
    complete: function() {
      $('#aboutFormMobile').data('submitting', false);
    }
  });
});

// AJAX для goal (мобильный)
$('#goalFormMobile').on('submit', function(e) {
  e.preventDefault();
  if ($(this).data('submitting')) return;
  $(this).data('submitting', true);

  var formData = $(this).serialize();
  $('#goalMessageMobile').text('');

  $.ajax({
    url: '/update-goal-ajax/',
    type: 'POST',
    data: formData,
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    success: function(data) {
      if (data.success) {
        $('#goalMessageMobile').text(data.message).css('color', 'green');
        
        // Асинхронное обновление контента
        if (data.goal) {
          // Обновляем заголовок
          $('.profile__item--destination .profile__card--header h2').text(data.goal.goal_title || 'Цель:');
          // Обновляем описание
          $('.profile__item--destination .profile__card--body p').first().text(data.goal.goal_description);
          // Обновляем прогресс (если goal_amount есть)
          if (data.goal.goal_amount) {
            $('.profile__progress h3').text('0 из ' + data.goal.goal_amount);
          }
          // Меняем кнопку на "Изменить" (для мобильной кнопки)
          $('#targetBtnMobile').html('Цель<img src="/static/images/profile/pen-gray.svg">');
        }
        
        setTimeout(() => {
          $('#bottom-sheet-target').classList.remove('full');
          $('#overlayTarget').classList.remove('show');
          $('#goalFormMobile')[0].reset();
          document.body.style.overflow = '';
        }, 1000);
      } else {
        var errorMsg = data.errors ? Object.values(data.errors).join(', ') : 'Ошибка';
        $('#goalMessageMobile').text('Ошибка: ' + errorMsg);
      }
    },
    error: function() {
      $('#goalMessageMobile').text('Ошибка сети');
    },
    complete: function() {
      $('#goalFormMobile').data('submitting', false);
    }
  });
});