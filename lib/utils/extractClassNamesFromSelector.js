// utils/extractClassNamesFromSelector.js

const { parse: parseSelector } = require('css-what');
const { isValidClassName } = require('./isValidClassName');

/**
 * Извлекает имена классов из селектора и добавляет их в множество.
 * @param {string} selector - CSS-селектор.
 * @param {Set} classNames - Множество для хранения имен классов.
 */
function extractClassNamesFromSelector(selector, classNames) {
    try {
        if (!selector || typeof selector !== 'string') return;

        const selectorAST = parseSelector(selector);
        extractClassNamesFromSelectorAST(selectorAST, classNames);
    } catch (err) {
        console.error('Ошибка при парсинге селектора:', err.message);
    }
}

/**
 * Рекурсивно проходит по AST селектора и извлекает имена классов.
 * @param {Array} selectorAST - AST селектора.
 * @param {Set} classNames - Множество для хранения имен классов.
 */
function extractClassNamesFromSelectorAST(selectorAST, classNames) {
    if (!Array.isArray(selectorAST)) return;

    selectorAST.forEach((selectorsGroup) => {
        if (!Array.isArray(selectorsGroup)) return;

        selectorsGroup.forEach((node) => {
            if (node.type === 'attribute' && node.name === 'class') {
                const className = node.value;
                if (isValidClassName(className)) {
                    classNames.add(className);
                }
            } else if (node.type === 'class') {
                const className = node.name;
                if (isValidClassName(className)) {
                    classNames.add(className);
                }
            } else if (node.type === 'pseudo') {
                if (node.data) {
                    extractClassNamesFromSelectorAST(node.data, classNames);
                }
            } else if (node.type === 'subselector' && node.data) {
                extractClassNamesFromSelectorAST([node.data], classNames);
            } else if (
                ['child', 'parent', 'sibling', 'adjacent', 'descendant'].includes(node.type)
            ) {
                // Эти типы содержат селекторы в виде узлов
                if (node.left) {
                    extractClassNamesFromSelectorAST([[node.left]], classNames);
                }
                if (node.right) {
                    extractClassNamesFromSelectorAST([[node.right]], classNames);
                }
            }
        });
    });
}

module.exports = {
    extractClassNamesFromSelector,
};
