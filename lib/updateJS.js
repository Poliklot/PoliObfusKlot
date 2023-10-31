// updateJS.js

const path = require('path');
const fs = require('fs');

function updateJS(config) {
    const mappings = require(path.join(process.cwd(), './classMappings.json'));

    config.directories.forEach(dir => {
        const resolvedDir = path.resolve(process.cwd(), dir);
        fs.readdirSync(resolvedDir).forEach(file => {
            if (config.exclude.includes(file) || path.extname(file) !== '.js') return;

            const jsFilePath = path.join(resolvedDir, file);
            const jsContent = fs.readFileSync(jsFilePath, 'utf-8');

            let updatedContent = jsContent;
            Object.keys(mappings).forEach((originalClassName) => {
                const singleQuoteRegex = new RegExp(`'${originalClassName}'(?![a-zA-Z0-9_-])`, 'g');
                const doubleQuoteRegex = new RegExp(`"${originalClassName}"(?![a-zA-Z0-9_-])`, 'g');
                const noQuotesRegex = new RegExp(`\\.${originalClassName}(?![a-zA-Z0-9_-])`, 'g');

                updatedContent = updatedContent.replace(singleQuoteRegex, `'${mappings[originalClassName]}'`);
                updatedContent = updatedContent.replace(doubleQuoteRegex, `"${mappings[originalClassName]}"`);
                updatedContent = updatedContent.replace(noQuotesRegex, `.${mappings[originalClassName]}`);
            });

            fs.writeFileSync(jsFilePath, updatedContent);
        });
    });
}

module.exports = updateJS;
