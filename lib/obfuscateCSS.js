// obfuscateCSS.js

const path = require('path');
const fs = require('fs');
const postcss = require('postcss');
const crypto = require('crypto');

function obfuscateCSS(config) {
    const obfuscatedClassNames = {};
    const generateObfuscatedName = (originalName) => {
        const hash = crypto.createHash('md5').update(originalName).digest('hex').substring(0, 4);
        return `o_${hash}`;
    }

    config.directories.forEach(dir => {
        const resolvedDir = path.resolve(process.cwd(), dir);
        fs.readdirSync(resolvedDir).forEach(file => {
            if (config.exclude.includes(file) || path.extname(file) !== '.css') return;

            const cssFilePath = path.join(resolvedDir, file);
            const css = fs.readFileSync(cssFilePath, 'utf-8');
    
            const root = postcss.parse(css);
    
            root.walkRules(rule => {
                rule.selectors = rule.selectors.map(selector => {
                    return selector.replace(/\.([a-zA-Z0-9-_]+)/g, (match, className) => {
                        if (!obfuscatedClassNames[className]) {
                            obfuscatedClassNames[className] = generateObfuscatedName(className);
                        }
                        return '.' + obfuscatedClassNames[className];
                    });
                });
            });
    
            fs.writeFileSync(cssFilePath, root.toString());
        });
    });

    fs.writeFileSync(path.join(process.cwd(), './classMappings.json'), JSON.stringify(obfuscatedClassNames, null, 2));
}

module.exports = obfuscateCSS;
