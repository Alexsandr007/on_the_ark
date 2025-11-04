(() => {
    const items = document.querySelectorAll('.article__footer--item');
    if (items.length < 2) return;

    const adItem = items[0];
    const scheduleItem = items[1];
    const adCheckbox = adItem.querySelector('.switch__input');
    const scheduleCheckbox = scheduleItem.querySelector('.switch__input');
    const selectedDateInput = document.getElementById('selectedDate');

    // контейнеры делаем position:relative
    [adItem, scheduleItem].forEach(el => {
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    });

    // ===== util для поповера
    function getOrCreatePopover(container, key) {
      let pop = container.querySelector(`.af-popover[data-key="${key}"]`);
      if (!pop) {
        pop = document.createElement('div');
        pop.className = 'af-popover';
        pop.dataset.key = key;
        container.appendChild(pop);
      }
      return pop;
    }
    function removePopover(container, key) {
      const pop = container.querySelector(`.af-popover[data-key="${key}"]`);
      if (pop) pop.remove();
    }

    // ===== Рекламный пост: простой блок
    function handleAdToggle() {
      if (adCheckbox.checked) {
        const pop = getOrCreatePopover(adItem, 'ad');
        pop.innerHTML = `
        <div class="af-popover__wrapper">
          <textarea name="" id="" placeholder="О рекламодателе" class="af-popover__textearea"></textarea>
          <p class="af-popover__text">До 150 символов ( осталось 150 )</p>
        </div>
        `; // замени на свой HTML/текст
      } else {
        removePopover(adItem, 'ad');
      }
    }

    // ===== Datetime picker
    function makeDatePicker({ initial, onApply }) {
      const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      const dows = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

      let current = new Date(initial);
      let selected = new Date(initial);

      const wrap = document.createElement('div');
      wrap.className = 'dp';

      // Добавляем стили для полоски под dp__head
      const style = document.createElement('style');
      style.textContent = `
        .dp__head {
          position: relative;
        }
        .dp__head::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          background-color: #000000;
          transform: translateY(100%);
        }
      `;
      document.head.appendChild(style);

      // head
      const head = document.createElement('div');
      head.className = 'dp__head';
      const title = document.createElement('div');
      const nav = document.createElement('div'); nav.className = 'dp__nav';
      const prev = document.createElement('button'); prev.className = 'dp__btn'; prev.innerHTML = '‹';
      const next = document.createElement('button'); next.className = 'dp__btn'; next.innerHTML = '›';
      nav.append(prev, next);
      head.append(title, nav);

      // grid
      const grid = document.createElement('div'); grid.className = 'dp__grid';
      dows.forEach(dw => { const el = document.createElement('div'); el.className = 'dp__dow'; el.textContent = dw; grid.appendChild(el); });

      function render() {
        title.textContent = `${months[current.getMonth()]} ${current.getFullYear()}`;
        // очистить старые дни
        grid.querySelectorAll('.dp__day').forEach(n => n.remove());

        const start = new Date(current.getFullYear(), current.getMonth(), 1);
        const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        // в JS неделя начинается с воскресенья; нам нужна ПН=0..ВС=6
        const startOffset = (start.getDay() + 6) % 7;
        const daysInMonth = end.getDate();

        // предшествующие «мутные» дни
        for (let i = 0; i < startOffset; i++) {
          const d = new Date(start); d.setDate(start.getDate() - (startOffset - i));
          grid.appendChild(dayCell(d, true));
        }
        // текущий месяц
        for (let i = 1; i <= daysInMonth; i++) {
          const d = new Date(current.getFullYear(), current.getMonth(), i);
          grid.appendChild(dayCell(d, false));
        }
        // добить до кратности 7
        const rest = (grid.children.length % 7);
        if (rest) {
          const need = 7 - rest;
          const last = new Date(end);
          for (let i = 1; i <= need; i++) {
            const d = new Date(last); d.setDate(last.getDate() + i);
            grid.appendChild(dayCell(d, true));
          }
        }
      }

      function isSameDate(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
      function isToday(d) { const t = new Date(); return isSameDate(d, t); }

      function dayCell(date, muted) {
        const btn = document.createElement('div');
        btn.className = 'dp__day' + (muted ? ' dp__day--muted' : '');
        btn.textContent = date.getDate();

        if (isToday(date)) btn.classList.add('dp__day--today');
        if (isSameDate(date, selected)) btn.classList.add('dp__day--selected');

      btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selected = new Date(date.getFullYear(), date.getMonth(), date.getDate(), selected.getHours(), selected.getMinutes());
          current = new Date(date.getFullYear(), date.getMonth(), 1);
          render();
        });
        return btn;
      }

      prev.addEventListener('click', (e) => { e.stopPropagation(); current.setMonth(current.getMonth() - 1); render(); });
      next.addEventListener('click', (e) => { e.stopPropagation(); current.setMonth(current.getMonth() + 1); render(); });

      // footer (часы/минуты + применить)
      const footer = document.createElement('div'); footer.className = 'dp__footer';
      footer.style.position = 'relative';
      const hh = document.createElement('select'); hh.className = 'dp__select';
      const colon = document.createElement('span');
      colon.textContent = ':';
      colon.style.margin = '0 10px';
      colon.style.position = 'absolute';
      colon.style.top = '12%';
      colon.style.left = '46%';
      const mm = document.createElement('select'); mm.className = 'dp__select';

      for (let h = 0; h < 24; h++) {
        const o = document.createElement('option'); o.value = o.textContent = String(h).padStart(2, '0'); hh.appendChild(o);
      }
      for (let m = 0; m < 60; m += 5) {
        const o = document.createElement('option'); o.value = o.textContent = String(m).padStart(2, '0'); mm.appendChild(o);
      }
      hh.value = String(selected.getHours()).padStart(2, '0');
      mm.value = String(Math.round(selected.getMinutes() / 5) * 5 % 60).padStart(2, '0');

      hh.addEventListener('change', (e) => { e.stopPropagation(); selected.setHours(+hh.value); });
      mm.addEventListener('change', (e) => { e.stopPropagation(); selected.setMinutes(+mm.value); });

      const apply = document.createElement('button'); apply.className = 'dp__apply'; apply.textContent = 'Применить';
      apply.addEventListener('click', (e) => {
        e.stopPropagation();
        onApply(new Date(selected));
        removePopover(scheduleItem, 'schedule');
      });

      footer.append(hh, colon, mm, apply);

      wrap.append(head, grid, footer);
      render();
      return wrap;
    }

    function handleScheduleToggle() {
      if (scheduleCheckbox.checked) {
        const pop = getOrCreatePopover(scheduleItem, 'schedule');
        // Проверяем ширину экрана
        if (window.innerWidth <= 1140) {
          // Добавляем стили для контейнера календаря
          pop.style.cssText = 'position: absolute; left: 100%;';
          // Используем стандартный input type="datetime-local" для мобильных устройств
          const dateInput = document.createElement('input');
          dateInput.type = 'datetime-local';
          dateInput.className = 'standard-datetime-picker';
          dateInput.value = new Date().toISOString().slice(0, 16);
      dateInput.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value);
            selectedDateInput.value = selectedDate.toISOString();
            console.log('Scheduled for:', selectedDate.toISOString());
          });
          pop.appendChild(dateInput);
        } else {
          // Используем кастомный календарь для десктопов
          if (!pop.firstChild) {
            const now = new Date();
            const dp = makeDatePicker({
              initial: now,
      onApply: (date) => {
                selectedDateInput.value = date.toISOString();
                console.log('Scheduled for:', date.toISOString());
              }
            });
            pop.appendChild(dp);
          }
        }
      } else {
        removePopover(scheduleItem, 'schedule');
      }
    }

    // подписки + init
    adCheckbox.addEventListener('change', handleAdToggle);
    scheduleCheckbox.addEventListener('change', handleScheduleToggle);
    handleAdToggle();
    handleScheduleToggle();

    function initMediaPreview() {
        const mediaPreview = document.getElementById('media-preview');
        const fileInput = document.getElementById('file_input');
        const mediaTypeInput = document.getElementById('media_type');
        const pollQuestionInput = document.getElementById('poll_question');
        const pollOptionsInput = document.getElementById('poll_options');

        function toggleMediaPreview() {
            const mediaPreview = document.getElementById('media-preview');
            if (mediaPreview.children.length === 0) {
                mediaPreview.style.display = 'none';
            } else {
                mediaPreview.style.display = 'flex';
            }
        }

        // Функция для создания превью изображения
        function createImagePreview(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item preview-image';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Превью изображения">
                    <button type="button" class="preview-remove">×</button>
                `;
                mediaPreview.innerHTML = '';
                mediaPreview.appendChild(previewItem);
                setupRemoveButton(previewItem);
                toggleMediaPreview(); // Показываем блок
            };
            reader.readAsDataURL(file);
        }

        function createVideoPreview(file) {
            const url = URL.createObjectURL(file);
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item preview-video';
            previewItem.innerHTML = `
                <video controls>
                    <source src="${url}" type="${file.type}">
                    Ваш браузер не поддерживает видео.
                </video>
                <button type="button" class="preview-remove">×</button>
            `;
            mediaPreview.innerHTML = '';
            mediaPreview.appendChild(previewItem);
            setupRemoveButton(previewItem);
            toggleMediaPreview(); // Показываем блок
        }

        function createAudioPreview(file) {
            const url = URL.createObjectURL(file);
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item preview-audio';
            previewItem.innerHTML = `
                <audio controls>
                    <source src="${url}" type="${file.type}">
                    Ваш браузер не поддерживает аудио.
                </audio>
                <button type="button" class="preview-remove">×</button>
            `;
            mediaPreview.innerHTML = '';
            mediaPreview.appendChild(previewItem);
            setupRemoveButton(previewItem);
            toggleMediaPreview(); // Показываем блок
        }

        function createPollPreview() {
            const question = pollQuestionInput.value.trim();
            const options = pollOptionsInput.value.split(',').map(opt => opt.trim()).filter(opt => opt);
            
            if (question && options.length > 0) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item preview-poll';
                
                let optionsHtml = '';
                options.forEach(option => {
                    optionsHtml += `<li>${option}</li>`;
                });
                
                previewItem.innerHTML = `
                    <h4>${question}</h4>
                    <ul>${optionsHtml}</ul>
                    <button type="button" class="preview-remove">×</button>
                `;
                
                mediaPreview.innerHTML = '';
                mediaPreview.appendChild(previewItem);
                setupRemoveButton(previewItem);
                toggleMediaPreview(); // Показываем блок
            }
        }

        // Функция для настройки кнопки удаления
        function setupRemoveButton(previewItem) {
            const removeBtn = previewItem.querySelector('.preview-remove');
            removeBtn.addEventListener('click', function() {
                previewItem.remove();
                toggleMediaPreview(); // Проверяем нужно ли скрыть блок
                
                fileInput.value = '';
                mediaTypeInput.value = '';
                pollQuestionInput.value = '';
                pollOptionsInput.value = '';
                pollQuestionInput.style.display = 'none';
                pollOptionsInput.style.display = 'none';
            });
        }



        // Обработчики для кнопок загрузки медиа
        document.getElementById('photo-upload').addEventListener('click', function() {
            mediaTypeInput.value = 'photo';
            fileInput.accept = 'image/*';
            fileInput.click();
        });

        document.getElementById('video-upload').addEventListener('click', function() {
            mediaTypeInput.value = 'video';
            fileInput.accept = 'video/*';
            fileInput.click();
        });

        document.getElementById('audio-upload').addEventListener('click', function() {
            mediaTypeInput.value = 'audio';
            fileInput.accept = 'audio/*';
            fileInput.click();
        });

        document.getElementById('poll-create').addEventListener('click', function() {
            pollQuestionInput.style.display = 'block';
            pollOptionsInput.style.display = 'block';
            
            // Показываем превью голосования при вводе
            pollQuestionInput.addEventListener('input', createPollPreview);
            pollOptionsInput.addEventListener('input', createPollPreview);
            
            // Сразу создаем превью если есть данные
            if (pollQuestionInput.value || pollOptionsInput.value) {
                createPollPreview();
            }
        });

        // Обработчик выбора файла
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            const mediaType = mediaTypeInput.value;
            
            if (file) {
                switch(mediaType) {
                    case 'photo':
                        createImagePreview(file);
                        break;
                    case 'video':
                        createVideoPreview(file);
                        break;
                    case 'audio':
                        createAudioPreview(file);
                        break;
                }
            }
        });

        // Обработчики для удаления существующих медиа при редактировании
        document.querySelectorAll('.preview-remove[data-media-id]').forEach(btn => {
            btn.addEventListener('click', function() {
                const mediaId = this.getAttribute('data-media-id');
                if (confirm('Удалить медиафайл?')) {
                    this.closest('.preview-item').remove();
                    toggleMediaPreview(); // Проверяем нужно ли скрыть блок
                    
                    // Добавьте скрытое поле для отметки об удалении
                    const deleteInput = document.createElement('input');
                    deleteInput.type = 'hidden';
                    deleteInput.name = 'delete_media';
                    deleteInput.value = mediaId;
                    document.getElementById('post-form').appendChild(deleteInput);
                }
            });
        });

        // Обработчики для удаления существующего голосования при редактировании
        document.querySelectorAll('.preview-remove[data-poll-id]').forEach(btn => {
            btn.addEventListener('click', function() {
                const pollId = this.getAttribute('data-poll-id');
                if (confirm('Удалить голосование?')) {
                    this.closest('.preview-item').remove();
                    toggleMediaPreview(); // Проверяем нужно ли скрыть блок
                    
                    // Добавьте скрытое поле для отметки об удалении
                    const deleteInput = document.createElement('input');
                    deleteInput.type = 'hidden';
                    deleteInput.name = 'delete_poll';
                    deleteInput.value = pollId;
                    document.getElementById('post-form').appendChild(deleteInput);
                }
            });
        });
    }

    // Инициализируем медиа превью после загрузки DOM
    if (document.getElementById('media-preview')) {
        initMediaPreview();
    }

    // закрытие поповеров при клике вне
    document.addEventListener('click', (e) => {
        const pop = scheduleItem.querySelector('.af-popover[data-key="schedule"]');
        if (pop && !scheduleItem.contains(e.target)) {
            removePopover(scheduleItem, 'schedule');
            scheduleCheckbox.checked = true;
        }

        const adPop = adItem.querySelector('.af-popover[data-key="ad"]');
        if (adPop && !adItem.contains(e.target)) removePopover(adItem, 'ad');
    });
})();
