// js/index.js
import { getCurrentUser, logout } from './auth.js'; // Імпортуємо з нового файлу

document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    initializeSelects();
    initializeButtons();
});

// Перевірка чи користувач авторизований
function checkAuthentication() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const usernameElement = document.querySelector('.header__username');
    if (usernameElement) {
        usernameElement.textContent = currentUser.username;
    }
    
    const exitButton = document.querySelector('.header__exit');
    if (exitButton) {
        exitButton.textContent = 'Вийти';
        exitButton.onclick = logout; // Використовуємо імпортовану функцію
    }
}

// Ініціалізація селектів
function initializeSelects() {
    document.querySelectorAll('.image-processing__select').forEach(select => {
        const trigger = select.querySelector('.image-processing__select-trigger');
        const text = select.querySelector('.image-processing__select-text');
        const options = select.querySelectorAll('.image-processing__option');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Запобігаємо закриттю від document click
            document.querySelectorAll('.image-processing__select').forEach(s => {
                if (s !== select) s.classList.remove('open');
            });
            select.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                text.textContent = option.textContent;
                select.classList.remove('open');
                console.log('Selected value:', value);
                // TODO: збережи value, якщо потрібно для логіки
            });
        });

        document.addEventListener('click', (e) => {
            if (!select.contains(e.target)) {
                select.classList.remove('open');
            }
        });
    });
}

// Ініціалізація кнопок та інших елементів
function initializeButtons() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    const hideMessageBtn = document.querySelector('.steganography__input-btn');
    const extractMessageBtn = document.querySelector('.steganography__output-btn');
    
    if (hideMessageBtn) {
        hideMessageBtn.addEventListener('click', handleHideMessage);
    }
    
    if (extractMessageBtn) {
        extractMessageBtn.addEventListener('click', handleExtractMessage);
    }
}

// Обробка завантаження файлу (заглушка)
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'image/bmp') {
        console.log('Завантажено BMP файл:', file.name);
        // TODO: Додати логіку обробки BMP файлу
        
        const placeholder = document.querySelector('.image-processing__placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.innerHTML = `<p>Завантажено: ${file.name}</p>`; 
        }
    } else {
        alert('Будь ласка, виберіть файл формату BMP'); 
    }
}

// Обробка приховування повідомлення (заглушка)
function handleHideMessage() {
    const message = document.querySelector('.steganography__input').value;
    if (!message.trim()) {
        alert('Будь ласка, введіть повідомлення для приховування');
        return;
    }
    
    console.log('Приховування повідомлення:', message);
    alert('Функція приховування повідомлення буде реалізована пізніше');
}

// Обробка витягування повідомлення (заглушка)
function handleExtractMessage() {
    console.log('Витягування прихованого повідомлення');
    
    const outputPlaceholder = document.querySelector('.steganography__output-placeholder');
    if (outputPlaceholder) {
        outputPlaceholder.style.display = 'flex';
        outputPlaceholder.style.alignItems = 'center';
        outputPlaceholder.style.justifyContent = 'center';
        outputPlaceholder.innerHTML = '<p>Функція витягування буде реалізована пізніше</p>';
    }
}

// Глобально доступна функція виходу (для onclick в HTML, якщо така є)
window.logout = logout;