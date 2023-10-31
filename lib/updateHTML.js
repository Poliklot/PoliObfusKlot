// updateHTML.js

const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

function updateHTML(config) {
    const mappings = require(path.join(process.cwd(), './classMappings.json'));

    config.directories.forEach(dir => {
        const resolvedDir = path.resolve(process.cwd(), dir);
        fs.readdirSync(resolvedDir).forEach(file => {
            if (config.exclude.includes(file) || path.extname(file) !== '.html') return;

            const htmlFilePath = path.join(resolvedDir, file);
            const html = fs.readFileSync(htmlFilePath, 'utf-8');
            const $ = cheerio.load(html);

            Object.keys(mappings).forEach((originalClassName) => {
                $(`.${originalClassName}`).removeClass(originalClassName).addClass(mappings[originalClassName]);
            });

            fs.writeFileSync(htmlFilePath, $.html());
        });
    });
}

module.exports = updateHTML;
