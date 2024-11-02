// tests/obfuscation.test.js

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const obfuscateCSS = require('../lib/obfuscateCSS');
const { updateHTML } = require('../lib/updateHTML');
const updateJS = require('../lib/updateJS');

describe('Обфускация классов и обновление файлов', () => {
    const testDir = path.join(__dirname, 'fixtures');
    const mappingsFilePath = path.join(process.cwd(), './classMappings.json');
    const originalFiles = {};

    before(() => {
        // Сохраняем оригинальное содержимое файлов
        const filesToBackup = [
            path.join(testDir, 'style.css'),
            path.join(testDir, 'nested', 'style2.css'),
            path.join(testDir, 'index.html'),
            path.join(testDir, 'nested', 'page.html'),
            path.join(testDir, 'script.js'),
            path.join(testDir, 'nested', 'script2.js'),
        ];

        filesToBackup.forEach(file => {
            originalFiles[file] = fs.readFileSync(file, 'utf-8');
        });

        // Создаем маппинг классов
        const mappings = {
            'test-class': 'a',
            'another-class': 'b',
            'responsive-class': 'c',
        };
        fs.writeFileSync(mappingsFilePath, JSON.stringify(mappings, null, 2));
    });

    after(() => {
        // Восстанавливаем оригинальные файлы
        // Object.keys(originalFiles).forEach(file => {
        //     fs.writeFileSync(file, originalFiles[file]);
        // });

        // Удаляем маппинг после тестов
        fs.unlinkSync(mappingsFilePath);
    });

    it('Должен корректно обфусцировать CSS-файлы', async () => {
        await obfuscateCSS({ directories: [testDir] });

        const cssContent = fs.readFileSync(path.join(testDir, 'style.css'), 'utf-8');
        expect(cssContent).to.include('.a');
        expect(cssContent).to.include('.b');
        expect(cssContent).to.not.include('.test-class');
        expect(cssContent).to.not.include('.another-class');

        const nestedCssContent = fs.readFileSync(path.join(testDir, 'nested', 'style2.css'), 'utf-8');
        expect(nestedCssContent).to.include('.c');
        expect(nestedCssContent).to.not.include('.responsive-class');
    });

    it('Должен корректно обновить HTML-файлы', async () => {
        await updateHTML({ directories: [testDir] });

        const htmlContent = fs.readFileSync(path.join(testDir, 'index.html'), 'utf-8');
        expect(htmlContent).to.include('class="a"');
        expect(htmlContent).to.include('class="b"');
        expect(htmlContent).to.not.include('class="test-class"');
        expect(htmlContent).to.not.include('class="another-class"');

        const nestedHtmlContent = fs.readFileSync(path.join(testDir, 'nested', 'page.html'), 'utf-8');
        expect(nestedHtmlContent).to.include('class="c"');
        expect(nestedHtmlContent).to.not.include('class="responsive-class"');
    });

    it('Должен корректно обновить JS-файлы', async () => {
        await updateJS({ directories: [testDir] });

        const jsContent = fs.readFileSync(path.join(testDir, 'script.js'), 'utf-8');
        expect(jsContent).to.include("document.querySelector('.a')");
        expect(jsContent).to.not.include("document.querySelector('.test-class')");

        const nestedJsContent = fs.readFileSync(path.join(testDir, 'nested', 'script2.js'), 'utf-8');
        expect(nestedJsContent).to.include("const classes = 'c b'");
        expect(nestedJsContent).to.not.include("const classes = 'responsive-class another-class'");
    });
});
