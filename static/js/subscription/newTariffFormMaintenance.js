document.addEventListener('DOMContentLoaded', () => {
    const $ = s => document.querySelector(s);
    const $$ = s => Array.from(document.querySelectorAll(s));
    const ls = (k, v) => v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v);

    // элементы
    const titleInput = $('#tariffTitle');
    const descInput = $('#tariffDesc');
    const priceInput = $('#tariffPrice');
    const subscribersInput = $('#maxSubscribers');

    const limitedToggle = $('#limitedSubscribers');
    const discountToggle = $('#discountToggle');
    const discountWrapper = $('#discountSliderWrapper');
    const discountRange = $('#discountRange');

    const trialToggle = $('#trialPeriodToggle');
    const trialWrapper = $('#trialSliderWrapper');
    const trialRange = $('#trialRange');

    // restore/save generic inputs
    const restoreValue = (el, key) => {
        if (!el) return;
        const val = ls(key);
        if (val !== null) el.value = val;
        el.addEventListener('input', () => {
            ls(key, el.value);
        });
    };
    [['tariffTitle', titleInput], ['tariffDesc', descInput], ['tariffPrice', priceInput], ['maxSubscribers', subscribersInput]]
        .forEach(([key, el]) => restoreValue(el, el && key));

    // prevent negative numbers
    $$('input[type="number"]').forEach(num => {
        num.addEventListener('input', () => {
            if (num.value !== '' && Number(num.value) < 1) num.value = 1;
            ls(num.id || num.name, num.value);
        });
        num.addEventListener('wheel', e => e.preventDefault());
    });

    // sliders init (restore + visual + save)
    const initSlider = (rangeEl, fillId, valueId, key, isDays = false) => {
        if (!rangeEl) return;
        const fill = document.getElementById(fillId);
        const value = document.getElementById(valueId);
        const saved = ls(key);
        if (saved !== null) rangeEl.value = saved;

        const update = () => {
            const min = +rangeEl.min, max = +rangeEl.max, val = +rangeEl.value;
            const percent = max > min ? ((val - min) / (max - min)) * 100 : 0;
            if (fill) fill.style.width = `${percent}%`;
            if (value) value.textContent = isDays ? `${val} дней` : `${val}%`;
            ls(key, rangeEl.value);
        };
        rangeEl.addEventListener('input', update);
        update();
    };

    initSlider(discountRange, 'discountFill', 'discountValue', 'discountRange', false);
    initSlider(trialRange, 'trialFill', 'trialValue', 'trialRange', true);

    // --- handle toggles: IMPORTANT: set explicit display values ('block'/'none') ---
    const handleToggle = (toggleEl, targetEl, lsKey, showDisplay = 'block') => {
        if (!toggleEl) return;
        const saved = ls(lsKey) === 'true';
        toggleEl.checked = saved;
        if (targetEl) targetEl.style.display = saved ? showDisplay : 'none';

        toggleEl.addEventListener('change', () => {
            const isOn = toggleEl.checked;
            ls(lsKey, isOn);
            if (targetEl) targetEl.style.display = isOn ? showDisplay : 'none';
        });
    };

    // for number input we can show as block; for wrappers show block as well
    handleToggle(limitedToggle, subscribersInput, 'limitedSubscribers', 'block');
    handleToggle(discountToggle, discountWrapper, 'discountToggle', 'block');
    handleToggle(trialToggle, trialWrapper, 'trialPeriodToggle', 'block');

    // Ensure visibility matches after everything initialized
    const refreshToggles = () => {
        if (limitedToggle && subscribersInput) subscribersInput.style.display = limitedToggle.checked ? 'block' : 'none';
        if (discountToggle && discountWrapper) discountWrapper.style.display = discountToggle.checked ? 'block' : 'none';
        if (trialToggle && trialWrapper) trialWrapper.style.display = trialToggle.checked ? 'block' : 'none';
    };
    refreshToggles();

    // validation: same behavior as before (show on blur if empty, hide when user types)
    const requiredInputs = $$('input[required], textarea[required]');
    requiredInputs.forEach(input => {
        const fieldset = input.closest('fieldset');
        const showError = () => {
            const label = fieldset?.querySelector('label');
            const name = label ? label.textContent.trim() : input.placeholder || 'Поле';
            if (!fieldset.querySelector('.input-error')) {
                const err = document.createElement('div');
                err.className = 'input-error';
                err.textContent = `Поле "${name}" обязательно к заполнению`;
                if (fieldset.classList.contains('tariff__price')) {
                    const content = fieldset.querySelector('.tariff__price-content') || fieldset;
                    content.insertAdjacentElement('afterend', err);
                } else {
                    fieldset.appendChild(err);
                }
                input.classList.add('input--error');
            }
        };
        const hideError = () => {
            fieldset?.querySelector('.input-error')?.remove();
            input.classList.remove('input--error');
        };

        input.addEventListener('blur', () => {
            if (!input.value.trim()) showError();
            else hideError();
        });
        input.addEventListener('input', () => {
            if (input.value.trim()) hideError();
        });
    });

    // ensure price >= 1 at load-time
    if (priceInput && priceInput.value !== '' && Number(priceInput.value) < 1) {
        priceInput.value = 1;
        ls('tariffPrice', priceInput.value);
    }
});
