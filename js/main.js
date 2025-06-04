// js/index.js
import { getCurrentUser, logout } from "./auth.js";

// Глобальні змінні
const currentUserGlobal = getCurrentUser();
const state = {
  bmpBlob: null,
  bmpHeader: null,
  bmpData: null,
  fileName: "",
  colorMethod: "blue-green",
  imageMethod: "quadrant"
};

// Головна ініціалізація
document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) return;
  initSelects();
  initEventListeners();
});

// Перевірка авторизації
function checkAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return false;
  }

  const usernameEl = document.querySelector(".header__username");
  const exitBtn = document.querySelector(".header__exit");

  if (usernameEl) usernameEl.textContent = user.username;
  if (exitBtn) {
    exitBtn.textContent = "Вийти";
    exitBtn.onclick = logout;
  }

  const history = loadUserHistory(currentUserGlobal.username);
  if (history) {
    renderHistory(history);
    restoreLastUsedOptions(currentUserGlobal.username);
  }

  return true;
}

// Ініціалізація селектів
function initSelects() {
  document.querySelectorAll(".image-processing__select").forEach(select => {
    const trigger = select.querySelector(".image-processing__select-trigger");
    const text = select.querySelector(".image-processing__select-text");
    const options = select.querySelectorAll(".image-processing__option");

    trigger.onclick = e => {
      e.stopPropagation();
      document.querySelectorAll(".image-processing__select").forEach(s => {
        if (s !== select) s.classList.remove("open");
      });
      select.classList.toggle("open");
    };

    options.forEach(option => {
      option.onclick = () => {
        const value = option.dataset.value;
        text.textContent = option.textContent;
        select.classList.remove("open");

        if (["blue-green", "red-blue", "green-red"].includes(value)) {
          state.colorMethod = value;
          saveToHistory(currentUserGlobal.username, 'lastChosenColors', value);
        } else if (["quadrant", "grid", "circle"].includes(value)) {
          state.imageMethod = value;
          saveToHistory(currentUserGlobal.username, 'lastChosenMethods', value)
        }
      };
    });
  });

  document.onclick = e => {
    document.querySelectorAll(".image-processing__select").forEach(select => {
      if (!select.contains(e.target)) select.classList.remove("open");
    });
  };
}

// Встановлення вибраного по selectElement селекта
function setSelectByValue(selectElement, value) {
  const text = selectElement.querySelector(".image-processing__select-text");
  const options = selectElement.querySelectorAll(".image-processing__option");

  options.forEach(option => {
    if (option.dataset.value === value) {
      text.textContent = option.textContent;
      if (["blue-green", "red-blue", "green-red"].includes(value)) {
        state.colorMethod = value;
      } else if (["quadrant", "grid", "circle"].includes(value)) {
        state.imageMethod = value;
      }
    }
  });
}

// Відновлення останніх вибраних селектів
function restoreLastUsedOptions(username) {
  const lastColors = loadUserHistoryByKey(username, "lastChosenColors") || [];
  const lastMethods = loadUserHistoryByKey(username, "lastChosenMethods") || [];
  const lastFiles = loadUserHistoryByKey(username, "bmpFiles") || [];

  const lastColor = lastColors[0] || null;
  const lastMethod = lastMethods[0] || null;

  const colorSelect = document.querySelector(".image-processing__color-select");
  const methodSelect = document.querySelector(".image-processing__method-select");

  if (lastColor && colorSelect) {
    setSelectByValue(colorSelect, lastColor);
  }

  if (lastMethod && methodSelect) {
    setSelectByValue(methodSelect, lastMethod);
  }

  if (lastMethod || lastColor) {
    alert(`🔁 Відновлено останні налаштування. Перевірте, чи ви обрали той самий файл BMP: ${lastFiles[0]}`);
  }
}


// Ініціалізація обробників подій
function initEventListeners() {
  const fileInput = document.getElementById("fileInput");
  const hideBtn = document.querySelector(".steganography__input-btn");
  const extractBtn = document.querySelector(".steganography__output-btn");
  const createBtn = document.querySelector(".image-processing__process-btn");

  if (fileInput) fileInput.onchange = handleFileUpload;
  if (hideBtn) hideBtn.onclick = handleHideMessage;
  if (extractBtn) extractBtn.onclick = handleExtractMessage;
  if (createBtn) createBtn.onclick = handleCreateImage;
  document.querySelector('.footer__how-to-use').addEventListener('click', () => {
    alert(`Інструкція користувача:
    1. Виберіть BMP-файл (24-бітний) через системний діалог.
    2. Оберіть один із 3 способів побудови нового BMP-файлу.
    3. Оберіть одну з 3 кольорових комбінацій.
    4. Натисніть "Створити", щоб згенерувати новий BMP-файл, який буде базуватись на розмірах вибраного.
    5. Ви можете зберегти новий файл через діалог збереження.

    Додатково:
    - Ви можете вкласти або отримати приховане текстове повідомлення у BMP-файл.
    - Авторизовані користувачі отримують додаткові функції: історію, автоматичне відновлення останніх налаштувань, доступ до попередніх режимів.`);
  });

  document.querySelector('.footer__program-info').addEventListener('click', () => {
    alert(`Про програму:

    Цей застосунок дозволяє:
    - Створювати нові BMP-файли на основі існуючого, використовуючи 3 різні алгоритми генерації кольорів.
    - Вибирати колірні комбінації для побудови зображення.
    - Вшивати короткі повідомлення у BMP-файл (стеганографія).
    - Зчитувати приховані повідомлення з BMP-файлів.

    Також доступна система авторизації, яка забезпечує:
    - Збереження історії назв файлів, режимів та повідомлень. 
    - Відновлення останніх налаштувань після входу.
    - Можливість швидкого перемикання між останніми режимами.`);
  });

  document.querySelector('.footer__authors').addEventListener('click', () => {
    alert(`Автори програми:

    Цей застосунок розроблено в рамках навчального проєкту.

    Команда розробників:
    - Сигіль С. З.
    - Желіховська Т. Ю.
    - Олексюк А. І. 

    `);
  });
}

// Відображення зображення
function displayImage(blob, selector, alt, caption = "") {
  const container = document.querySelector(selector);
  if (!container) return;

  const url = URL.createObjectURL(blob);

  container.style.cssText = "display: flex; align-items: center; justify-content: center;";
  container.innerHTML = `
    <div>
      <img src="${url}" alt="${alt}" style="max-width: 550px; max-height: 400px;" />
    </div>
  `;
}

// Завантаження файлу
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file?.name.toLowerCase().endsWith(".bmp")) {
    alert("Будь ласка, виберіть файл формату BMP");
    return;
  }

  state.fileName = file.name;
  state.bmpBlob = file;

  if (await parseBMP(file)) {
    displayImage(file, ".image-processing__placeholder", "BMP Preview");
    saveToHistory(currentUserGlobal.username, "bmpFiles", state.fileName);
    const history = loadUserHistory(currentUserGlobal.username);
    if (history) {
      renderHistory(history);
    }
  } else {
    alert("Помилка при обробці BMP файлу");
  }
}

// Парсинг BMP
async function parseBMP(blob) {
  try {
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);

    if (view.getUint16(0, true) !== 0x4D42) throw new Error("Не валідний BMP файл");

    state.bmpHeader = {
      fileSize: view.getUint32(2, true),
      dataOffset: view.getUint32(10, true),
      width: view.getUint32(18, true),
      height: view.getUint32(22, true),
      bitsPerPixel: view.getUint16(28, true)
    };

    if (state.bmpHeader.bitsPerPixel !== 24) {
      alert("Підтримуються тільки 24-бітні BMP файли");
      return false;
    }

    state.bmpData = new Uint8Array(buffer.slice(state.bmpHeader.dataOffset));
    return true;
  } catch (error) {
    console.error("Помилка парсингу BMP:", error);
    return false;
  }
}

// Створення зображення
async function handleCreateImage() {
  if (!state.bmpHeader) {
    alert("Спочатку завантажте BMP файл");
    return;
  }

  const imageData = generateImage();
  const blob = await createBMPBlob(imageData);

  displayImage(blob, ".image-processing__placeholder", "Processed BMP", "Оброблене зображення");
  downloadBlob(blob, `generated_${state.fileName}`);
  saveToHistory(currentUserGlobal.username, "modes", [state.imageMethod, state.colorMethod]);
  const history = loadUserHistory(currentUserGlobal.username);
  if (history) {
    renderHistory(history);
  }
}

// Генерація зображення
function generateImage() {
  const { width, height } = state.bmpHeader;
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const data = new Uint8Array(rowSize * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * rowSize + x * 3;
      const colors = getPixelColor(x, y, width, height);

      data[idx] = colors.b;     // BMP uses BGR
      data[idx + 1] = colors.g;
      data[idx + 2] = colors.r;
    }
  }
  return data;
}

// Генерація кольору пікселя
function getPixelColor(x, y, width, height) {
  const nx = x / width, ny = y / height;
  const base = getBaseColors(x, y, width, height, nx, ny);

  const colorMap = {
    "blue-green": { r: 0, g: base.primary, b: base.secondary },
    "red-blue": { r: base.primary, g: 0, b: base.secondary },
    "green-red": { r: base.secondary, g: base.primary, b: 0 }
  };

  const colors = colorMap[state.colorMethod] ||
    { r: (base.primary + base.secondary) / 2, g: (base.primary + base.secondary) / 2, b: (base.primary + base.secondary) / 2 };

  return {
    r: Math.min(255, Math.max(0, Math.floor(colors.r))),
    g: Math.min(255, Math.max(0, Math.floor(colors.g))),
    b: Math.min(255, Math.max(0, Math.floor(colors.b)))
  };
}

// Базові кольори для різних методів
function getBaseColors(x, y, width, height, nx, ny) {
  const methods = {
    quadrant: () => {
      const hw = width / 2, hh = height / 2;
      return {
        primary: Math.floor(((x >= hw) ? (1 - nx) : nx) * 255),
        secondary: Math.floor(((y >= hh) ? (1 - ny) : ny) * 255)
      };
    },
grid: () => {
  const gridSize = Math.max(8, Math.floor(Math.min(width, height) / 16)); // Розмір клітинки сітки
  const lineWidth = Math.max(1, Math.floor(gridSize / 8)); // Товщина ліній сітки
  
  // Перевіряємо, чи знаходимося на лінії сітки (горизонтальній або вертикальній)
  const isOnVerticalLine = (x % gridSize) < lineWidth;
  const isOnHorizontalLine = (y % gridSize) < lineWidth;
  const isOnGridLine = isOnVerticalLine || isOnHorizontalLine;
  
  if (isOnGridLine) {
    // Лінії сітки - темний колір
    return { primary: 50, secondary: 50 };
  } else {
    // Клітинки сітки - світлий градієнт на основі позиції
    const cellX = Math.floor(x / gridSize);
    const cellY = Math.floor(y / gridSize);
    const cellPattern = (cellX + cellY) % 2; // Шахматний патерн для різноманітності
    
    return cellPattern === 0 ?
      { primary: Math.floor(180 + nx * 75), secondary: Math.floor(180 + ny * 75) } : //якщо клітинка парна
      { primary: Math.floor(150 + (1-nx) * 75), secondary: Math.floor(150 + (1-ny) * 75) }; //непарна
  }
},
    circle: () => {
      const cx = width / 2, cy = height / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy);
      const dist = Math.min(1, Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxR);
      return { primary: Math.floor((1 - dist) * 255), secondary: Math.floor(dist * 255) };
    }
  };

  return methods[state.imageMethod]() || { primary: Math.floor(nx * 255), secondary: Math.floor(ny * 255) };
}

// Створення BMP Blob
async function createBMPBlob(imageData) {
  const buffer = await state.bmpBlob.arrayBuffer();
  return new Blob([buffer.slice(0, state.bmpHeader.dataOffset), imageData], { type: "image/bmp" });
}

// Завантаження файлу
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

// Приховування повідомлення
function hideMessage(message, imageData) {
  const msgBytes = new TextEncoder().encode(message);
  const msgWithTerm = new Uint8Array(msgBytes.length + 1);
  msgWithTerm.set(msgBytes);

  if (msgWithTerm.length * 8 > imageData.length) {
    throw new Error(`Повідомлення занадто довге. Потрібно ${msgWithTerm.length * 8} бітів, доступно ${imageData.length}`);
  }

  const result = new Uint8Array(imageData);
  let bitIdx = 0;

  for (let i = 0; i < msgWithTerm.length; i++) {
    for (let bit = 0; bit < 8; bit++) {
      const msgBit = (msgWithTerm[i] >> bit) & 1;
      result[bitIdx] = (result[bitIdx] & 0xfe) | msgBit;
      bitIdx++;
    }
  }
  return result;
}

// Витягування повідомлення
async function extractMessage(blob) {
  try {
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);
    const data = new Uint8Array(buffer.slice(view.getUint32(10, true)));

    const bytes = [];
    let bitIdx = 0;

    while (bitIdx < data.length - 7 && bytes.length < 500) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        byte |= (data[bitIdx] & 1) << bit;
        bitIdx++;
      }
      if (byte === 0) break;
      bytes.push(byte);
    }

    if (bytes.length === 0) return null;

    const nonPrintable = bytes.filter(b => b < 32 && ![9, 10, 13].includes(b)).length;
    if (nonPrintable > bytes.length * 0.3) return null;

    return new TextDecoder().decode(new Uint8Array(bytes)).trim() || null;
  } catch {
    return null;
  }
}

// Обробка приховування
async function handleHideMessage() {
  const message = document.querySelector(".steganography__input").value.trim();
  if (!message) return alert("Введіть повідомлення");
  if (!state.bmpData) return alert("Завантажте BMP файл");

  try {
    const modifiedData = hideMessage(message, state.bmpData);
    const blob = await createBMPBlob(modifiedData);
    downloadBlob(blob, `hidden_message_${state.fileName}`);
    alert("Повідомлення приховано!");
    saveToHistory(currentUserGlobal.username, "embeddedMessages", message);
    const history = loadUserHistory(currentUserGlobal.username);
    if (history) {
      renderHistory(history);
    }
  } catch (error) {
    alert("Помилка: " + error.message);
  }
}

// Обробка витягування
async function handleExtractMessage() {
  if (!state.bmpBlob) return alert("Завантажте BMP файл");

  try {
    const message = await extractMessage(state.bmpBlob);
    const output = document.querySelector(".steganography__output-placeholder");

    if (output) {
      saveToHistory(currentUserGlobal.username, "extractedMessages", message);
      const history = loadUserHistory(currentUserGlobal.username);
      if (history) {
        renderHistory(history);
      }
      output.style.cssText = "display: flex; align-items: left; justify-content: left; padding: 20px;";
      output.innerHTML = message ?
        `<p>${message}</p>` :
        "<p>Приховане повідомлення не знайдено</p>";
    }
  } catch (error) {
    alert("Помилка витягування: " + error.message);
  }
}

// Збереження історії взаємодії з користувачем по ключу key
function saveToHistory(username, key, entry) {
  const raw = localStorage.getItem("userHistories") || "{}";
  const histories = JSON.parse(raw);

  if (!histories[username]) {
    histories[username] = { history: { bmpFiles: [], modes: [], embeddedMessages: [], extractedMessages: [], lastChosenColors: [], lastChosenMethods: [] } };
  }

  const list = histories[username].history[key];

  list.unshift(entry);
  if (list.length > 3) list.pop();

  localStorage.setItem("userHistories", JSON.stringify(histories));
}

// Витягнення повної історії користувача
function loadUserHistory(username) {
  const raw = localStorage.getItem("userHistories") || "{}";
  const histories = JSON.parse(raw);
  return histories[username]?.history || null;
}

// Витягнення історії користувача за ключем key
function loadUserHistoryByKey(username, key) {
  const raw = localStorage.getItem("userHistories") || "{}";
  const histories = JSON.parse(raw);
  return histories[username]?.history[key] || null;
}

// Рендер і накладання onclick функцій до кожного елемента історії
function renderHistory(history) {
  const lastFiles = document.querySelector(".history__last-files");
  const lastPatterns = document.querySelector(".history__last-patterns");
  const lastMessages = document.querySelector(".history__last-messages");

  lastFiles.innerHTML = history.bmpFiles
    .map(name => `<div class="history__entry" data-filename="${name}">${name}</div>`)
    .join("");

  lastPatterns.innerHTML = history.modes
    .map(mode => `<div class="history__entry">${mode}</div>`)
    .join("");

  lastMessages.innerHTML = [
    ...history.embeddedMessages.map(msg => `<div class="history__entry">[Приховане] ${msg}</div>`),
    ...history.extractedMessages.map(msg => `<div class="history__entry">[Витягнуте] ${msg}</div>`)
  ]
    .slice(0, 3)
    .join("");

  lastFiles.querySelectorAll(".history__entry").forEach(entry => {
    entry.addEventListener("click", () => {
      const triggeredFileName = entry.dataset.filename;

      if (state.fileName !== triggeredFileName) {
        alert(`Щоб продовжити, будь ласка, вручну оберіть файл ${triggeredFileName}, який використовувався раніше.`);
      }
    });
  });

  lastPatterns.querySelectorAll(".history__entry").forEach(entry => {
    entry.addEventListener("click", () => {
      const value = entry.textContent.split(',');
      const color = value[1] || null;
      const method = value[0] || null;

      const colorSelect = document.querySelector(".image-processing__color-select");
      const methodSelect = document.querySelector(".image-processing__method-select");

      saveToHistory(currentUserGlobal.username, 'lastChosenColors', color);
      saveToHistory(currentUserGlobal.username, 'lastChosenMethods', method);

      if (color && colorSelect) {
        setSelectByValue(colorSelect, color);
      }

      if (method && methodSelect) {
        setSelectByValue(methodSelect, method);
      }
    });
  });

  lastMessages.querySelectorAll(".history__entry").forEach(entry => {
    entry.addEventListener("click", () => {
      const message = entry.textContent.split(' ');
      const output = document.querySelector(".steganography__output-placeholder");
      const input = document.querySelector(".steganography__input");

      if (message[0] === '[Приховане]' && output) {
        output.style.cssText = "display: flex; align-items: left; justify-content: left; padding: 20px;";
        output.innerHTML = `<p>${message[1]}</p>`;
      } else if (message[0] === '[Витягнуте]' && input) {
        input.value = message[1];
      }
    });
  });
}

window.logout = logout;
