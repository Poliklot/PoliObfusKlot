// utils/extractValueFromNode.js

/**
 * Рекурсивно извлекает значение из узла.
 * @param {Node} node
 * @param {Map} variableValues
 * @returns {Array<string>|null}
 */
function extractValueFromNode(node, variableValues) {
    if (!node) return null;

    switch (node.type) {
        case 'StringLiteral':
            return [node.value];

        case 'TemplateLiteral':
            if (node.expressions.length === 0) {
                return [node.quasis.map((quasi) => quasi.value.cooked).join('')];
            }
            // Если есть выражения, пытаемся извлечь статические части
            return node.quasis
                .map((quasi) => quasi.value.cooked)
                .filter(Boolean);

        case 'ArrayExpression':
            let values = [];
            for (let element of node.elements) {
                const elementValues = extractValueFromNode(element, variableValues);
                if (elementValues) {
                    values = values.concat(elementValues);
                }
            }
            return values.length > 0 ? values : null;

        case 'Identifier':
            return variableValues.get(node.name) || null;

        case 'BinaryExpression':
            // Игнорируем динамически сформированные строки
            return null;

        case 'ConditionalExpression':
            const consequent = extractValueFromNode(node.consequent, variableValues);
            const alternate = extractValueFromNode(node.alternate, variableValues);
            let condValues = [];
            if (consequent) condValues = condValues.concat(consequent);
            if (alternate) condValues = condValues.concat(alternate);
            return condValues.length > 0 ? condValues : null;

        default:
            return null;
    }
}

module.exports = {
    extractValueFromNode,
};
