// Получаем элементы
const burgerButton = document.getElementById('header-nav-profile-picture'); // кнопка, открывающая меню
const sidebar = document.getElementById('sidebar'); // само боковое меню
const overlay = document.getElementById('sidebar__overlay');

// --- Открытие / закрытие меню ---
function toggleSidebar(event) {
    event.stopPropagation(); // чтобы клик не всплыл
    const isActive = sidebar.classList.toggle('_active');
    overlay.classList.toggle('_active', isActive);
}

// --- Закрытие при клике вне меню ---
function handleOutsideClick(event) {
    const clickedInsideSidebar = sidebar.contains(event.target);
    const clickedOnBurger = burgerButton.contains(event.target);

    if (!clickedInsideSidebar && !clickedOnBurger) {
        closeSidebar();
    }
}

// --- Функция для закрытия меню ---
function closeSidebar() {
    sidebar.classList.remove('_active');
    overlay.classList.remove('_active');
}

// --- Обработчики ---
burgerButton.addEventListener('click', toggleSidebar);
document.addEventListener('click', handleOutsideClick);
overlay.addEventListener('click', closeSidebar); // клик по фону — закрыть
