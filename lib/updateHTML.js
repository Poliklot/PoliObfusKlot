// updateHTML.js

const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const updateHTML = (config) => {
    const mappingsFilePath = path.join(process.cwd(), './classMappings.json');
    const mappings = JSON.parse(fs.readFileSync(mappingsFilePath, 'utf-8'));

    config.directories.forEach(dir => {
        const resolvedDir = path.resolve(process.cwd(), dir);
        fs.readdirSync(resolvedDir).forEach(file => {
            if (config.exclude?.includes(file) || path.extname(file) !== '.html') return;

            const htmlFilePath = path.join(resolvedDir, file);
            const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
            const $ = cheerio.load(htmlContent);

            Object.keys(mappings).forEach((className, index) => {
                $(`.${className}`).each(function() {
                    $(this).removeClass(className).addClass(mappings[className]);
                });
            });

            const newFilePath = path.join(resolvedDir, 'obfuscated-' + file);
            fs.writeFileSync(newFilePath, $.html());
        });
    });
}

module.exports = {updateHTML};
