// utils/findAllClassNames.js

const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const postcss = require('postcss');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const findAllClassNames = (config) => {
    const allClassNames = new Set();
    const cssConfig = config.css;
    const htmlConfig = config.html;
    const jsConfig = config.js;

    // Находим имена классов в CSS файлах
    const cssFiles = fs.readdirSync(cssConfig.directories[0]).filter(file => file.endsWith('.css'));
    cssFiles.forEach(file => {
        const cssContent = fs.readFileSync(path.join(cssConfig.directories[0], file), 'utf-8');
        const classNamesList = findClassNamesInCSS(cssContent);
        classNamesList.forEach(className => allClassNames.add(className));
    });

    // Находим имена классов в HTML файлах
    const htmlFiles = fs.readdirSync(htmlConfig.directories[0]).filter(file => file.endsWith('.html'));
    htmlFiles.forEach(file => {
        const htmlContent = fs.readFileSync(path.join(htmlConfig.directories[0], file), 'utf-8');
        const classNamesList = findClassNamesInHTML(htmlContent);
        classNamesList.forEach(className => allClassNames.add(className));
    });

    // Находим имена классов в JS файлах
    const jsFiles = fs.readdirSync(jsConfig.directories[0]).filter(file => file.endsWith('.js'));
    jsFiles.forEach(file => {
        const jsContent = fs.readFileSync(path.join(jsConfig.directories[0], file), 'utf-8');
        // console.log(jsContent);
        const classNamesList = findClassNamesInJS(jsContent);
        classNamesList.forEach(className => allClassNames.add(className));
    });


    return Array.from(allClassNames);
}

/**
 * Находит и возвращает все уникальные классы, найденные в HTML-контенте.
 * 
 * @param {String} htmlContent - строка с HTML-контентом
 * @returns {Array} Массив уникальных имен классов
 */
const findClassNamesInHTML = (htmlContent) => {
    const classNames = new Set();

    const $ = cheerio.load(htmlContent);
    $('[class]').each(function () {
        const classes = $(this).attr('class').split(/\s+/);
        classes.forEach(cls => classNames.add(cls));
    });

    return Array.from(classNames);
};

/**
 * Находит и возвращает все найденные классы в .css файле, игнорируя содержимое комментариев.
 * 
 * @param {String | false} cssContent 
 * @returns {Array}
 */
const findClassNamesInCSS = (cssContent) => {
    const classNames = new Set();

    const root = postcss.parse(cssContent);
    root.walkRules(rule => {
        if (rule.parent && rule.parent.type === 'atrule' && rule.parent.name === 'media') {
            // Обрабатываем правила внутри @media
            rule.selectors.forEach(selector => {
                extractClassNames(selector, classNames);
            });
        } else if (rule.type === 'rule') {
            // Обрабатываем обычные CSS правила
            rule.selectors.forEach(selector => {
                extractClassNames(selector, classNames);
            });
        }
    });

    return Array.from(classNames);
};

/**
 * Извлекает имена классов из селектора и добавляет их в множество.
 * 
 * @param {String} selector 
 * @param {Set} classNames 
 */
function extractClassNames(selector, classNames) {
    // Игнорируем селекторы, которые не могут содержать имена классов
    if (!selector.includes('{') && !selector.includes('}')) {
        // Удаляем селекторы атрибутов из строки селектора
        const selectorWithoutAttributes = selector.replace(/\[.+?\]/g, '');

        // Ищем классы в очищенном селекторе
        const cssClassMatches = selectorWithoutAttributes.match(/\.([0-9a-zA-Z-_\\]+)(?![^\{]*\})/g);
        if (cssClassMatches) {
            cssClassMatches.forEach(match => {
                // Убираем точку перед именем класса
                let className = match.substring(1);

                classNames.add(className);
            });
        }
    }
}

// НАДО ДОРАБОТАТЬ
// const findClassNamesInJS = (jsContent) => {
//     const classNames = new Set();

//     const ast = parser.parse(jsContent, {
//         sourceType: 'module',
//         plugins: [
//             // Добавьте необходимые плагины, если ваш код использует дополнительный синтаксис,
//             // например: 'jsx', 'typescript' для поддержки JSX или TypeScript.
//         ],
//     });

//     traverse(ast, {
//         enter(path) {
//             // Обработка вызовов методов, которые могут содержать классы
//             if (path.isCallExpression()) {
//                 const { callee } = path.node;
//                 if (callee.property && ['add', 'remove', 'toggle', 'contains', 'replace'].includes(callee.property.name) &&
//                     callee.object && callee.object.property && callee.object.property.name === 'classList') {
//                     path.node.arguments.forEach(arg => {
//                         if (arg.type === 'StringLiteral') {
//                             classNames.add(arg.value);
//                         }
//                     });
//                 }
//             }

//             // Обработка прямых присваиваний className
//             if (path.isAssignmentExpression() && path.node.left.property && path.node.left.property.name === 'className') {
//                 if (path.node.right.type === 'StringLiteral') {
//                     classNames.add(path.node.right.value);
//                 }
//             }

//             // Обработка шаблонных строк
//             if (path.isTemplateLiteral()) {
//                 path.node.quasis.forEach(element => {
//                     const rawValue = element.value.raw.trim();
//                     if (rawValue) classNames.add(rawValue);
//                 });
//             }
//         }
//     });

//     return Array.from(classNames);
// };

// РАБОЧИЙ КОД
const findClassNamesInJS = (jsContent) => {
    const classNames = new Set();

    // Регулярное выражение для classList и прямых присваиваний className
    const classListRegex = /classList\.(add|remove|toggle|contains|replace)\(\s*['"`]([^'"\s]+)['"`]\s*(?:,\s*['"`]([^'"\s]+)['"`]\s*)?\)/g;
    const classNameAssignmentRegex = /\.className\s*=\s*['"`]([^'"]+)['"`]/g;

    // Регулярное выражение для поиска классов в DOM-методах и jQuery-style selectors
    const domQueryRegex = /\$\(['"`]\.([^'"\s]+)['"`]\)|document\.querySelector\(['"`]\.([^'"\s]+)['"`]\)/g;

    // Добавляем регулярное выражение для поиска классов, напрямую указанных в шаблонных строках
    const directClassInTemplateStringRegex = /<[^>]+class\s*=\s*["'`]\s*([^"'`]+)\s*["'`][^>]*>/g;

    // Добавляем регулярное выражение для поиска присваиваний переменных классам
    const variableAssignmentRegex = /const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*['"`]([^'"]+)['"`]/g;

    // Добавляем обработку для шаблонных строк, включая динамические переменные
    const templateStringDynamicRegex = /\$\{([^}]+)\}/g;

    // Функция для добавления классов, разделенных пробелами, в Set
    const addClassNames = (classNamesSet, classNamesStr) => {
        classNamesStr.split(/\s+/).forEach(className => {
            if (isValidClassName(className)) {
                classNamesSet.add(className);
            }
        });
    };

    let match;

    // Обработка classList и className
    while ((match = classListRegex.exec(jsContent)) !== null) {
        addClassNames(classNames, match[2]);
        if (match[3]) addClassNames(classNames, match[3]);
    }
    while ((match = classNameAssignmentRegex.exec(jsContent)) !== null) {
        addClassNames(classNames, match[1]);
    }

    // Обработка DOM-методов и jQuery-style selectors
    while ((match = domQueryRegex.exec(jsContent)) !== null) {
        addClassNames(classNames, match[1] || match[2]);
    }

    // Обработка присваиваний переменных
    const variableAssignments = {};
    while ((match = variableAssignmentRegex.exec(jsContent)) !== null) {
        variableAssignments[match[1]] = match[2]; // Сохраняем присвоенные классы по именам переменных
    }

    // Расширяем обработку шаблонных строк
    jsContent.replace(/\$\{([^}]+)\}/g, (_, expression) => {
        // Пытаемся найти тернарные операторы в выражении
        const ternaryMatch = expression.match(/(.+)\s\?\s'([^']+)'(?:\s|):(?:\s|)'([^']+)'/);
        if (ternaryMatch) {
            // Если нашли, добавляем оба возможных класса
            classNames.add(ternaryMatch[2]);
            classNames.add(ternaryMatch[3]);
        } else {
            // Если не тернарный оператор, добавляем выражение как есть
            // Это упрощение, в реальных сценариях потребуется более сложный анализ
            if (expression.trim().match(/^[A-Za-z0-9_-]+$/)) {
                classNames.add(expression.trim());
            }
        }
        return _; // Возвращаем неизменный шаблон, так как замена не требуется
    });

    // Новая обработка для поиска классов, напрямую указанных в шаблонных строках
    while ((match = directClassInTemplateStringRegex.exec(jsContent)) !== null) {
        addClassNames(classNames, match[1]);
    }

    return Array.from(classNames);
};

const isValidClassName = (className) => {
    return /^[A-Za-z0-9_-]+$/.test(className) && !isHtmlTagName(className);
};

const isHtmlTagName = (name) => {
    const htmlTags = ['div', 'span', 'input', 'button', 'img', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li', 'table', 'tr', 'td', 'th', 'form', 'textarea', 'select', 'option', 'iframe', 'script', 'style', 'link', 'meta', 'head', 'body', 'html'];
    return htmlTags.includes(name.toLowerCase());
};

module.exports = {
    findAllClassNames,
    findClassNamesInHTML,
    findClassNamesInCSS,
    findClassNamesInJS
};