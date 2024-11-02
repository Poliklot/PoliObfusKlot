// utils/obfuscateCSS.js

const path = require('path');
const fs = require('fs').promises;
const glob = require('glob');
const postcss = require('postcss');

/**
 * Обфусцирует имена классов в CSS-файлах на основе предоставленных маппингов.
 * @param {Object} config - Конфигурационный объект с параметрами.
 */
async function obfuscateCSS(config) {
    try {
        // Чтение мапы из файла
        const mappingsFilePath = path.join(process.cwd(), './classMappings.json');
        const obfuscatedClassNames = JSON.parse(await fs.readFile(mappingsFilePath, 'utf-8'));

        // Получаем список файлов для обработки
        const patterns = config.directories.map(dir => path.join(dir, '**/*.{css,scss,sass,less}'));
        const files = patterns.flatMap(pattern => glob.sync(pattern, { nodir: true }));

        // Фильтруем файлы по расширениям и исключаем ненужные
        const extensions = config.extensions || ['.css', '.scss', '.sass', '.less'];
        const excludeFiles = config.exclude || [];

        for (const file of files) {
            if (excludeFiles.includes(path.basename(file)) || !extensions.includes(path.extname(file))) {
                continue;
            }

            try {
                const css = await fs.readFile(file, 'utf-8');
                const root = postcss.parse(css);

                // Обфусцируем селекторы
                root.walkRules(rule => {
                    rule.selectors = rule.selectors.map(selector => {
                        return selector.replace(/\.([A-Za-z0-9_-]+)/g, (match, className) => {
                            return '.' + (obfuscatedClassNames[className] || className);
                        });
                    });
                });

                // Обфусцируем значения свойств
                root.walkDecls(decl => {
                    decl.value = decl.value.replace(/\.([A-Za-z0-9_-]+)/g, (match, className) => {
                        return '.' + (obfuscatedClassNames[className] || className);
                    });
                });

                // Обфусцируем ключевые кадры
                root.walkAtRules('keyframes', atRule => {
                    const newName = obfuscatedClassNames[atRule.params] || atRule.params;
                    atRule.params = newName;
                });

                // Обфусцируем использование ключевых кадров
                root.walkDecls(decl => {
                    if (decl.prop === 'animation' || decl.prop === 'animation-name') {
                        decl.value = decl.value.replace(/\b([A-Za-z0-9_-]+)\b/g, (match, name) => {
                            return obfuscatedClassNames[name] || name;
                        });
                    }
                });

                await fs.writeFile(file, root.toString());
            } catch (err) {
                console.error(`Ошибка при обработке файла ${file}:`, err.message);
            }
        }
    } catch (err) {
        console.error('Ошибка при обфускации CSS:', err.message);
    }
}

module.exports = obfuscateCSS;
