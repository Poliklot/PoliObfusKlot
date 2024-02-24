// utils/findAllClassNames.js

const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const postcss = require('postcss');
const babel = require("@babel/core");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

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
function findClassNamesInJS(jsContent) {
    const normalizedContent = normalizeSpacesInTemplateLiterals(jsContent);

    const ast = parseJSContent(normalizedContent);
    const classNames = new Set();
    const variableValues = analyzeVariableDeclarations(ast); // Анализируем переменные
    traverseAST(ast, classNames, variableValues); // Передаем значения переменных для дальнейшей обработки
    return Array.from(classNames);
}

function normalizeSpacesInTemplateLiterals(content) {
    // Простая нормализация пробелов внутри шаблонных строк
    // Обратите внимание: это может быть не идеально для всех случаев
    return content.replace(/`([^`]*)`/g, (match, p1) => {
        // Удаляем лишние пробелы внутри шаблонных строк
        return '`' + p1.replace(/\s+/g, ' ').trim() + '`';
    });
}

function analyzeVariableDeclarations(ast) {
    const variableValues = new Map(); // Сохраняем возможные значения для переменных
    traverse(ast, {
        VariableDeclarator(path) {
            if (path.node.id.name && path.node.init) {
                if (path.node.init.type === 'StringLiteral') {
                    variableValues.set(path.node.id.name, [path.node.init.value]);
                } else if (path.node.init.type === 'ConditionalExpression') {
                    // Обработка тернарного выражения
                    const consequent = path.node.init.consequent.value;
                    const alternate = path.node.init.alternate.value;
                    variableValues.set(path.node.id.name, [consequent, alternate].filter(Boolean));
                }
            }
        }
    });
    return variableValues;
}

function parseJSContent(jsContent) {
    try {
        return parser.parse(jsContent, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
        });
    } catch (error) {
        console.error("Error parsing JS content:", error);
        return null; // Возвращаем null или пустой AST, чтобы вызывающий код мог корректно обработать ошибку
    }
}


// Дополнительно обновим `traverseAST` для передачи `variableValues`
function traverseAST(ast, classNames, variableValues) {
    traverse(ast, {
        enter(path) {
            handleCallExpressions(path, classNames);
            handleAssignmentExpressions(path, classNames);
            handleTemplateLiterals(path, classNames, variableValues); // Передаем значения переменных
        },
    });
}

function handleCallExpressions(path, classNames) {
    const { callee } = path.node;

    // Обработка стандартных DOM методов
    handleClassListMethods(callee, path, classNames);
    handleDOMMethods(callee, path, classNames);

    // Добавляем обработку jQuery селекторов
    if (callee && callee.name === '$') { // Проверяем, является ли вызываемая функция jQuery селектором
        path.node.arguments.forEach(arg => {
            if (arg.type === 'StringLiteral' && arg.value.startsWith('.')) { // Проверяем, начинается ли строка с точки, указывая на класс
                const className = arg.value.slice(1); // Убираем точку из начала строки
                classNames.add(className);
            }
        });
    }
}

function handleClassListMethods(callee, path, classNames) {
    // Убедимся, что callee является объектом с нужными свойствами
    if (callee && typeof callee === 'object' && callee.property && callee.object && callee.object.property &&
        ['add', 'remove', 'toggle', 'contains', 'replace'].includes(callee.property.name) &&
        callee.object.property.name === 'classList') {
        path.node.arguments.forEach(arg => {
            if (arg.type === 'StringLiteral') {
                classNames.add(arg.value);
            }
        });
    }
}

function handleDOMMethods(callee, path, classNames) {
    if (callee && callee.property && (callee.property.name === 'querySelector' || callee.property.name === 'querySelectorAll')) {
        path.node.arguments.forEach(arg => {
            if (arg.type === 'StringLiteral') {
                // Используем регулярное выражение для поиска классов, игнорируя селекторы атрибутов
                const classMatches = arg.value.match(/\.[A-Za-z0-9_-]+/g);
                if (classMatches) {
                    classMatches.forEach(classMatch => {
                        const className = classMatch.slice(1); // Убираем точку из начала строки
                        classNames.add(className);
                    });
                }
            }
        });
    }
}

function handleAssignmentExpressions(path, classNames) {
    if (path.isAssignmentExpression() && path.node.left.property && path.node.left.property.name === 'className') {
        if (path.node.right.type === 'StringLiteral') {
            classNames.add(path.node.right.value);
        }
    }
}

function handleTemplateLiterals(path, classNames, variableValues) {
    let accumulatedHTML = '';

    // Аккумулирование фрагментов HTML из quasis
    if (path.node.quasis) {
        path.node.quasis.forEach((quasi, index) => {
            accumulatedHTML += quasi.value.raw;
            // Проверяем, есть ли выражение после текущего фрагмента
            if (index < path.node.expressions.length) {
                const expr = path.node.expressions[index];
                // Обработка выражений, являющихся идентификаторами
                if (expr.type === 'Identifier' && variableValues.has(expr.name)) {
                    let exprValues = variableValues.get(expr.name);
                    // Допустим, мы просто добавляем первое значение переменной для упрощения
                    if (exprValues.length > 0) {
                        accumulatedHTML += exprValues[0]; // Это упрощение, на самом деле может потребоваться более сложная логика
                    }
                }
            }
        });
    }

    // Теперь у нас есть аккумулированный HTML, можно извлекать классы
    addMatchesToClassNames(accumulatedHTML, classNames);

    // Отдельно обрабатываем каждое выражение для добавления возможных классов из переменных
    if (path.node.expressions) {
        path.node.expressions.forEach(expr => {
            if (expr.type === 'Identifier' && variableValues.has(expr.name)) {
                // Для каждой переменной добавляем её возможные значения
                variableValues.get(expr.name).forEach(value => addMatchesToClassNames(value, classNames));
            }
        });
    }
}


function addMatchesToClassNames(value, classNames) {
    try {
        // Поиск атрибутов class внутри строки
        const classAttrMatches = value.match(/class=["']([^"']+)["']/g);
        if (classAttrMatches) {
            classAttrMatches.forEach(attr => {
                // Извлекаем содержимое атрибута class и разделяем его на классы
                const classes = attr.match(/class=["']([^"']+)["']/)[1].split(/\s+/);
                classes.forEach(className => {
                    if (className) { // Проверка на непустую строку
                        classNames.add(className);
                    }
                });
            });
        } else {
            // Если атрибут class не найден, ищем отдельные слова, которые могут быть классами
            // Это нужно для поддержки динамически добавленных классов через переменные
            const matches = value.match(/\b[A-Za-z0-9_-]+\b/g);
            if (matches) {
                matches.forEach(match => {
                    classNames.add(match);
                });
            }
        }
    } catch (error) {
        console.log(error)
        console.log(value)
    }
}




// РАБОЧИЙ КОД
// const findClassNamesInJS = (jsContent) => {
//     const classNames = new Set();

//     // Регулярное выражение для classList и прямых присваиваний className
//     const classListRegex = /classList\.(add|remove|toggle|contains|replace)\(\s*['"`]([^'"\s]+)['"`]\s*(?:,\s*['"`]([^'"\s]+)['"`]\s*)?\)/g;
//     const classNameAssignmentRegex = /\.className\s*=\s*['"`]([^'"]+)['"`]/g;

//     // Регулярное выражение для поиска классов в DOM-методах и jQuery-style selectors
//     const domQueryRegex = /\$\(['"`]\.([^'"\s]+)['"`]\)|document\.querySelector\(['"`]\.([^'"\s]+)['"`]\)/g;

//     // Добавляем регулярное выражение для поиска классов, напрямую указанных в шаблонных строках
//     const directClassInTemplateStringRegex = /<[^>]+class\s*=\s*["'`]\s*([^"'`]+)\s*["'`][^>]*>/g;

//     // Добавляем регулярное выражение для поиска присваиваний переменных классам
//     const variableAssignmentRegex = /const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*['"`]([^'"]+)['"`]/g;

//     // Добавляем обработку для шаблонных строк, включая динамические переменные
//     const templateStringDynamicRegex = /\$\{([^}]+)\}/g;

//     // Функция для добавления классов, разделенных пробелами, в Set
//     const addClassNames = (classNamesSet, classNamesStr) => {
//         classNamesStr.split(/\s+/).forEach(className => {
//             if (isValidClassName(className)) {
//                 classNamesSet.add(className);
//             }
//         });
//     };

//     let match;

//     // Обработка classList и className
//     while ((match = classListRegex.exec(jsContent)) !== null) {
//         addClassNames(classNames, match[2]);
//         if (match[3]) addClassNames(classNames, match[3]);
//     }
//     while ((match = classNameAssignmentRegex.exec(jsContent)) !== null) {
//         addClassNames(classNames, match[1]);
//     }

//     // Обработка DOM-методов и jQuery-style selectors
//     while ((match = domQueryRegex.exec(jsContent)) !== null) {
//         addClassNames(classNames, match[1] || match[2]);
//     }

//     // Обработка присваиваний переменных
//     const variableAssignments = {};
//     while ((match = variableAssignmentRegex.exec(jsContent)) !== null) {
//         variableAssignments[match[1]] = match[2]; // Сохраняем присвоенные классы по именам переменных
//     }

//     // Расширяем обработку шаблонных строк
//     jsContent.replace(/\$\{([^}]+)\}/g, (_, expression) => {
//         // Пытаемся найти тернарные операторы в выражении
//         const ternaryMatch = expression.match(/(.+)\s\?\s'([^']+)'(?:\s|):(?:\s|)'([^']+)'/);
//         if (ternaryMatch) {
//             // Если нашли, добавляем оба возможных класса
//             classNames.add(ternaryMatch[2]);
//             classNames.add(ternaryMatch[3]);
//         } else {
//             // Если не тернарный оператор, добавляем выражение как есть
//             // Это упрощение, в реальных сценариях потребуется более сложный анализ
//             if (expression.trim().match(/^[A-Za-z0-9_-]+$/)) {
//                 classNames.add(expression.trim());
//             }
//         }
//         return _; // Возвращаем неизменный шаблон, так как замена не требуется
//     });

//     // Новая обработка для поиска классов, напрямую указанных в шаблонных строках
//     while ((match = directClassInTemplateStringRegex.exec(jsContent)) !== null) {
//         addClassNames(classNames, match[1]);
//     }

//     return Array.from(classNames);
// };

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