const chai = require('chai');
const expect = chai.expect;

const {findClassNamesInCSS} = require('../lib/utils/findAllClassNames');

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
    
    it('Должна корректно обрабатывать сложные селекторы', () => {
        const cssContent = `
            .plan-block_step:nth-last-child(-n + 2) {
                height: auto;
            }
            
            .answer-questions input[type="radio"]:checked + label .circle {
                display: block;
            }
        `;
        const result = findClassNamesInCSS(cssContent);
        expect(result).to.deep.equal(['plan-block_step', 'answer-questions', 'circle']);
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