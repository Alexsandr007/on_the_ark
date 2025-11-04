document.addEventListener('DOMContentLoaded', function() {
    const tagInput = document.querySelector('#tag_input_display'); 
    const hiddenTagsInput = document.querySelector('#hidden_tags_input'); 
    const tagsContainer = document.querySelector('.article__form--tags');

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    function addTagToContainer(tagText) {
        const tagId = generateUniqueId();
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-element';
        tagElement.dataset.jsTag = tagId;
        tagElement.dataset.tagText = tagText;
        tagElement.textContent = `#${tagText}`;

        const removeButton = document.createElement('button');
        removeButton.className = 'tag-remove-button';
        removeButton.innerHTML = '&times;';
        removeButton.style.display = 'none';
        removeButton.dataset.jsTagRemove = tagId;

        tagElement.appendChild(removeButton);
        tagsContainer.appendChild(tagElement);
        
        return tagElement;
    }

    function initializeExistingTags() {
        const currentValue = hiddenTagsInput.value.trim();
        if (currentValue) {
            const tags = currentValue.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            
            tagsContainer.innerHTML = '';
            
            tags.forEach(tagText => {
                const cleanTagText = tagText.startsWith('#') ? tagText.substring(1) : tagText;
                addTagToContainer(cleanTagText);
            });
        }
        
        tagInput.value = '';
    }

    function getCurrentTags() {
        const tagElements = document.querySelectorAll('.article__form--tags [data-js-tag]');
        return Array.from(tagElements).map(el => el.dataset.tagText);
    }

    function getCurrentTagsCount() {
        return document.querySelectorAll('.article__form--tags [data-js-tag]').length;
    }

    function updateHiddenTagsField() {
        const currentTags = getCurrentTags();
        hiddenTagsInput.value = currentTags.join(', ');
        console.log('Теги обновлены:', hiddenTagsInput.value); 
    }

    function removeTag(tagElement) {
        tagElement.remove();
        updateHiddenTagsField(); 
    }

    initializeExistingTags();

    tagInput.addEventListener('keydown', function(event) {
        if (event.key === ' ' || event.key === ',' || event.key === 'Enter') {
            event.preventDefault();
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
        }
    });

    tagsContainer.addEventListener('mouseover', function(event) {
        const tagElement = event.target.closest('[data-js-tag]');
        if (tagElement) {
            const removeButton = tagElement.querySelector('.tag-remove-button');
            if (removeButton) {
                removeButton.style.display = 'inline-block';
            }
        }
    });

    tagsContainer.addEventListener('mouseout', function(event) {
        const tagElement = event.target.closest('[data-js-tag]');
        if (tagElement) {
            const removeButton = tagElement.querySelector('.tag-remove-button');
            if (removeButton) {
                removeButton.style.display = 'none';
            }
        }
    });

    tagsContainer.addEventListener('click', function(event) {
        const removeButton = event.target.closest('.tag-remove-button');
        if (removeButton) {
            event.stopPropagation();
            const tagElement = removeButton.parentElement;
            removeTag(tagElement);
        }
    });

    tagsContainer.addEventListener('click', function(event) {
        const tagElement = event.target.closest('[data-js-tag]');
        if (tagElement && !event.target.closest('.tag-remove-button')) {
            removeTag(tagElement);
        }
    });

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

    document.getElementById('post-form').addEventListener('submit', function() {
        updateHiddenTagsField();
    });
});