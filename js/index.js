// js/login.js
import { getStoredUsers, setStoredUsers, getCurrentUser, setCurrentUser, showError, showSuccess, clearMessages } from './auth.js';

document.addEventListener('DOMContentLoaded', function() { 
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Якщо користувач вже авторизований, перенаправляємо на головну сторінку
        window.location.href = 'main.html';
        return; // Важливо вийти з функції, щоб подальший код не виконувався
    }
    
    initializeAuthForms();
});

// Ініціалізація форм авторизації
function initializeAuthForms() {
    const loginFormElement = document.getElementById('loginFormElement');
    const registerFormElement = document.getElementById('registerFormElement');
    
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', handleLogin);
    }
    
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', handleRegister);
    }
}

// Обробка форми входу
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');

    if (!username || !password) {
        showError('Будь ласка, заповніть всі поля', errorDiv, successDiv);
        return;
    }
    
    try {
        const users = getStoredUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            setCurrentUser({
                username: user.username,
                loginTime: new Date().toISOString()
            });
            
            showSuccess('Успішний вхід! Перенаправлення...', errorDiv, successDiv);
            
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1000);
        } else {
            showError('Неправильний логін або пароль', errorDiv, successDiv);
        }
    } catch (error) {
        console.error('Помилка при вході:', error);
        showError('Виникла помилка при вході в систему', errorDiv, successDiv);
    }
}

// Обробка форми реєстрації
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');

    if (!username || !password || !passwordConfirm) {
        showError('Будь ласка, заповніть всі поля', errorDiv, successDiv);
        return;
    }
    
    if (password !== passwordConfirm) {
        showError('Паролі не співпадають', errorDiv, successDiv);
        return;
    }
    
    if (password.length < 4) {
        showError('Пароль повинен містити щонайменше 4 символи', errorDiv, successDiv);
        return;
    }
    
    try {
        const users = getStoredUsers();
        
        if (users.some(u => u.username === username)) {
            showError('Користувач з таким логіном вже існує', errorDiv, successDiv); 
            return;
        }
        
        const newUser = {
            username: username,
            password: password,
            registrationDate: new Date().toISOString()
        };
        
        users.push(newUser);
        setStoredUsers(users); // Використовуємо експортовану функцію
        
        showSuccess('Реєстрація успішна! Тепер ви можете увійти в систему', errorDiv, successDiv);
        
        setTimeout(() => {
            switchToLogin();
            document.getElementById('loginUsername').value = username; // Заповнюємо поле логіна
        }, 2000);
        
    } catch (error) {
        console.error('Помилка при реєстрації:', error);
        showError('Виникла помилка при реєстрації', errorDiv, successDiv);
    }
}

// Переключення на форму входу
function switchToLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    clearMessages(errorDiv, successDiv);
}

// Переключення на форму реєстрації
function switchToRegister() {
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    clearMessages(errorDiv, successDiv);
}

// Глобально доступні функції (для onclick в HTML)
window.switchToLogin = switchToLogin;
window.switchToRegister = switchToRegister;