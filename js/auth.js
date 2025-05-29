// js/auth.js

/**
 * Отримує список зареєстрованих користувачів з localStorage. 
 * @returns {Array} Масив об'єктів користувачів.
 */
export function getStoredUsers() {
    try {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error('Помилка при отриманні користувачів з localStorage:', error); 
        return [];
    }
}

/**
 * Зберігає список користувачів у localStorage.
 * @param {Array} users Масив об'єктів користувачів для збереження.
 */
export function setStoredUsers(users) {
    try {
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.error('Помилка при збереженні користувачів у localStorage:', error);
    }
}

/**
 * Отримує поточного авторизованого користувача з localStorage.
 * @returns {Object|null} Об'єкт поточного користувача або null, якщо не авторизований.
 */
export function getCurrentUser() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
    } catch (error) {
        console.error('Помилка при отриманні поточного користувача з localStorage:', error);
        return null;
    }
}

/**
 * Зберігає поточного авторизованого користувача у localStorage.
 * @param {Object} user Об'єкт користувача, який потрібно зберегти.
 */
export function setCurrentUser(user) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
        console.error('Помилка при збереженні поточного користувача у localStorage:', error);
    }
}

/**
 * Виконує вихід користувача з системи.
 */
export function logout() {
    if (confirm('Ви дійсно хочете вийти з системи?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

/**
 * Показує повідомлення про помилку.
 * @param {string} message Повідомлення для відображення.
 * @param {HTMLElement} errorDiv Елемент DIV для відображення помилки.
 * @param {HTMLElement} successDiv Елемент DIV для відображення успіху.
 */
export function showError(message, errorDiv, successDiv) {
    clearMessages(errorDiv, successDiv);
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');

    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

/**
 * Показує повідомлення про успіх.
 * @param {string} message Повідомлення для відображення.
 * @param {HTMLElement} errorDiv Елемент DIV для відображення помилки.
 * @param {HTMLElement} successDiv Елемент DIV для відображення успіху.
 */
export function showSuccess(message, errorDiv, successDiv) {
    clearMessages(errorDiv, successDiv);
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');

    setTimeout(() => {
        successDiv.classList.add('hidden');
    }, 5000);
}

/**
 * Очищає повідомлення про помилки та успіх.
 * @param {HTMLElement} errorDiv Елемент DIV для відображення помилки.
 * @param {HTMLElement} successDiv Елемент DIV для відображення успіху.
 */
export function clearMessages(errorDiv, successDiv) {
    if (errorDiv) errorDiv.classList.add('hidden');
    if (successDiv) successDiv.classList.add('hidden');
}