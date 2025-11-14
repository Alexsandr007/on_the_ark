// JavaScript для модального окна подписок (один тариф)
document.addEventListener('DOMContentLoaded', function () {
    const modalOverlay = document.getElementById('subscriptionModal');
    const subscriptionContent = document.getElementById('subscriptionContent');

    // Функция для поиска подписки по ID
    function findSubscriptionById(subscriptionId) {
        const subscriptionElements = document.querySelectorAll('.subscription-data');

        for (let element of subscriptionElements) {
            if (element.getAttribute('data-id') == subscriptionId) {
                return {
                    id: element.getAttribute('data-id'),
                    name: element.getAttribute('data-name'),
                    description_lines: element.getAttribute('data-description').split('||'),
                    price: element.getAttribute('data-price'),
                    final_price: element.getAttribute('data-final-price'),
                    image_url: element.getAttribute('data-image'),
                    is_discount_active: element.getAttribute('data-has-discount') === 'true',
                    discount_percent: element.getAttribute('data-discount-percent') || '0',
                    has_trial_period: element.getAttribute('data-has-trial') === 'true',
                    trial_days: element.getAttribute('data-trial-days') || '0',
                    is_limited_subscribers: element.getAttribute('data-is-limited') === 'true',
                    max_subscribers: element.getAttribute('data-max-subscribers') || '0'
                };
            }
        }
        return null;
    }

    // Функция для открытия модального окна
    function openSubscriptionModal(subscriptionId) {
        console.log('Открытие модального окна для подписки ID:', subscriptionId);

        const subscription = findSubscriptionById(subscriptionId);

        if (subscription) {
            console.log('Найдена подписка:', subscription);
            fillSubscriptionContent(subscription);
            modalOverlay.style.display = 'flex';
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Подписка не найдена:', subscriptionId);
            showFirstAvailableSubscription();
        }
    }

    // Функция для показа первой доступной подписки (как fallback)
    function showFirstAvailableSubscription() {
        const subscriptionElements = document.querySelectorAll('.subscription-data');
        if (subscriptionElements.length > 0) {
            const firstSubscription = findSubscriptionById(subscriptionElements[0].getAttribute('data-id'));
            if (firstSubscription) {
                fillSubscriptionContent(firstSubscription);
                modalOverlay.style.display = 'flex';
                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        } else {
            alert('Нет доступных подписок');
        }
    }

    // Функция для заполнения контента модального окна
    // Функция для заполнения контента модального окна
    function fillSubscriptionContent(subscription) {
        console.log('Discount data:', {
            is_discount_active: subscription.is_discount_active,
            discount_percent: subscription.discount_percent,
            discount_percent_as_number: parseInt(subscription.discount_percent),
            is_greater_than_zero: parseInt(subscription.discount_percent) > 0
        });
        const costBefore = subscription.is_discount_active ?
            `<p class="cost-before">${subscription.price} ₽</p>` : '';

        // Создаем список преимуществ как в Django шаблоне
        let benefitsHTML = '';
        
        // Основное описание (разбиваем по строкам)
        if (subscription.description_lines && subscription.description_lines.length > 0) {
            subscription.description_lines.forEach(line => {
                if (line.trim()) {
                    benefitsHTML += `<li>${line}</li>`;
                }
            });
        }
        
        // Добавляем дополнительные преимущества только если они есть
        // Пробный период
        if (subscription.has_trial_period && parseInt(subscription.trial_days) > 0) {
            benefitsHTML += `<li>Пробный период: ${subscription.trial_days} дней</li>`;
        }
        
        
        // Скидка (добавляем только если есть активная скидка)
        if (subscription.is_discount_active && parseInt(subscription.discount_percent) > 0) {
            benefitsHTML += `<li>Скидка: ${subscription.discount_percent}%</li>`;
        }

        subscriptionContent.innerHTML = `
            <div class="block-course block-course-one">
                <button class="modal-close subscription-modal-close"></button>
                <div class="slider-content">
                    <h2>${subscription.name}</h2>
                    <div class="block-flex-one">
                        <ul class="red-dots-list">
                            ${benefitsHTML}
                        </ul>
                        <div class="information-cost">
                            <img src="${subscription.image_url}" alt="${subscription.name}">
                            ${costBefore}
                            <p class="cost-after">от <span>${subscription.final_price} ₽</span>/месяц</p>
                        </div>
                    </div>
                
                    <button class="profile__btn payment-method-btn subscribe-btn" 
                            data-subscription-id="${subscription.id}"
                            data-subscription-name="${subscription.name}"
                            data-price="${subscription.final_price}">
                        Стать ${subscription.name}
                    </button>
                </div>
            </div>
        `;

        // Добавляем обработчик для кнопки закрытия
        const closeBtn = subscriptionContent.querySelector('.subscription-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSubscriptionModal);
        }

        // Добавляем обработчик для кнопки подписки
        const subscribeBtn = subscriptionContent.querySelector('.subscribe-btn');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                processPayment(
                    this.getAttribute('data-subscription-id'),
                    this.getAttribute('data-subscription-name'),
                    this.getAttribute('data-price')
                );
            });
        }
    }

    // Функция для закрытия модального окна
    function closeSubscriptionModal() {
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Закрытие модального окна по клику на фон (оверлей)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function (event) {
            if (event.target === modalOverlay) {
                closeSubscriptionModal();
            }
        });
    }

    // Закрытие модального окна по клавише Escape
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modalOverlay && modalOverlay.style.display === 'flex') {
            closeSubscriptionModal();
        }
    });

    // Обработчики для кнопок "Подписаться" в постах
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('open-subscription-modal') ||
            event.target.closest('.open-subscription-modal')) {
            event.preventDefault();
            event.stopPropagation();

            const button = event.target.classList.contains('open-subscription-modal') ?
                event.target : event.target.closest('.open-subscription-modal');

            const subscriptionId = button.getAttribute('data-subscription-id');
            console.log('Клик по кнопке подписки, ID:', subscriptionId);

            if (subscriptionId) {
                openSubscriptionModal(subscriptionId);
            } else {
                console.error('Не указан ID подписки');
                showFirstAvailableSubscription();
            }
        }
    });

    // Функция для обработки оплаты
    function processPayment(subscriptionId, subscriptionName, price) {
        alert(`Переход к оплате подписки "${subscriptionName}" за ${price}₽`);

        // Здесь можно добавить интеграцию с платежной системой
    }

    console.log('Инициализировано модальное окно подписок');
    console.log('Доступно подписок:', document.querySelectorAll('.subscription-data').length);
});