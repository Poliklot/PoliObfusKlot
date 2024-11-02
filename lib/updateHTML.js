// utils/updateHTML.js

const path = require('path');
const fs = require('fs').promises;
const glob = require('glob');
const cheerio = require('cheerio');

/**
 * Обновляет имена классов в HTML-файлах на основе предоставленных маппингов.
 * @param {Object} config - Конфигурационный объект с параметрами.
 */
async function updateHTML(config) {
    try {
        const mappingsFilePath = path.join(process.cwd(), './classMappings.json');
        const mappings = JSON.parse(await fs.readFile(mappingsFilePath, 'utf-8'));

        // Получаем список файлов для обработки
        const patterns = config.directories.map(dir => path.join(dir, '**/*.{html,htm}'));
        const files = patterns.flatMap(pattern => glob.sync(pattern, { nodir: true }));

        const excludeFiles = config.exclude || [];

        for (const file of files) {
            if (excludeFiles.includes(path.basename(file))) {
                continue;
            }

            try {
                const htmlContent = await fs.readFile(file, 'utf-8');
                const $ = cheerio.load(htmlContent, { xmlMode: false });

                // Обновляем классы в атрибуте class
                $('[class]').each(function () {
                    const classes = $(this).attr('class').split(/\s+/);
                    const newClasses = classes.map(cls => mappings[cls] || cls);
                    $(this).attr('class', newClasses.join(' '));
                });

                // Дополнительная обработка: Обновление атрибутов с классами в data-атрибутах
                // (Отключим временно, чтобы проверить, не в этом ли проблема)

                // await fs.writeFile(file, $.html());

                // Попробуем использовать beautify для форматирования HTML
                const prettyHtml = $.html({
                    decodeEntities: false,
                });

                await fs.writeFile(file, prettyHtml, 'utf-8');
            } catch (err) {
                console.error(`Ошибка при обработке файла ${file}:`, err.message);
            }
        }
    } catch (err) {
        console.error('Ошибка при обновлении HTML:', err.message);
    }
}

module.exports = { updateHTML };
