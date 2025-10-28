document.addEventListener('DOMContentLoaded', function() {
    const tagInput = document.querySelector('.article__form--tag');
    const tagsContainer = document.querySelector('.article__form--tags');

    // Функция для генерации уникального ID
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Функция для добавления тега в контейнер
    function addTagToContainer(tagText) {
        const tagId = generateUniqueId();
        const tagElement = document.createElement('div');
        tagElement.dataset.jsTag = tagId;
        tagElement.dataset.tagText = tagText;  // ===== НОВОЕ: Храним чистый текст в data-атрибуте =====
        tagElement.textContent = `#${tagText}`;

        // Создаем кнопку удаления
        const removeButton = document.createElement('button');
        removeButton.className = 'tag-remove-button';
        removeButton.innerHTML = '&times;';
        removeButton.style.display = 'none';
        removeButton.dataset.jsTagRemove = tagId;

        tagElement.appendChild(removeButton);
        tagsContainer.appendChild(tagElement);
    }

    // Функция для добавления тега в поле ввода
    function addTagToInput(tagText) {
        let currentValue = tagInput.value.trim();
        let tags = currentValue ? currentValue.split(',').map(tag => tag.trim()) : [];

        // Проверяем, что тег еще не добавлен
        if (!tags.includes(tagText)) {
            tags.push(tagText);
            // Ограничиваем количество тегов до 6
            if (tags.length > 6) {
                tags = tags.slice(0, 6);
            }
            tagInput.value = tags.join(', ');
        }
    }

    // Массив для хранения тегов
    let tags = [];

    // Функция для проверки количества тегов в DOM
    function getCurrentTagsCount() {
        return document.querySelectorAll('.article__form--tags [data-js-tag]').length;
    }

    // Обработчик ввода в поле тегов
    tagInput.addEventListener('keydown', function(event) {
        if (event.key === ' ' || event.key === ',') {
            event.preventDefault();
            const tagText = tagInput.value.trim();
            if (tagText) {
                // Убираем решётку, если она есть в начале
                const cleanTagText = tagText.startsWith('#') ? tagText.substring(1) : tagText;

                // Проверяем, что тег еще не добавлен и не превышено ограничение по количеству тегов
                if (!tags.includes(cleanTagText) && getCurrentTagsCount() < 6) {
                    tags.push(cleanTagText);

                    const tagId = generateUniqueId();
                    const tagElement = document.createElement('div');
                    tagElement.dataset.jsTag = tagId;
                    tagElement.dataset.tagText = cleanTagText;  // ===== НОВОЕ =====
                    tagElement.textContent = `#${cleanTagText}`;

                    // Создаем кнопку удаления
                    const removeButton = document.createElement('button');
                    removeButton.className = 'tag-remove-button';
                    removeButton.innerHTML = '&times;';
                    removeButton.style.display = 'none';
                    removeButton.dataset.jsTagRemove = tagId;

                    tagElement.appendChild(removeButton);
                    tagsContainer.appendChild(tagElement);
                }
                tagInput.value = '';
            }
        }
    });

    // Функция для удаления тега
    function removeTag(tagElement) {
        const tagText = tagElement.dataset.tagText;  // ===== ИЗМЕНЕНО: Используем data-атрибут =====
        const tagIndex = tags.indexOf(tagText);
        if (tagIndex !== -1) {
            tags.splice(tagIndex, 1);
            // Обновляем значение в поле ввода
            tagInput.value = tags.join(', ');
        }
        tagElement.remove();
    }

    // Обработчик наведения на тег
    tagsContainer.addEventListener('mouseover', function(event) {
        const tagElement = event.target.closest('[data-js-tag]');
        if (tagElement) {
            const removeButton = tagElement.querySelector('.tag-remove-button');
            if (removeButton) {
                removeButton.style.display = 'inline-block';
            }
        }
    });

    // Обработчик ухода курсора с тега
    tagsContainer.addEventListener('mouseout', function(event) {
        const tagElement = event.target.closest('[data-js-tag]');
        if (tagElement) {
            const removeButton = tagElement.querySelector('.tag-remove-button');
            if (removeButton) {
                removeButton.style.display = 'none';
            }
        }
    });

    // Обработчик клика на кнопку удаления
    tagsContainer.addEventListener('click', function(event) {
        const removeButton = event.target.closest('.tag-remove-button');
        if (removeButton) {
            event.stopPropagation();
            const tagElement = removeButton.parentElement;
            removeTag(tagElement);
        }
    });

    // Обработчик клика на теги (для мобильных устройств)
    tagsContainer.addEventListener('click', function(event) {
        const tagElement = event.target.closest('[data-js-tag]');
        if (tagElement && !event.target.closest('.tag-remove-button')) {
            removeTag(tagElement);
        }
    });

    // ===== Синхронизация тегов перед отправкой формы =====
    document.getElementById('post-form').addEventListener('submit', function() {
        const tagElements = document.querySelectorAll('.article__form--tags [data-js-tag]');
        const currentTags = Array.from(tagElements).map(el => el.dataset.tagText);  // ===== ИЗМЕНЕНО: Используем data-атрибут =====
        tagInput.value = currentTags.join(', ');  // Обновляем поле перед отправкой
    });
});