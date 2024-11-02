// utils/findClassNamesInCSS.js

const postcss = require('postcss');
const { extractClassNamesFromSelector } = require('./extractClassNamesFromSelector');

/**
 * Находит и возвращает все уникальные имена классов, найденные в CSS-контенте.
 * @param {string} cssContent - Строка с CSS-контентом.
 * @returns {Array} Массив уникальных имен классов.
 */
const findClassNamesInCSS = (cssContent) => {
    const classNames = new Set();

    try {
        const root = postcss.parse(cssContent);
        root.walkRules((rule) => {
            // Обрабатываем селекторы
            rule.selectors.forEach((selector) => {
                extractClassNamesFromSelector(selector, classNames);
            });
        });
    } catch (err) {
        console.error('Ошибка при парсинге CSS контента:', err.message);
    }

    return Array.from(classNames);
};

module.exports = {
    findClassNamesInCSS,
};
