document.querySelectorAll('.image-processing__select').forEach(select => {
    const trigger = select.querySelector('.image-processing__select-trigger');
    const text = select.querySelector('.image-processing__select-text');
    const options = select.querySelectorAll('.image-processing__option');

    // Клік по селекту
    trigger.addEventListener('click', () => {
        document.querySelectorAll('.image-processing__select').forEach(s => {
            if (s !== select) s.classList.remove('open');
        });
        select.classList.toggle('open');
    });

    // Клік по варіанту
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            text.textContent = option.textContent;
            select.classList.remove('open');
            console.log('Selected value:', value);
            // TODO: збережи value, якщо потрібно для логіки
        });
    });

    // Закриття при кліку поза селектом
    document.addEventListener('click', (e) => {
        if (!select.contains(e.target)) {
            select.classList.remove('open');
        }
    });
});
