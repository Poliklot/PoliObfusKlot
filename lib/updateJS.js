// updateJS.js

const path = require('path');
const fs = require('fs');
const mappings = require('./classMappings.json');

const scriptsFolderPath = path.resolve(__dirname, 'dist/assets/scripts');
const filesToExclude = ["example1.js", "example2.js"]; // список файлов для исключения

// Получаем список всех файлов в папке
const files = fs.readdirSync(scriptsFolderPath);

// Фильтруем список файлов, исключая нежелательные
const filesToProcess = files.filter(file => !filesToExclude.includes(file));

filesToProcess.forEach(file => {
    const jsFilePath = path.join(scriptsFolderPath, file);
    const jsContent = fs.readFileSync(jsFilePath, 'utf-8');

    let updatedContent = jsContent;
    Object.keys(mappings).forEach((originalClassName) => {
        const singleQuoteRegex = new RegExp(`'${originalClassName}'`, 'g');
        const doubleQuoteRegex = new RegExp(`"${originalClassName}"`, 'g');
        const noQuotesRegex = new RegExp(`\\.${originalClassName}\\b`, 'g');
        
        updatedContent = updatedContent.replace(singleQuoteRegex, `'${mappings[originalClassName]}'`);
        updatedContent = updatedContent.replace(doubleQuoteRegex, `"${mappings[originalClassName]}"`);
        updatedContent = updatedContent.replace(noQuotesRegex, `.${mappings[originalClassName]}`);
    });

    fs.writeFileSync(jsFilePath, updatedContent);
});
