// utils/findAllClassNames.js

const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const postcss = require('postcss');

const findAllClassNames = (directory) => {
    const allClassNames = new Set();

    // Находим имена классов в HTML файлах
    const htmlFiles = fs.readdirSync(directory).filter(file => file.endsWith('.html'));
    htmlFiles.forEach(file => {
        const htmlContent = fs.readFileSync(path.join(directory, file), 'utf-8');
        const $ = cheerio.load(htmlContent);
        $('[class]').each(function () {
            const classes = $(this).attr('class').split(' ');
            classes.forEach(cls => allClassNames.add(cls));
        });
    });

    // Находим имена классов в JS файлах
    const jsFiles = fs.readdirSync(directory).filter(file => file.endsWith('.js'));
    jsFiles.forEach(file => {
        const jsContent = fs.readFileSync(path.join(directory, file), 'utf-8');
        const jsClassMatches = jsContent.match(/'(\w+)'|"(\w+)"|\.(\w+)/g);
        if (jsClassMatches) {
            jsClassMatches.forEach(match => {
                const className = match.replace(/['".]/g, '');
                allClassNames.add(className);
            });
        }
    });

    // Находим имена классов в CSS файлах
    const cssFiles = fs.readdirSync(directory).filter(file => file.endsWith('.css'));
    cssFiles.forEach(file => {
        const cssContent = fs.readFileSync(path.join(directory, file), 'utf-8');
        const root = postcss.parse(cssContent);
        root.walkRules(rule => {
            rule.selectors.forEach(selector => {
                const cssClassMatches = selector.match(/\.([a-zA-Z0-9-_]+)/g);
                if (cssClassMatches) {
                    cssClassMatches.forEach(match => {
                        const className = match.replace('.', '');
                        allClassNames.add(className);
                    });
                }
            });
        });
    });

    return Array.from(allClassNames);
}

module.exports = findAllClassNames;
