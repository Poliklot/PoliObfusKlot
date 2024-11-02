// utils/findClassNamesInJS.js

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { extractValueFromNode } = require('./extractValueFromNode');
const { isValidClassName } = require('./isValidClassName');
const { handleCallExpression } = require('./handleCallExpression');

/**
 * Основная функция для поиска имен классов в JS-контенте.
 * @param {string} jsContent
 * @returns {Array<string>}
 */
const findClassNamesInJS = (jsContent) => {
    const classNames = new Set();
    let ast;

    try {
        ast = parser.parse(jsContent, {
            sourceType: 'unambiguous',
            plugins: ['jsx', 'typescript'],
            errorRecovery: true, // Позволяет продолжать парсинг при ошибках
        });
    } catch (error) {
        console.error('Ошибка при парсинге JS контента:', error.message);
        return [];
    }

    const variableValues = new Map();

    traverse(ast, {
        VariableDeclarator(path) {
            const { id, init } = path.node;
            if (id.type === 'Identifier' && init) {
                const value = extractValueFromNode(init, variableValues);
                if (value) {
                    variableValues.set(id.name, value);
                }
            }
        },
        AssignmentExpression(path) {
            const { left, right } = path.node;
            if (
                left.type === 'MemberExpression' &&
                left.property.type === 'Identifier' &&
                (left.property.name === 'className' || left.property.name === 'classList')
            ) {
                const classList = extractClassNamesFromNode(right, variableValues);
                classList.forEach((className) => classNames.add(className));
            }
        },
        CallExpression(path) {
            handleCallExpression(path, classNames, variableValues);
        },
        JSXAttribute(path) {
            if (path.node.name.name === 'className' || path.node.name.name === 'class') {
                const valueNode = path.node.value;
                if (valueNode) {
                    if (valueNode.type === 'StringLiteral') {
                        valueNode.value.split(/\s+/).forEach((className) => {
                            if (isValidClassName(className)) {
                                classNames.add(className);
                            }
                        });
                    } else if (valueNode.type === 'JSXExpressionContainer') {
                        const expression = valueNode.expression;
                        const value = extractValueFromNode(expression, variableValues);
                        if (value) {
                            value.forEach((v) => {
                                v.split(/\s+/).forEach((className) => {
                                    if (isValidClassName(className)) {
                                        classNames.add(className);
                                    }
                                });
                            });
                        }
                    }
                }
            }
        },
    });

    return Array.from(classNames);
};

/**
 * Вспомогательная функция для извлечения имен классов из узла.
 * @param {Node} node
 * @param {Map} variableValues
 * @returns {Array<string>}
 */
function extractClassNamesFromNode(node, variableValues) {
    const values = extractValueFromNode(node, variableValues);
    if (values) {
        let classList = [];
        values.forEach((value) => {
            value.split(/\s+/).forEach((className) => {
                if (isValidClassName(className)) {
                    classList.push(className);
                }
            });
        });
        return classList;
    }
    return [];
}

module.exports = {
    findClassNamesInJS,
};
