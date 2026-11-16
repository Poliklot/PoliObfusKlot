// Resolve only statically known string values. Never execute source code.
const MAX_STATIC_VALUES = 256;

function distinct(values) {
    const result = [...new Set(values)];
    return result.length > 0 && result.length <= MAX_STATIC_VALUES ? result : null;
}

function combineValues(left, right) {
    if (!left || !right || left.length * right.length > MAX_STATIC_VALUES) return null;
    return distinct(left.flatMap(a => right.map(b => a + b)));
}

function extractValueFromNode(node, scope, seen = new Set()) {
    if (!node) return null;
    switch (node.type) {
        case 'StringLiteral':
            return [node.value];
        case 'ConditionalExpression':
            return distinct([
                ...(extractValueFromNode(node.consequent, scope, seen) || []),
                ...(extractValueFromNode(node.alternate, scope, seen) || []),
            ]);
        case 'TemplateLiteral': {
            let values = [''];
            for (let i = 0; i < node.quasis.length; i++) {
                const text = node.quasis[i].value.cooked;
                if (text === null) return null;
                values = combineValues(values, [text]);
                if (i < node.expressions.length) {
                    values = combineValues(values, extractValueFromNode(node.expressions[i], scope, seen));
                }
                if (!values) return null;
            }
            return values;
        }
        case 'ArrayExpression':
            return distinct(node.elements.flatMap(element => extractValueFromNode(element, scope, seen) || []));
        case 'SpreadElement':
            return extractValueFromNode(node.argument, scope, seen);
        case 'Identifier': {
            const binding = scope.getBinding(node.name);
            if (!binding || !binding.constant || seen.has(binding)) return null;
            const nextSeen = new Set(seen).add(binding);
            if (binding.path.isVariableDeclarator()) {
                return extractValueFromNode(binding.path.node.init, binding.path.scope, nextSeen);
            }
            // Resolve known arguments forwarded by local named wrappers only.
            const fn = binding.scope.path;
            if (binding.kind !== 'param' || !fn.isFunctionDeclaration() || !fn.node.id) return null;
            const index = fn.node.params.indexOf(binding.identifier);
            const functionBinding = fn.parentPath.scope.getBinding(fn.node.id.name);
            if (index < 0 || !functionBinding?.constant || !functionBinding.referencePaths.length) return null;
            const values = [];
            for (const reference of functionBinding.referencePaths) {
                const call = reference.parentPath;
                if (!call.isCallExpression() || reference.key !== 'callee') return null;
                const argument = extractValueFromNode(call.node.arguments[index], call.scope, nextSeen);
                if (!argument) return null;
                values.push(...argument);
                if (values.length > MAX_STATIC_VALUES) return null;
            }
            return distinct(values);
        }
        default:
            return null;
    }
}

module.exports = { extractValueFromNode, combineValues };
