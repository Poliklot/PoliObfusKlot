// utils/findClassNamesInHTML.js

const cheerio = require('cheerio');
const { findClassNamesInCSS } = require('./findClassNamesInCSS');
const { findClassNamesInJS } = require('./findClassNamesInJS');
const { isValidClassName } = require('./isValidClassName');

/**
 * Находит и возвращает все уникальные имена классов, найденные в HTML-контенте.
 * @param {string} htmlContent - Строка с HTML-контентом.
 * @returns {Array} Массив уникальных имен классов.
 */
const findClassNamesInHTML = (htmlContent) => {
    const classNames = new Set();

    try {
        const $ = cheerio.load(htmlContent);
        $('[class]').each(function () {
            const classes = $(this).attr('class')?.split(/\s+/) || [];
            classes.forEach((cls) => {
                if (isValidClassName(cls)) {
                    classNames.add(cls);
                }
            });
        });

        // Обработка встроенных стилей
        $('style').each(function () {
            const cssContent = $(this).html();
            if (cssContent) {
                const cssClassNames = findClassNamesInCSS(cssContent);
                cssClassNames.forEach((className) => classNames.add(className));
            }
        });

        // Обработка встроенных скриптов
        $('script').each(function () {
            const jsContent = $(this).html();
            if (jsContent) {
                const jsClassNames = findClassNamesInJS(jsContent);
                jsClassNames.forEach((className) => classNames.add(className));
            }
        });
    } catch (err) {
        console.error('Ошибка при парсинге HTML контента:', err.message);
    }

    return Array.from(classNames);
};

module.exports = {
    findClassNamesInHTML,
};
