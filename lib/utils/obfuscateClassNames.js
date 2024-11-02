// utils/obfuscateClassNames.js

const fs = require('fs');
const path = require('path');

/**
 * Функция для генерации уникальных имен классов.
 * Использует комбинации букв, цифр и дополнительных символов для создания уникальных идентификаторов.
 */
const generateUniqueClassName = (() => {
    let counter = 0;
    const charSet = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const extraChars = '_-';
    const allChars = charSet + digits + extraChars;

    /**
     * Инкрементирует строку, создавая следующую последовательность символов.
     * @param {string} s - исходная строка
     * @returns {string} новая строка с инкрементированным значением
     */
    function incrementString(s) {
        if (s === '') return allChars[0];

        const lastChar = s.slice(-1);
        const rest = s.slice(0, -1);

        if (lastChar !== allChars[allChars.length - 1]) {
            return rest + allChars[allChars.indexOf(lastChar) + 1];
        } else {
            return incrementString(rest) + allChars[0];
        }
    }

    /**
     * Генерирует следующий уникальный идентификатор на основе счетчика.
     * @param {number} n - текущее значение счетчика
     * @returns {string} уникальный идентификатор
     */
    function getNextIdentifier(n) {
        let identifier = '';

        while (n >= allChars.length) {
            const remainder = n % allChars.length;
            identifier = allChars[remainder] + identifier;
            n = Math.floor(n / allChars.length) - 1;
        }
        identifier = allChars[n] + identifier;

        // Убедимся, что первый символ является буквой (для валидности CSS-класса)
        if (!/^[a-zA-Z]/.test(identifier)) {
            identifier = 'a' + identifier;
        }

        return identifier;
    }

    return function generateClassName() {
        const identifier = getNextIdentifier(counter);
        counter++;
        return identifier;
    };
})();

/**
 * Функция для обфускации имен классов.
 * @param {string[]} classNames - массив исходных имен классов
 * @returns {Object} объект с отображением исходных имен классов на обфусцированные
 */
function obfuscateClassNames(classNames) {
    const mappings = {};

    classNames.forEach((name) => {
        mappings[name] = generateUniqueClassName();
    });

    const mappingsFilePath = path.join(process.cwd(), './classMappings.json');
    fs.writeFileSync(mappingsFilePath, JSON.stringify(mappings, null, 2), 'utf-8');

    return mappings;
}

module.exports = { obfuscateClassNames };
