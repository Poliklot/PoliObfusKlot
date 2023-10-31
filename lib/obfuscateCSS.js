const path = require('path');
const fs = require('fs');
const postcss = require('postcss');
const crypto = require('crypto');

const cssFilePath = path.resolve(__dirname, 'dist/assets/css/style.f17018e9.css');
const css = fs.readFileSync(cssFilePath, 'utf-8');

const obfuscatedClassNames = {};

const generateObfuscatedName = (originalName) => {
    const hash = crypto.createHash('md5').update(originalName).digest('hex').substring(0, 4);
    return `o_${hash}`;
}

const root = postcss.parse(css);

root.walkRules(rule => {
    rule.selectors = rule.selectors.map(selector => {
        // Мы используем регулярное выражение для поиска всех классов в селекторе
        return selector.replace(/\.([a-zA-Z0-9-_]+)/g, (match, className) => {
            if (!obfuscatedClassNames[className]) {
                obfuscatedClassNames[className] = generateObfuscatedName(className);
            }
            return '.' + obfuscatedClassNames[className];
        });
    });
});

fs.writeFileSync(cssFilePath, root.toString());
fs.writeFileSync('./classMappings.json', JSON.stringify(obfuscatedClassNames, null, 2));

console.log('Обфускация завершена!');
