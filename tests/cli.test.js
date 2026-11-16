const { expect } = require('chai');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

describe('CLI', () => {
    it('updates CSS, HTML and JS consistently in an isolated project', () => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'polio-cli-'));
        try {
            fs.writeFileSync(path.join(directory, 'style.css'), '.audit-card { color: red; }');
            fs.writeFileSync(path.join(directory, 'index.html'), '<div class="audit-card">Hello</div>');
            fs.writeFileSync(path.join(directory, 'script.js'), "document.querySelector('.audit-card');");
            const config = Object.fromEntries(['css', 'html', 'js'].map(kind => [kind, { directories: [directory] }]));
            fs.writeFileSync(path.join(directory, 'config.json'), JSON.stringify(config));
            execFileSync(process.execPath, [path.join(__dirname, '../cli.js'), '--config', 'config.json'], { cwd: directory });
            const mapping = JSON.parse(fs.readFileSync(path.join(directory, 'classMappings.json'), 'utf8'));
            expect(mapping['audit-card']).to.equal('a');
            for (const name of ['style.css', 'index.html', 'script.js']) {
                expect(fs.readFileSync(path.join(directory, name), 'utf8')).not.to.include('audit-card');
            }
            expect(fs.readFileSync(path.join(directory, 'style.css'), 'utf8')).to.include('.a');
            expect(fs.readFileSync(path.join(directory, 'index.html'), 'utf8')).to.include('class="a"');
            expect(fs.readFileSync(path.join(directory, 'script.js'), 'utf8')).to.include("'.a'");
        } finally {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });
});
