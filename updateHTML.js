// updateHTML.js
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const mappings = require('./classMappings.json');
const htmlFilePath = path.resolve(__dirname, 'dist/index.html');
const html = fs.readFileSync(htmlFilePath, 'utf-8');
const $ = cheerio.load(html);

Object.keys(mappings).forEach((originalClassName) => {
    $(`.${originalClassName}`).removeClass(originalClassName).addClass(mappings[originalClassName]);
});

fs.writeFileSync(htmlFilePath, $.html()); // перезаписываем исходный HTML файл
