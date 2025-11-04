

// Регистрация
$('#registerForm').on('submit', function(e) {
  e.preventDefault();
  if ($(this).data('submitting')) return;
  $(this).data('submitting', true);
  
  var formData = $(this).serialize();
  $('#registerMessage').text('');
  
  $.ajax({
    url: '/register-ajax/',
    type: 'POST',
    data: formData,
    headers: {
      "X-CSRFToken": getCookie("csrftoken")
    },
    success: function(data) {
      if (data.success) {
        window.location.href = data.redirect;
      } else {
        var errorMsg = data.errors ? Object.values(data.errors).join(', ') : 'Ошибка';
        $('#registerMessage').text('Ошибка: ' + errorMsg);
      }
    },
    error: function(xhr, status, error) {
      $('#registerMessage').text('Ошибка сети');
    },
    complete: function() {
      $('#registerForm').data('submitting', false);
    }
  });
});

// Вход
$('#loginForm').on('submit', function(e) {
  e.preventDefault();
  if ($(this).data('submitting')) return;
  $(this).data('submitting', true);
  
  var formData = $(this).serialize();
  $('#loginMessage').text('');
  
  $.ajax({
    url: '/login-ajax/',
    type: 'POST',
    data: formData,
    headers: {
      "X-CSRFToken": getCookie("csrftoken")
    },
    success: function(data) {
      if (data.success) {
        window.location.href = data.redirect;
      } else {
        var errorMsg = data.errors ? Object.values(data.errors).join(', ') : 'Ошибка';
        $('#loginMessage').text('Ошибка: ' + errorMsg);
      }
    },
    error: function(xhr, status, error) {
      $('#loginMessage').text('Ошибка сети');
    },
    complete: function() {
      $('#loginForm').data('submitting', false);
    }
  });
});

// Забыл пароль: закрыть модал входа и открыть восстановление
$('#recoveryBtn').on('click', function(e) {
  e.preventDefault();
  $('#modalOverlayAuth').removeClass('active');
  $('#modalOverlayRecovery').addClass('active');
});

// Восстановление
$('#resetForm').on('submit', function(e) {
  e.preventDefault();
  if ($(this).data('submitting')) return;
  $(this).data('submitting', true);
  
  var formData = $(this).serialize();
  $('#resetMessage').text('');
  
  $.ajax({
    url: '/password-reset-ajax/',
    type: 'POST',
    data: formData,
    headers: {
      "X-CSRFToken": getCookie("csrftoken")
    },
    success: function(data) {
      if (data.success) {
        $('#resetMessage').text(data.message).css('color', 'green');
        setTimeout(() => {
          $('#modalOverlayRecovery').removeClass('active');
          $('#resetForm')[0].reset();
        }, 2000);
      } else {
        var errorMsg = data.errors ? Object.values(data.errors).join(', ') : 'Ошибка';
        $('#resetMessage').text('Ошибка: ' + errorMsg).css('color', 'red');
      }
    },
    error: function(xhr, status, error) {
      $('#resetMessage').text('Ошибка сети').css('color', 'red');
    },
    complete: function() {
      $('#resetForm').data('submitting', false);
    }
  });
});

// JavaScript для модального окна регистрации
document.addEventListener('DOMContentLoaded', function() {
  const modalOverlay = document.getElementById('modalOverlay');
  const registerBtn = document.getElementById('registerBtn');
  const modalClose = document.getElementById('modalClose');
  const registerBtnBurger = document.getElementById('registerBtnBurger');
  const authorButtons = document.querySelectorAll('.transparent-button.active');

  function getFirstInput() {
    return document.querySelector('#registerForm input:not([type="hidden"])');
  }

  // Функция открытия модального окна (без автора)
  function openModal() {
    modalOverlay.classList.add('active');
    // Сбрасываем чекбокс автора при обычном открытии
    const authorCheckbox = document.querySelector('input[name="is_author"]');
    if (authorCheckbox) {
      authorCheckbox.checked = false;
      const customCheckbox = authorCheckbox.nextElementSibling;
      if (customCheckbox) {
        customCheckbox.classList.remove('checked');
      }
    }
    // Автофокус на поле email
    setTimeout(() => {
      const firstInput = getFirstInput();
      if (firstInput) {
        firstInput.focus();
      }
    }, 150); // Увеличиваем задержку для надежности
  }

  // Функция открытия модального окна как автор
  function openModalAsAuthor() {
    modalOverlay.classList.add('active');
    // Проставляем чекбокс автора
    const authorCheckbox = document.querySelector('input[name="is_author"]');
    if (authorCheckbox) {
      authorCheckbox.checked = true;
      const customCheckbox = authorCheckbox.nextElementSibling;
      if (customCheckbox) {
        customCheckbox.classList.add('checked');
      }
    }
    // Автофокус на поле email
    setTimeout(() => {
      const firstInput = getFirstInput();
      if (firstInput) {
        firstInput.focus();
      }
    }, 150); // Увеличиваем задержку для надежности
  }

  // Функция закрытия модального окна
  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  // Обработчики для кнопок регистрации
  if (registerBtn) {
    registerBtn.addEventListener('click', openModal);
  }
  
  if (registerBtnBurger) {
    registerBtnBurger.addEventListener('click', openModal);
  }

  // Обработчики для кнопок "Стать автором"
  authorButtons.forEach(button => {
    button.addEventListener('click', openModalAsAuthor);
  });

  // Закрытие модального окна
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', function(event) {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Синхронизация кастомного чекбокса
  const authorCheckbox = document.querySelector('input[name="is_author"]');
  if (authorCheckbox) {
    authorCheckbox.addEventListener('change', function() {
      const customCheckbox = this.nextElementSibling;
      if (customCheckbox) {
        if (this.checked) {
          customCheckbox.classList.add('checked');
        } else {
          customCheckbox.classList.remove('checked');
        }
      }
    });
  }
});

// JavaScript для модального окна авторизации
document.addEventListener('DOMContentLoaded', function() {
  const modalOverlay = document.getElementById('modalOverlayAuth');
  const registerBtn = document.getElementById('authBtn');
  const modalClose = document.getElementById('modalCloseAuth');
  const registerBtnBurger = document.getElementById('authBtnBurger');
  
  function getFirstInput() {
    return document.querySelector('#loginForm input:not([type="hidden"])');
  }

  function openModal() {
    modalOverlay.classList.add('active');
      // Автофокус на поле email
    setTimeout(() => {
      const firstInput = getFirstInput();
      if (firstInput) {
        firstInput.focus();
      }
    }, 150); // Увеличиваем задержку для надежности
  }
  const openButtons = [registerBtn, registerBtnBurger];

  openButtons.forEach(button => {
    button.addEventListener('click', openModal);
  });

  modalClose.addEventListener('click', function() {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', function(event) {
    if (event.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
      modalOverlay.classList.remove('active');
    }
  });


});

// JavaScript для модального окна восстановления
document.addEventListener('DOMContentLoaded', function() {
  const modalOverlay = document.getElementById('modalOverlayRecovery');
  const registerBtn = document.getElementById('recoveryBtn');
  const modalClose = document.getElementById('modalCloseRecovery');

  function getFirstInput() {
    return document.querySelector('#resetForm input:not([type="hidden"])');
  }

  registerBtn.addEventListener('click', function() {
    modalOverlay.classList.add('active');
      // Автофокус на поле email
    setTimeout(() => {
      const firstInput = getFirstInput();
      if (firstInput) {
        firstInput.focus();
      }
    }, 150); // Увеличиваем задержку для надежности
  });

  modalClose.addEventListener('click', function() {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', function(event) {
    if (event.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
      modalOverlay.classList.remove('active');
    }
  });

});

// // JavaScript для модального окна ошибки (оставлено без изменений)
// document.addEventListener('DOMContentLoaded', function() {
//   const modalOverlay = document.getElementById('modalOverlayError');
//   const modalClose = document.getElementById('modalCloseError');

//   modalClose.addEventListener('click', function() {
//     modalOverlay.classList.remove('active');
//   });

//   modalOverlay.addEventListener('click', function(event) {
//     if (event.target === modalOverlay) {
//       modalOverlay.classList.remove('active');
//     }
//   });

//   document.addEventListener('keydown', function(event) {
//     if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
//       modalOverlay.classList.remove('active');
//     }
//   });
// });