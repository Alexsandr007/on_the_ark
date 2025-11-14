// Добавьте этот код в ваш extra_scripts блок или в отдельный файл
document.addEventListener('DOMContentLoaded', function() {
    const filterButton = document.getElementById('filter__button');
    const filterSelect = document.getElementById('filter__select');
    const filterCheckboxes = document.querySelectorAll('.filter__option-checkbox');
    const postsContainer = document.querySelector('.profile__articles--container');
    let posts = Array.from(document.querySelectorAll('.profile__articles--item'));

    // Показ/скрытие фильтра
    if (filterButton && filterSelect) {
        filterButton.addEventListener('click', function(e) {
            e.stopPropagation();
            filterSelect.classList.toggle('_hidden');
        });

        // Закрытие фильтра при клике вне его
        document.addEventListener('click', function() {
            filterSelect.classList.add('_hidden');
        });

        filterSelect.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Обработка изменений в фильтрах
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    function applyFilters() {
        const activeFilters = getActiveFilters();
        filterPosts(activeFilters);
    }

    function getActiveFilters() {
        const filters = {};
        filterCheckboxes.forEach(checkbox => {
            filters[checkbox.name] = checkbox.checked;
        });
        return filters;
    }

    function filterPosts(filters) {
        let filteredPosts = [...posts]; // Создаем копию массива постов

        // Фильтр "Новые авторы" (авторы, зарегистрировавшиеся за последние 7 дней)
        if (filters['new-authors']) {
            filteredPosts = filterNewAuthors(filteredPosts);
        }

        // Фильтр "Мои подписки"
        if (filters['my-subscriptions']) {
            filteredPosts = filterMySubscriptions(filteredPosts);
        }

        // Фильтр "Только купленные" (платный контент)
        if (filters['paid']) {
            filteredPosts = filterPaidContent(filteredPosts);
        }

        // Фильтр "Бесплатный контент"
        if (filters['free']) {
            filteredPosts = filterFreeContent(filteredPosts);
        }

        // Сортировка по "Свежие посты"
        if (filters['new-posts']) {
            sortPostsByDate(filteredPosts);
        }

        // Показываем/скрываем посты
        showFilteredPosts(filteredPosts);

        // Если нет активных фильтров, показываем все посты
        if (!Object.values(filters).some(val => val)) {
            showAllPosts();
        }
    }

    // Функция для фильтра "Новые авторы"
    function filterNewAuthors(postsArray) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // 7 дней назад
        
        console.log('Фильтр "Новые авторы": показываем авторов после', oneWeekAgo);

        return postsArray.filter(post => {
            const authorJoinedDate = post.getAttribute('data-author-joined');
            if (!authorJoinedDate) return false;

            const joinedDate = new Date(authorJoinedDate);
            const isNewAuthor = joinedDate > oneWeekAgo;
            
            console.log('Автор:', post.querySelector('.author-name').textContent, 
                       'Дата регистрации:', joinedDate, 
                       'Новый автор:', isNewAuthor);
            
            return isNewAuthor;
        });
    }

    // Функция для фильтра "Мои подписки"
    function filterMySubscriptions(postsArray) {
        return postsArray.filter(post => {
            const isAccessible = post.getAttribute('data-is-accessible') === 'true';
            const hasSubscription = post.getAttribute('data-has-subscription') === 'true';
            return isAccessible && hasSubscription;
        });
    }

    // Функция для фильтра "Только купленные"
    function filterPaidContent(postsArray) {
        return postsArray.filter(post => {
            const hasSubscription = post.getAttribute('data-has-subscription') === 'true';
            const isAccessible = post.getAttribute('data-is-accessible') === 'true';
            return hasSubscription && isAccessible;
        });
    }

    // Функция для фильтра "Бесплатный контент"
    function filterFreeContent(postsArray) {
        return postsArray.filter(post => {
            const hasSubscription = post.getAttribute('data-has-subscription') === 'false';
            return hasSubscription;
        });
    }

    // Функция для сортировки по дате публикации
    function sortPostsByDate(postsArray) {
        postsArray.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-published-date'));
            const dateB = new Date(b.getAttribute('data-published-date'));
            return dateB - dateA; // Сначала новые
        });

        // Переставляем посты в DOM
        postsArray.forEach(post => {
            postsContainer.appendChild(post);
        });
    }

    // Показать отфильтрованные посты
    function showFilteredPosts(filteredPosts) {
        // Сначала скрываем все посты
        posts.forEach(post => {
            post.style.display = 'none';
        });

        // Показываем только отфильтрованные
        filteredPosts.forEach(post => {
            post.style.display = 'block';
        });

        console.log('Показано постов:', filteredPosts.length);
    }

    // Показать все посты
    function showAllPosts() {
        posts.forEach(post => {
            post.style.display = 'block';
        });
    }

    // Инициализация при загрузке страницы
    function initializeFilters() {
        console.log('Инициализация фильтров. Всего постов:', posts.length);
        
        // Логируем информацию о авторах для отладки
        posts.forEach((post, index) => {
            const authorName = post.querySelector('.author-name').textContent;
            const authorJoined = post.getAttribute('data-author-joined');
            const joinedDate = authorJoined ? new Date(authorJoined) : 'Нет данных';
            
            console.log(`Пост ${index + 1}: Автор "${authorName}", зарегистрирован:`, joinedDate);
        });
    }

    // Запускаем инициализацию
    initializeFilters();
});