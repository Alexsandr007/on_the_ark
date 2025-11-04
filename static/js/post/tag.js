document.addEventListener('DOMContentLoaded', function() {
    const tagInput = document.querySelector('#tag_input_display'); // Видимое поле для ввода
    const hiddenTagsInput = document.querySelector('#hidden_tags_input'); // Скрытое поле для формы
    const tagsContainer = document.querySelector('.article__form--tags');

    // Функция для генерации уникального ID
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Функция для добавления тега в контейнер
    function addTagToContainer(tagText) {
        const tagId = generateUniqueId();
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-element';
        tagElement.dataset.jsTag = tagId;
        tagElement.dataset.tagText = tagText;
        tagElement.textContent = `#${tagText}`;

        // Создаем кнопку удаления
        const removeButton = document.createElement('button');
        removeButton.className = 'tag-remove-button';
        removeButton.innerHTML = '&times;';
        removeButton.style.display = 'none';
        removeButton.dataset.jsTagRemove = tagId;

        tagElement.appendChild(removeButton);
        tagsContainer.appendChild(tagElement);
        
        return tagElement;
    }

    // Функция для инициализации существующих тегов при загрузке страницы
    function initializeExistingTags() {
        const currentValue = hiddenTagsInput.value.trim();
        if (currentValue) {
            const tags = currentValue.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            
            // Очищаем контейнер перед добавлением тегов
            tagsContainer.innerHTML = '';
            
            // Добавляем каждый тег в контейнер
            tags.forEach(tagText => {
                // Убираем решётку, если она есть в начале
                const cleanTagText = tagText.startsWith('#') ? tagText.substring(1) : tagText;
                addTagToContainer(cleanTagText);
            });
        }
        
        // Всегда очищаем видимое поле ввода
        tagInput.value = '';
    }

    // Функция для получения текущих тегов из контейнера
    function getCurrentTags() {
        const tagElements = document.querySelectorAll('.article__form--tags [data-js-tag]');
        return Array.from(tagElements).map(el => el.dataset.tagText);
    }

    // Функция для проверки количества тегов в DOM
    function getCurrentTagsCount() {
        return document.querySelectorAll('.article__form--tags [data-js-tag]').length;
    }

    // Функция для обновления скрытого поля с тегами
    function updateHiddenTagsField() {
        const currentTags = getCurrentTags();
        hiddenTagsInput.value = currentTags.join(', ');
        console.log('Теги обновлены:', hiddenTagsInput.value); // Для отладки
    }

    // Функция для удаления тега
    function removeTag(tagElement) {
        tagElement.remove();
        updateHiddenTagsField(); // Обновляем скрытое поле после удаления
    }

    // Инициализация существующих тегов при загрузке страницы
    initializeExistingTags();

    // Обработчик ввода в поле тегов
    tagInput.addEventListener('keydown', function(event) {
        if (event.key === ' ' || event.key === ',' || event.key === 'Enter') {
            event.preventDefault();
            const tagText = tagInput.value.trim();
            
            if (tagText) {
                // Убираем решётку, если она есть в начале
                const cleanTagText = tagText.startsWith('#') ? tagText.substring(1) : tagText;

                // Проверяем, что тег еще не добавлен и не превышено ограничение по количеству тегов
                const currentTags = getCurrentTags();
                if (!currentTags.includes(cleanTagText) && getCurrentTagsCount() < 6) {
                    addTagToContainer(cleanTagText);
                    updateHiddenTagsField(); // Обновляем скрытое поле
                }
                
                tagInput.value = ''; // Очищаем видимое поле ввода
            }
        }
    });

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

    // Дополнительно: обработчик потери фокуса для добавления тега
    tagInput.addEventListener('blur', function() {
        const tagText = tagInput.value.trim();
        if (tagText) {
            const cleanTagText = tagText.startsWith('#') ? tagText.substring(1) : tagText;
            const currentTags = getCurrentTags();
            
            if (!currentTags.includes(cleanTagText) && getCurrentTagsCount() < 6) {
                addTagToContainer(cleanTagText);
                updateHiddenTagsField();
            }
            
            tagInput.value = '';
        }
    });

    // Синхронизация перед отправкой формы (на всякий случай)
    document.getElementById('post-form').addEventListener('submit', function() {
        updateHiddenTagsField();
    });
});