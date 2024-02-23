const fs = require('fs');
const path = require('path');

const generateUniqueClassName = (() => {
    let counter = -1;
    const charSet = 'abcdefghijklmnopqrstuvwxyz';
    const digitals = '0123456789';
    const extraChars = '_-';
    const allCharSet = charSet + digitals + extraChars; // Объединяем для удобства обработки

    // Функция для получения следующего символа
    const getNextChar = (index) => {
        return allCharSet[index % allCharSet.length];
    };

    // Генерация уникального класса
    const generateClassName = () => {
        let str = '';

        if (charSet.length > ++counter) {
            str = charSet[counter];
        } else {
            
            str = getNextChar(counter);
            // str = getNextChar(counter % allCharSet.length) + str;
        }

        // str = str || getNextChar(0);

        return str;
    };

    return generateClassName;
})();

const obfuscateClassNames = (classNames) => {
    const mappings = {};

    classNames.forEach(name => {
        mappings[name] = generateUniqueClassName();
    });

    const mappingsFilePath = path.join(process.cwd(), './classMappings.json');
    fs.writeFileSync(mappingsFilePath, JSON.stringify(mappings, null, 2));

    return mappings;
};

module.exports = { obfuscateClassNames };
