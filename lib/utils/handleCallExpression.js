const { extractValueFromNode } = require('./extractValueFromNode');
const { isValidClassName } = require('./isValidClassName');
const { extractClassNamesFromSelector } = require('./extractClassNamesFromSelector');

function memberName(node) {
    if (node?.type !== 'MemberExpression') return null;
    if (!node.computed && node.property.type === 'Identifier') return node.property.name;
    return node.property.type === 'StringLiteral' ? node.property.value : null;
}

function addClassNames(node, scope, classNames) {
    for (const value of extractValueFromNode(node, scope) || []) {
        for (const name of value.split(/\s+/)) {
            if (isValidClassName(name)) classNames.add(name);
        }
    }
}

function handleCallExpression(path, classNames) {
    const { callee, arguments: args } = path.node;
    const method = memberName(callee);
    if ((memberName(callee.object) === 'classList' && ['add', 'remove', 'toggle', 'replace'].includes(method)) ||
        ['addClass', 'removeClass', 'toggleClass'].includes(method)) {
        args.forEach(arg => addClassNames(arg, path.scope, classNames));
    }

    const jquery = callee.type === 'Identifier' && ['$', 'jQuery'].includes(callee.name);
    const jqueryFind = method === 'find' && callee.object?.type === 'Identifier' && ['$', 'jQuery'].includes(callee.object.name);
    if (jquery || jqueryFind || ['querySelector', 'querySelectorAll'].includes(method) ||
        (callee.type === 'Identifier' && callee.name === 'querySelector')) {
        for (const value of extractValueFromNode(args[0], path.scope) || []) {
            extractClassNamesFromSelector(value, classNames);
        }
    }

    if (method === 'createElement' && callee.object?.type === 'Identifier' && callee.object.name === 'React' &&
        args[1]?.type === 'ObjectExpression') {
        for (const property of args[1].properties) {
            if (property.type !== 'ObjectProperty' || property.computed) continue;
            const name = property.key.name ?? property.key.value;
            if (name === 'className' || name === 'class') addClassNames(property.value, path.scope, classNames);
        }
    }
}

module.exports = { handleCallExpression, memberName, addClassNames };
