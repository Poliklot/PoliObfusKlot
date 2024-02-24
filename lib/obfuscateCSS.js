// obfuscateCSS.js

const path = require('path');
const fs = require('fs');
const postcss = require('postcss');

function obfuscateCSS(config) {
    // Чтение мапы из файла
    const mappingsFilePath = path.join(process.cwd(), './classMappings.json');
    const obfuscatedClassNames = JSON.parse(fs.readFileSync(mappingsFilePath, 'utf-8'));

    config.directories.forEach(dir => {
        const resolvedDir = path.resolve(process.cwd(), dir);
        fs.readdirSync(resolvedDir).forEach(file => {
            if (config.exclude?.includes(file) || path.extname(file) !== '.css') return;

            const cssFilePath = path.join(resolvedDir, file);
            const css = fs.readFileSync(cssFilePath, 'utf-8');
    
            const root = postcss.parse(css);
    
            root.walkRules(rule => {
                rule.selectors = rule.selectors.map(selector => {
                    // Замена классов согласно мапе
                    return selector.replace(/\.([a-zA-Z0-9-_]+)/g, (match, className) => {
                        // Используем мапу для замены классов
                        return '.' + (obfuscatedClassNames[className] || className);
                    });
                });
            });
    
            // Создаем новый файл вместо перезаписи существующего
            const newFilePath = path.join(resolvedDir, 'obfuscated-' + file);
            fs.writeFileSync(newFilePath, root.toString());
        });
    });
}

module.exports = obfuscateCSS;
