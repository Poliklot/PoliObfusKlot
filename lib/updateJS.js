// utils/updateJS.js

const path = require('path');
const fs = require('fs').promises;
const glob = require('glob');
const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;

/**
 * Обновляет имена классов в JS-файлах на основе предоставленных маппингов.
 * @param {Object} config - Конфигурационный объект с параметрами.
 */
async function updateJS(config) {
    try {
        const mappings = JSON.parse(await fs.readFile(path.join(process.cwd(), './classMappings.json'), 'utf-8'));

        const patterns = config.directories.map(dir => path.join(dir, '**/*.{js,jsx,ts,tsx}'));
        const files = patterns.flatMap(pattern => glob.sync(pattern, { nodir: true }));

        const excludeFiles = config.exclude || [];

        for (const file of files) {
            if (excludeFiles.includes(path.basename(file))) {
                continue;
            }

            try {
                const jsContent = await fs.readFile(file, 'utf-8');
                const ast = parser.parse(jsContent, {
                    sourceType: 'unambiguous',
                    plugins: ['jsx', 'typescript'],
                });

                let updated = false;

                traverse(ast, {
                    StringLiteral({ node }) {
                        if (typeof node.value === 'string') {
                            let newValue = node.value;
                            Object.keys(mappings).forEach(originalClassName => {
                                const regex = new RegExp(`\\b${originalClassName}\\b`, 'g');
                                newValue = newValue.replace(regex, mappings[originalClassName]);
                            });
                            if (newValue !== node.value) {
                                node.value = newValue;
                                updated = true;
                            }
                        }
                    },
                    TemplateElement({ node }) {
                        if (typeof node.value.raw === 'string') {
                            let newValueRaw = node.value.raw;
                            let newValueCooked = node.value.cooked;
                            Object.keys(mappings).forEach(originalClassName => {
                                const regex = new RegExp(`\\b${originalClassName}\\b`, 'g');
                                newValueRaw = newValueRaw.replace(regex, mappings[originalClassName]);
                                newValueCooked = newValueCooked.replace(regex, mappings[originalClassName]);
                            });
                            if (newValueRaw !== node.value.raw) {
                                node.value.raw = newValueRaw;
                                node.value.cooked = newValueCooked;
                                updated = true;
                            }
                        }
                    },
                });

                if (updated) {
                    // Используем опцию quotes для сохранения стиля кавычек
                    const { code } = generate(ast, {
                        jsescOption: { quotes: 'single', minimal: true },
                    }, jsContent);

                    await fs.writeFile(file, code);
                }
            } catch (err) {
                console.error(`Ошибка при обработке файла ${file}:`, err.message);
            }
        }
    } catch (err) {
        console.error('Ошибка при обновлении JS:', err.message);
    }
}

module.exports = updateJS;
