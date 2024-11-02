// utils/findAllClassNames.js

const path = require('path');
const fs = require('fs');
const glob = require('glob');

const { findClassNamesInCSS } = require('./findClassNamesInCSS');
const { findClassNamesInHTML } = require('./findClassNamesInHTML');
const { findClassNamesInJS } = require('./findClassNamesInJS');

/**
 * Функция для поиска всех имен классов в CSS, HTML и JS файлах на основе конфигурации.
 * @param {Object} config - Объект конфигурации с путями и настройками.
 * @returns {Array} Массив уникальных имен классов.
 */
const findAllClassNames = (config) => {
    const allClassNames = new Set();

    // Проверка и получение конфигурации для CSS, HTML и JS
    const cssConfig = config.css || {};
    const htmlConfig = config.html || {};
    const jsConfig = config.js || {};

    // Получение расширений файлов для каждого типа
    const cssExtensions = cssConfig.extensions || ['.css'];
    const htmlExtensions = htmlConfig.extensions || ['.html'];
    const jsExtensions = jsConfig.extensions || ['.js'];

    // Функция для обработки файлов по типу
    const processFiles = (directories = [], extensions, processor) => {
        if (!Array.isArray(directories) || directories.length === 0) return;

        directories.forEach((directory) => {
            try {
                const files = glob.sync(`${directory}/**/*`, { nodir: true });
                files.forEach((file) => {
                    if (extensions.includes(path.extname(file))) {
                        try {
                            const content = fs.readFileSync(file, 'utf-8');
                            const classNamesList = processor(content);
                            classNamesList.forEach((className) => allClassNames.add(className));
                        } catch (err) {
                            console.error(`Ошибка при чтении файла ${file}:`, err.message);
                        }
                    }
                });
            } catch (err) {
                console.error(`Ошибка при обработке директории ${directory}:`, err.message);
            }
        });
    };

    // Обработка CSS файлов
    processFiles(cssConfig.directories, cssExtensions, findClassNamesInCSS);

    // Обработка HTML файлов
    processFiles(htmlConfig.directories, htmlExtensions, findClassNamesInHTML);

    // Обработка JS файлов
    processFiles(jsConfig.directories, jsExtensions, findClassNamesInJS);

    return Array.from(allClassNames);
};

// Экспортируем функции для использования в других модулях
module.exports = {
    findAllClassNames,
    findClassNamesInCSS,
    findClassNamesInHTML,
    findClassNamesInJS,
};
