// utils/isValidClassName.js

/**
 * Проверяет, является ли строка валидным именем CSS-класса.
 * @param {string} className
 * @returns {boolean}
 */
function isValidClassName(className) {
    // Разрешаем любые символы, кроме пробельных
    return /^[^\s]+$/.test(className);
}

module.exports = {
    isValidClassName,
};
