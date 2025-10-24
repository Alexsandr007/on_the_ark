// JavaScript для модального окна
document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlay');
    const registerBtn = document.getElementById('paymentBtn');
    const modalClose = document.getElementById('modalClose');

    registerBtn.addEventListener('click', function() {
      console.log(window.innerWidth);

      const screenWidth = window.innerWidth - 20;
      if (screenWidth >= 1140) {
        modalOverlay.classList.add('active');
        // Блокировка скролла при открытии модального окна
        document.body.style.overflow = 'hidden';
      } 
    });

    // Закрытие модального окна по крестику
    modalClose.addEventListener('click', function() {
      modalOverlay.classList.remove('active');
      // Разблокировка скролла при закрытии
      document.body.style.overflow = '';
    });

    // Закрытие модального окна по клику на фон
    modalOverlay.addEventListener('click', function(event) {
      if (event.target === modalOverlay) {
        modalOverlay.classList.remove('active');
        // Разблокировка скролла при закрытии
        document.body.style.overflow = '';
      }
    });

    // Закрытие модального окна по клавише Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
        modalOverlay.classList.remove('active');
        // Разблокировка скролла при закрытии
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
const observer = new MutationObserver(updateOverlayHeight);
observer.observe(document.body, { 
  childList: true, 
  subtree: true,
  characterData: true 
});



// JavaScript для модального окна выбора способа оплаты
document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlayPayment');
    const registerBtns = document.querySelectorAll('.payment-method-btn'); 
    const modalClose = document.getElementById('modalClosePayment');
    


    registerBtns.forEach(function(button) {
        button.addEventListener('click', () => {
          const screenWidth = window.innerWidth - 20;
            if (screenWidth >= 1140) {
                  modalOverlay.classList.add('active');
                  const modalOverlayFirst = document.getElementById('modalOverlay');
                  modalOverlayFirst.classList.remove('active');
            }
        
        });
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


function updateOverlayHeightTwo() {
  const modalOverlay = document.getElementById('modalOverlayPayment');
  const bodyHeight = document.body.scrollHeight;
  modalOverlay.style.height = bodyHeight + 'px';
}

// Обновлять при загрузке и изменении контента
updateOverlayHeightTwo();
window.addEventListener('resize', updateOverlayHeightTwo);

// Если контент динамически меняется
const observerTwo = new MutationObserver(updateOverlayHeightTwo);
observerTwo.observe(document.body, { 
  childList: true, 
  subtree: true,
  characterData: true 
});


document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.container-text');
    
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Получаем цену за месяц
            const priceElement = this.querySelector('span').closest('p');
            const priceText = priceElement.textContent;
            const pricePerMonth = parseInt(priceText.match(/\d+/)[0]);
            
            // Получаем количество месяцев
            const monthsText = this.querySelector('p:first-child').textContent;
            const months = parseInt(monthsText.match(/\d+/)[0]);
            
            // Вычисляем общую сумму
            const totalAmount = pricePerMonth * months;
            
            // Обновляем поля
            updatePriceDisplay(pricePerMonth, totalAmount);
        });
    });
    
    function updatePriceDisplay(monthlyPrice, totalPrice) {
        // Поле "цена за месяц" (формат: "859 ₽/месяц")
        const monthlyField = document.querySelector('.monthly-price-field h3'); // замените на ваш селектор
        if (monthlyField) {
            monthlyField.innerHTML = `${monthlyPrice} <span>₽</span>/месяц`;
        }
        
        // Поле "общая сумма" (формат: "859 ₽")
        const totalField = document.querySelector('.total-price-field h2'); // замените на ваш селектор
        if (totalField) {
            totalField.innerHTML = `${totalPrice} ₽`;
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.container-text-pc');
    
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Получаем цену за месяц
            const priceElement = this.querySelector('span').closest('p');
            const priceText = priceElement.textContent;
            const pricePerMonth = parseInt(priceText.match(/\d+/)[0]);
            
            // Получаем количество месяцев
            const monthsText = this.querySelector('p:first-child').textContent;
            const months = parseInt(monthsText.match(/\d+/)[0]);
            
            // Вычисляем общую сумму
            const totalAmount = pricePerMonth * months;
            
            // Обновляем поля
            updatePriceDisplay(pricePerMonth, totalAmount);
        });
    });
    
    function updatePriceDisplay(monthlyPrice, totalPrice) {
        // Поле "цена за месяц" (формат: "859 ₽/месяц")
        const monthlyField = document.querySelector('.monthly-price-field-pc h3'); // замените на ваш селектор
        if (monthlyField) {
            monthlyField.innerHTML = `${monthlyPrice} <span>₽</span>/месяц`;
        }
        
        // Поле "общая сумма" (формат: "859 ₽")
        const totalField = document.querySelector('.total-price-field-pc h2'); // замените на ваш селектор
        if (totalField) {
            totalField.innerHTML = `${totalPrice} ₽`;
        }
    }
});


// JavaScript для модального окна
  document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlayOne');
    const registerBtn = document.getElementById('paymentBtnOne');
    const modalClose = document.getElementById('modalCloseOne');

    registerBtn.addEventListener('click', function() {
      
      modalOverlay.classList.add('active');
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


function updateOverlayHeightThree() {
  const modalOverlay = document.getElementById('modalOverlayOne');
  const bodyHeight = document.body.scrollHeight;
  modalOverlay.style.height = bodyHeight + 'px';
}

// Обновлять при загрузке и изменении контента
updateOverlayHeightThree();
window.addEventListener('resize', updateOverlayHeightThree);

// Если контент динамически меняется
const observerOne = new MutationObserver(updateOverlayHeightThree);
observerOne.observe(document.body, { 
  childList: true, 
  subtree: true,
  characterData: true 
});


// JavaScript для модального окна
  document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlayPayError');
    const registerBtn = document.getElementById('paymentBtnPayError');
    const modalClose = document.getElementById('modalClosePayError');

    registerBtn.addEventListener('click', function() {
       modalOverlay.classList.add('active');
                  const modalOverlayFirst = document.getElementById('modalOverlayPayment');
                  modalOverlayFirst.classList.remove('active');
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


function updateOverlayHeightFour() {
  const modalOverlay = document.getElementById('modalOverlayPayError');
  const bodyHeight = document.body.scrollHeight;
  modalOverlay.style.height = bodyHeight + 'px';
}

// Обновлять при загрузке и изменении контента
updateOverlayHeightFour();
window.addEventListener('resize', updateOverlayHeightFour);

// Если контент динамически меняется
const observerPayError = new MutationObserver(updateOverlayHeightFour);
observerPayError.observe(document.body, { 
  childList: true, 
  subtree: true,
  characterData: true 
});



// JavaScript для модального окна
  document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlayPaySuccess');
    const registerBtn = document.getElementById('paymentBtnPaySuccess');
    const modalClose = document.getElementById('modalClosePaySuccess');

    registerBtn.addEventListener('click', function() {
      modalOverlay.classList.add('active');
                  const modalOverlayFirst = document.getElementById('modalOverlayPayment');
                  modalOverlayFirst.classList.remove('active');
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


function updateOverlayHeightFive() {
  const modalOverlay = document.getElementById('modalOverlayPaySuccess');
  const bodyHeight = document.body.scrollHeight;
  modalOverlay.style.height = bodyHeight + 'px';
}

// Обновлять при загрузке и изменении контента
updateOverlayHeightFive();
window.addEventListener('resize', updateOverlayHeightFive);

// Если контент динамически меняется
const observerPaySuccess = new MutationObserver(updateOverlayHeightFive);
observerPayError.observe(document.body, { 
  childList: true, 
  subtree: true,
  characterData: true 
});


document.addEventListener('DOMContentLoaded', function() {
    // Выбираем все кнопки внутри блока .block-month
    const buttons = document.querySelectorAll('.block-month .container-text');

    // Функция для снятия активного состояния со всех кнопок
    function removeActiveClass() {
        buttons.forEach(button => {
            button.classList.remove('active');
        });
    }

    // Добавляем обработчик клика на каждую кнопку
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Снимаем активный класс со всех кнопок
            removeActiveClass();
            // Добавляем активный класс к нажатой кнопке
            this.classList.add('active');
        });
    });
});