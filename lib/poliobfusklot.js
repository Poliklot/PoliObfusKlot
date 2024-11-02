// lib/poliobfusklot.js

const obfuscateCSS = require('./obfuscateCSS');
const { updateHTML } = require('./updateHTML');
const updateJS = require('./updateJS');
const { findAllClassNames } = require('./utils/findAllClassNames');
const { obfuscateClassNames } = require('./utils/obfuscateClassNames');

/**
 * Основная функция обфускации классов.
 * @param {Object} config - Конфигурационный объект.
 */
module.exports = async function(config) {
    try {
        // Находим все имена классов в проекте
        const allClasses = findAllClassNames(config);

        // Обфусцируем имена классов и сохраняем маппинг
        obfuscateClassNames(allClasses);

        // Обновляем CSS, HTML и JS файлы с новыми именами классов
        await obfuscateCSS(config.css);
        await updateHTML(config.html);
        await updateJS(config.js);

        console.log("Обфускация успешно завершена!");
    } catch (error) {
        console.error('Ошибка при обфускации:', error.message);
    }
};
