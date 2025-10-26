// Функция для обновления прогресс-бара
function updateProgressBar() {
    const progressText = document.getElementById('progress-text'); // Найти <h3> по ID
    if (!progressText) {
        console.error('Элемент с ID "progress-text" не найден!');
        return;
    }

    const text = progressText.textContent.trim(); // Получить текст, например "10000 из 100000"
    const parts = text.split(' из '); // Разделить по " из "

    if (parts.length !== 2) {
        console.error('Неверный формат текста в <h3>. Ожидается "X из Y".');
        return;
    }

    const current = parseFloat(parts[0]); // X (текущее значение)
    const total = parseFloat(parts[1]);   // Y (общее значение)

    if (isNaN(current) || isNaN(total) || total === 0) {
        console.error('Неверные числа в тексте. Убедитесь, что X и Y — числа.');
        return;
    }

    const percentage = (current / total) * 100; // Вычислить процент
    const progressBar = document.querySelector('.profile__progress--bar'); // Найти бар

    if (progressBar) {
        progressBar.style.width = `${Math.min(percentage, 100)}%`; // Установить ширину (не больше 100%)
    } else {
        console.error('Элемент .profile__progress--bar не найден!');
    }
}

// Вызвать функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', updateProgressBar);

// Наблюдатель за изменениями в <h3> (для динамики)
const progressText = document.getElementById('progress-text');
if (progressText) {
    const observer = new MutationObserver(updateProgressBar);
    observer.observe(progressText, { childList: true, subtree: true, characterData: true });
}