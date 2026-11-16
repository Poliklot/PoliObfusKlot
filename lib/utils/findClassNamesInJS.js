const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { extractValueFromNode, combineValues } = require('./extractValueFromNode');
const { handleCallExpression, memberName, addClassNames } = require('./handleCallExpression');

// Mark unknown fragments instead of inventing partial class names.
function htmlValues(node, scope, unknown) {
    if (node.type === 'TemplateLiteral') {
        let values = [''];
        for (let i = 0; i < node.quasis.length; i++) {
            values = combineValues(values, [node.quasis[i].value.cooked ?? unknown]);
            if (i < node.expressions.length) values = combineValues(values, htmlValues(node.expressions[i], scope, unknown));
            if (!values) return [unknown];
        }
        return values;
    }
    if (node.type === 'BinaryExpression' && node.operator === '+') {
        return combineValues(htmlValues(node.left, scope, unknown), htmlValues(node.right, scope, unknown)) || [unknown];
    }
    return extractValueFromNode(node, scope) || [unknown];
}

function findClassNamesInJS(jsContent) {
    const classNames = new Set();
    let ast;
    try {
        ast = parser.parse(jsContent, {
            sourceType: 'unambiguous',
            plugins: ['jsx', 'typescript'],
            allowReturnOutsideFunction: true, // CommonJS module bodies can return.
        });
    } catch (error) {
        console.error('Ошибка при парсинге JS контента:', error.message);
        return [];
    }
    let unknown = '__POLIO_UNKNOWN_VALUE__';
    while (jsContent.includes(unknown)) unknown += '_';

    function addHTML(path) {
        const parent = path.parentPath;
        if (parent.isTemplateLiteral() || parent.isConditionalExpression() ||
            (parent.isBinaryExpression() && parent.node.operator === '+')) return;
        for (const value of htmlValues(path.node, path.scope, unknown)) {
            if (!value.includes('<') || !/\bclass\s*=/.test(value)) continue;
            // Lazy loading avoids the existing HTML -> JS module dependency cycle.
            const { findClassNamesInHTML } = require('./findClassNamesInHTML');
            for (const name of findClassNamesInHTML(value)) {
                if (!name.includes(unknown)) classNames.add(name);
            }
        }
    }

    traverse(ast, {
        AssignmentExpression(path) {
            if (memberName(path.node.left) === 'className' && memberName(path.node.left.object) !== 'dataset') {
                addClassNames(path.node.right, path.scope, classNames);
            }
        },
        CallExpression: { exit(path) { handleCallExpression(path, classNames); } },
        JSXAttribute(path) {
            if (!['className', 'class'].includes(path.node.name.name)) return;
            const value = path.node.value;
            if (value?.type === 'JSXExpressionContainer') addClassNames(value.expression, path.scope, classNames);
            else addClassNames(value, path.scope, classNames);
        },
        StringLiteral: addHTML,
        TemplateLiteral: addHTML,
        BinaryExpression: addHTML,
        ConditionalExpression: addHTML,
    });
    return [...classNames];
}

module.exports = { findClassNamesInJS };
