// utils/handleCallExpression.js

const { extractValueFromNode } = require('./extractValueFromNode');
const { isValidClassName } = require('./isValidClassName');

/**
 * Обрабатывает узлы CallExpression для извлечения имен классов.
 * @param {NodePath} path
 * @param {Set} classNames
 * @param {Map} variableValues
 */
function handleCallExpression(path, classNames, variableValues) {
    const { callee, arguments: args } = path.node;

    let methodName = null;

    // Обработка методов classList.add, classList.remove, classList.toggle
    if (
        callee.type === 'MemberExpression' &&
        callee.property.type === 'Identifier' &&
        (callee.property.name === 'add' ||
            callee.property.name === 'remove' ||
            callee.property.name === 'toggle')
    ) {
        if (
            callee.object.type === 'MemberExpression' &&
            callee.object.property.type === 'Identifier' &&
            callee.object.property.name === 'classList'
        ) {
            methodName = callee.property.name;
        }
    }

    // Обработка методов jQuery: addClass, removeClass, toggleClass
    if (
        callee.type === 'MemberExpression' &&
        callee.property.type === 'Identifier' &&
        (callee.property.name === 'addClass' ||
            callee.property.name === 'removeClass' ||
            callee.property.name === 'toggleClass')
    ) {
        methodName = callee.property.name;
    }

    if (methodName) {
        args.forEach((arg) => {
            const values = extractValueFromNode(arg, variableValues);
            if (values) {
                values.forEach((value) => {
                    value.split(/\s+/).forEach((className) => {
                        if (isValidClassName(className)) {
                            classNames.add(className);
                        }
                    });
                });
            }
        });
    }

    // Обработка селекторных функций: $, jQuery
    if (
        (callee.type === 'Identifier' && (callee.name === '$' || callee.name === 'jQuery')) ||
        (callee.type === 'MemberExpression' &&
            callee.object.name === '$' &&
            callee.property.name === 'find')
    ) {
        args.forEach((arg) => {
            const values = extractValueFromNode(arg, variableValues);
            if (values) {
                values.forEach((value) => {
                    // Извлекаем имена классов из селектора
                    const regex = /\.([^\s\.\#\[\]\(\)\:\>]+)/g;
                    let match;
                    while ((match = regex.exec(value)) !== null) {
                        const className = match[1];
                        if (isValidClassName(className)) {
                            classNames.add(className);
                        }
                    }
                });
            }
        });
    }

    // Обработка методов querySelector и querySelectorAll
    if (
        (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            (callee.property.name === 'querySelector' ||
                callee.property.name === 'querySelectorAll')) ||
        (callee.type === 'Identifier' && callee.name === 'querySelector')
    ) {
        args.forEach((arg) => {
            const values = extractValueFromNode(arg, variableValues);
            if (values) {
                values.forEach((value) => {
                    // Извлекаем имена классов из селектора
                    const regex = /\.([^\s\.\#\[\]\(\)\:\>]+)/g;
                    let match;
                    while ((match = regex.exec(value)) !== null) {
                        const className = match[1];
                        if (isValidClassName(className)) {
                            classNames.add(className);
                        }
                    }
                    // Также извлекаем классы из атрибутных селекторов
                    const attrRegex = /class=["']([^"']+)["']/g;
                    while ((match = attrRegex.exec(value)) !== null) {
                        const classes = match[1].split(/\s+/);
                        classes.forEach((className) => {
                            if (isValidClassName(className)) {
                                classNames.add(className);
                            }
                        });
                    }
                });
            }
        });
    }
}

module.exports = {
    handleCallExpression,
};
