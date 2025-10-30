// JavaScript для модального окна
  document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlay');
    const registerBtn = document.getElementById('registerBtn');
    const modalClose = document.getElementById('modalClose');
    const registerBtnBurger = document.getElementById('registerBtnBurger');

    function openModal() {
      modalOverlay.classList.add('active');
    }
    const openButtons = [registerBtn, registerBtnBurger]; // добавьте второй элемент

    openButtons.forEach(button => {
      button.addEventListener('click', openModal);
    });    

    // Закрытие модального окна по крестику
    modalClose.addEventListener('click', function() {
      modalOverlay.classList.remove('active');
    });

    // Закрытие модального окна по клику на фон
    modalOverlay.addEventListener('click', function(event) {
      if (event.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });

    // Закрытие модального окна по клавише Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
      }
    });
  });


    // JavaScript для модального окна
  document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlayAuth');
    const registerBtn = document.getElementById('authBtn');
    const modalClose = document.getElementById('modalCloseAuth');
    const registerBtnBurger = document.getElementById('authBtnBurger');

    function openModal() {
      modalOverlay.classList.add('active');
    }
    const openButtons = [registerBtn, registerBtnBurger]; // добавьте второй элемент

    openButtons.forEach(button => {
      button.addEventListener('click', openModal);
    });  

    // Открытие модального окна
    registerBtn.addEventListener('click', function() {
      modalOverlay.classList.add('active');
    });

    // Закрытие модального окна по крестику
    modalClose.addEventListener('click', function() {
      modalOverlay.classList.remove('active');
    });

    // Закрытие модального окна по клику на фон
    modalOverlay.addEventListener('click', function(event) {
      if (event.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });

    // Закрытие модального окна по клавише Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
      }
    });
  });


      // JavaScript для модального окна
  document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlayRecovery');
    const registerBtn = document.getElementById('recoveryBtn');
    const modalClose = document.getElementById('modalCloseRecovery');

    // Открытие модального окна
    registerBtn.addEventListener('click', function() {
      modalOverlay.classList.add('active');
    });

    // Закрытие модального окна по крестику
    modalClose.addEventListener('click', function() {
      modalOverlay.classList.remove('active');
    });

    // Закрытие модального окна по клику на фон
    modalOverlay.addEventListener('click', function(event) {
      if (event.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });

    // Закрытие модального окна по клавише Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
      }
    });
  });


      // JavaScript для модального окна
  document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlayError');
    // const registerBtn = document.getElementById('ErrorBtn');
    const modalClose = document.getElementById('modalCloseError');

    // Открытие модального окна
    // registerBtn.addEventListener('click', function() {
    //   modalOverlay.classList.add('active');
    //   document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
    // });

    // Закрытие модального окна по крестику
    modalClose.addEventListener('click', function() {
      modalOverlay.classList.remove('active');
    });

    // Закрытие модального окна по клику на фон
    modalOverlay.addEventListener('click', function(event) {
      if (event.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });

    // Закрытие модального окна по клавише Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
      }
    });
  });