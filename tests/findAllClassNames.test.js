const chai = require('chai');
const expect = chai.expect;

const {findClassNamesInCSS, findClassNamesInHTML, findClassNamesInJS} = require('../lib/utils/findAllClassNames');

describe('findClassNamesInCSS function', () => {
    it('Должен найти все имена классов в заданном содержимом CSS', () => {
        const cssContent = `
            .class1 { 
                color: red; 
            }

            .class2 { 
                background: blue; 
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class1', 'class2']);
    });

    it('Должен возвращать пустой массив, если имена классов не найдены', () => {
        const cssContent = `
            body { 
                color: black; 
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.be.an('array').that.is.empty;
    });
    
    it('Должен обрабатывать несколько имен классов в одном селекторе', () => {
        const cssContent = `
            .class1.class2.class3 { 
                color: red;
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class1', 'class2', 'class3']);
    });

    it('Должен обрабатывать псевдоклассы и псевдоэлементы', () => {
        const cssContent = `
            .class1:hover {
                color: blue;
            } 

            .class2::before { 
                color: red; 
            }

            .class3:nth-child(2) { 
                color: red; 
            }
        `;

        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class1', 'class2', 'class3']);
    });

    it('Должен обрабатывать имена классов цифрами и тире', () => {
        const cssContent = `
            .class-1a .class-2b .a___--1-2_-3 { 
                background: yellow; 
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class-1a', 'class-2b', 'a___--1-2_-3']);
    });

    it('Должен обрабатывать имена классов в запросах @media', () => {
        const cssContent = `
            @media (max-width: 600px) { 
                .class-mobile { 
                    display: none; 
                } 
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class-mobile']);
    });

    it('Должны обрабатывать имена классов внутри сложных селекторов', () => {
        const cssContent = `
            div > .class1 + .class2 ~ .class3:not(.class4) { 
                color: green; 
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class1', 'class2', 'class3', 'class4']);
    });

    it('Не должен включать имена классов из комментариев', () => {
        const cssContent = `
            /* .class-commented { color: pink; }*/ 

            /* 
                .class-commented { color: pink; } 
            */ 

            .class-active { 
                color: pink; /* .class-commented { color: pink; }*/ 
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class-active']).and.not.to.include.members(['class-commented']);
    });

    it('Должен обрабатывать ключевые кадры с именами классов (Проверить)', () => {
        const cssContent = `
            @keyframes .class-animation {
                0% { opacity: 0; } 
                100% { opacity: 1; } 
            } 

            .class-active { 
                animation: .class-animation 2s; 
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class-active']).and.not.to.include.members(['class-animation']);
    });

    it('Должна корректно обрабатывать селекторы атрибутов', () => {
        const cssContent = `
            [href*=".class-attribute"] {
                color: yellow;
            }
            .class-attr {
                display: block;
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class-attr']);
    });

    it('Должна игнорировать селекторы по ID и элементам, смешанные с классовыми селекторами', () => {
        const cssContent = `
            #id-selector .class-with-id {
                color: purple;
            }
            div.class-with-element {
                color: orange;
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class-with-id', 'class-with-element']);
    });

    it('Должна корректно обрабатывать множественные классы в одном селекторе', () => {
        const cssContent = `
            .class1 .class2 .class3 {
                margin: 10px;
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class1', 'class2', 'class3']);
    });

    it('Должна извлекать имена классов из вложенных правил внутри @media и @supports', () => {
        const cssContent = `
            @media (max-width: 800px) {
                .class-media { color: blue; }
            }
            @supports (display: grid) {
                .class-supports { display: grid; }
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class-media', 'class-supports']);
    });

    it('Должна игнорировать правила @font-face и @import', () => {
        const cssContent = `
            @font-face {
                font-family: 'Open Sans';
                src: url('/fonts/OpenSans-Regular-webfont.woff2') format('woff2');
            }
            @import url('https://fonts.googleapis.com/css?family=Roboto');
            .class-font { font-family: 'Open Sans', sans-serif; }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class-font']);
    });

    it('Должна корректно обрабатывать динамические селекторы вроде [attr^=value], [attr$=value], [attr*=value]', () => {
        const cssContent = `
            a[href^="https"] .class-secure {
                color: green;
            }
            a[href$=".org"] .class-organization {
                color: blue;
            }
            a[href*="example"] .class-example {
                color: red;
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['class-secure', 'class-organization', 'class-example']);
    });
});

describe('findClassNamesInHTML function', () => {
    it('Должен найти все имена классов в заданном содержимом HTML', () => {
        const htmlContent = `
            <div class="test-class"></div>
            <span class="another-class test-class"></span>
        `;
        const result = findClassNamesInHTML(htmlContent);
        expect(result).to.deep.equal(['test-class', 'another-class']);
    });

    it('Должен возвращать пустой массив, если имена классов не найдены', () => {
        const htmlContent = '<div></div>';
        const result = findClassNamesInHTML(htmlContent);
        expect(result).to.deep.equal([]);
    });

    it('Должен обрабатывать множественные классы в одном элементе', () => {
        const htmlContent = '<div class="first-class second-class third-class"></div>';
        const result = findClassNamesInHTML(htmlContent);
        expect(result).to.deep.equal(['first-class', 'second-class', 'third-class']);
    });

    it('Должен игнорировать классы внутри комментариев HTML', () => {
        const htmlContent = '<!-- <div class="commented-class"></div> -->';
        const result = findClassNamesInHTML(htmlContent);
        expect(result).to.deep.equal([]);
    });

    it('Должен обрабатывать классы внутри вложенных элементов', () => {
        const htmlContent = `
            <div class="outer-class">
                <span class="inner-class"></span>
            </div>
        `;
        const result = findClassNamesInHTML(htmlContent);
        expect(result).to.deep.equal(['outer-class', 'inner-class']);
    });

    it('Должен игнорировать дубликаты классов', () => {
        const htmlContent = `
            <div class="repeat-class"></div>
            <span class="repeat-class"></span>
        `;
        const result = findClassNamesInHTML(htmlContent);
        expect(result).to.deep.equal(['repeat-class']);
    });

});

describe('findClassNamesInJS function', () => {
    it('Должен найти имена классов, переданные в DOM-методы', () => {
        const jsContent = `
            document.querySelector('.test-class');
            $('.another-class');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['test-class', 'another-class']);
    });

    it('Должен возвращать пустой массив, если имена классов не найдены', () => {
        const jsContent = 'console.log("Hello, world!");';
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Должен игнорировать переменные и выражения, содержащие строки, похожие на классы', () => {
        const jsContent = `
            let className = 'not-a-real-class';
            someFunction('also-not-a-class');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Должен обрабатывать классы, переданные в методы для работы с классами', () => {
        const jsContent = `
            element.classList.add('dynamic-class');
            element.className = 'static-class';
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['dynamic-class', 'static-class']);
    });

    it('Должен обрабатывать классы в шаблонных строках', () => {
        const jsContent = `
            const baseClass = 'base-class';
            const dynamicClass = 'dynamic-class';
            const condition = true;
            const additionalClass = condition ? 'conditional-class' : 'alternative-class';
            element.innerHTML = \`<div class="\${baseClass} \${dynamicClass} \${additionalClass} static-class"></div>\`;
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['base-class', 'dynamic-class', 'conditional-class', 'alternative-class', 'static-class']);
    });

    it('Должен игнорировать дубликаты классов', () => {
        const jsContent = `
            document.querySelector('.repeat-class');
            $('.repeat-class');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['repeat-class']);
    });

    // Дополните с другими тестами по необходимости
});
