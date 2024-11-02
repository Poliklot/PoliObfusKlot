const chai = require('chai');
const expect = chai.expect;

const { findClassNamesInJS } = require('../lib/utils/findAllClassNames');

describe('findClassNamesInJS function', () => {
    it('Should find class names passed to DOM methods', () => {
        const jsContent = `
            document.querySelector('.test-class');
            $('.another-class');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['test-class', 'another-class']);
    });

    it('Should return an empty array if no class names are found', () => {
        const jsContent = 'console.log("Hello, world!");';
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Should ignore variables and expressions containing strings similar to classes', () => {
        const jsContent = `
            let className = 'not-a-real-class';
            someFunction('also-not-a-class');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Should handle classes passed to methods for working with classes', () => {
        const jsContent = `
            element.classList.add('dynamic-class');
            element.className = 'static-class';
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['dynamic-class', 'static-class']);
    });

    it('Should handle classes in template strings', () => {
        const jsContent = `
            const baseClass = 'base-class';
            const dynamicClass = 'dynamic-class';
            const condition = true;
            const additionalClass = condition ? 'conditional-class' : 'alternative-class';
            element.innerHTML = \`<div class="\${baseClass} \${dynamicClass} \${additionalClass} static-class"></div>\`;
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result.sort()).to.deep.equal(['base-class', 'dynamic-class', 'conditional-class', 'alternative-class', 'static-class'].sort());
    });

    it('Should ignore array methods and other non-class strings', () => {
        const jsContent = `
            const n = t ? "unshift" : "push";
            return e.split(" ").forEach((e => {
                i.eventsListeners[e] || (i.eventsListeners[e] = []);
                i.eventsListeners[e][n](d);
            })), i;
        `;
        const classNames = findClassNamesInJS(jsContent);
        expect(classNames).to.not.include('unshift');
        expect(classNames).to.not.include('push');
    });

    it('Should ignore duplicate classes', () => {
        const jsContent = `
            document.querySelector('.repeat-class');
            $('.repeat-class');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['repeat-class']);
    });

    it('Should find class names in a complex scenario using BurgerMenu function', () => {
        const jsContent = `
            function BurgerMenu() {
                const $header = document.querySelector('.header');
                const $headerTop = document.querySelector('.header .header__top');
                const $headerBurger = document.querySelector('.header .header-burger');
                const $headerTopBackdrop = document.querySelector('.header .header__top-backdrop');
                const $modalClose = $headerTop.querySelector('.modal__close');
                const $buttonCall = $headerTop.querySelector('.burger-menu_contacts_btn__call');
                const submenuButtonsList = $headerTop.querySelectorAll('.burger-menu_submenu_item[data-submenubtn]');
                const selectItemsList = $headerTop.querySelectorAll('.burger-menu_nav__select');
            }
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result.sort()).to.deep.equal([
            'header',
            'header__top',
            'header-burger',
            'header__top-backdrop',
            'modal__close',
            'burger-menu_contacts_btn__call',
            'burger-menu_submenu_item',
            'burger-menu_nav__select'
        ].sort());
    });

    it('Should find class names added to elements and ignore non-class attributes', () => {
        const jsContent = `
            const e = '<svg height="38" ... xmlns="http://www.w3.org/2000/svg"></svg>';
            const t = document.createElement("span");
            t.innerHTML = e;
            t.className = "button__loader";
            this.$submit.insertAdjacentElement("afterbegin", t);
            requestAnimationFrame(() => {
                t.classList.add("loading");
                t.classList.add("active");
            });
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['button__loader', 'loading', 'active']);
    });

    // New test cases added below

    it('Should ignore class names in comments', () => {
        const jsContent = `
            // This is a comment with a class name '.commented-class'
            /* Another comment with a class 'another-commented-class' */
            /*
                Multi-line comment with class 'multi-line-comment-class'
            */
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Should ignore class names in regex patterns', () => {
        const jsContent = `
            const regex = /\.some-class/;
            const matches = string.match(/class="([^"]*)"/g);
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Should handle escaped quotes in strings', () => {
        const jsContent = `
            element.classList.add('escaped-\\'class\\'-name');
            element.classList.add("escaped-\\"class\\"-name");
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['escaped-\'class\'-name', 'escaped-"class"-name']);
    });

    it('Should ignore dynamically constructed class names', () => {
        const jsContent = `
            const dynamicClass = 'dynamic-' + 'class';
            element.classList.add(dynamicClass);
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Should handle class names in array of strings', () => {
        const jsContent = `
            const classes = ['class-one', 'class-two', 'class-three'];
            element.classList.add(...classes);
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['class-one', 'class-two', 'class-three']);
    });

    it('Should not pick up class names from ES6 class declarations', () => {
        const jsContent = `
            class MyClass {
                constructor() {
                    this.className = 'my-class';
                }
            }
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['my-class']);
    });

    it('Should handle class names in attribute selectors', () => {
        const jsContent = `
            document.querySelector('[class="selected-class"]');
            document.querySelector('[class~="another-class"]');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['selected-class', 'another-class']);
    });

    it('Should handle multiple class names in one string', () => {
        const jsContent = `
            element.className = 'class-one class-two class-three';
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['class-one', 'class-two', 'class-three']);
    });

    it('Should handle class names in JSX (React components)', () => {
        const jsContent = `
            const element = <div className="jsx-class another-jsx-class"></div>;
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['jsx-class', 'another-jsx-class']);
    });

    it('Should ignore class names in property names', () => {
        const jsContent = `
            const obj = {
                'some-class': 'value',
                'another-class': 'value'
            };
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Should handle class names with special characters', () => {
        const jsContent = `
            element.classList.add('class-with-dash');
            element.classList.add('class_with_underscore');
            element.classList.add('class:with:colon');
            element.classList.add('class/with/slash');
            element.classList.add('class$with$dollar');
            element.classList.add('class*with*asterisk');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([
            'class-with-dash',
            'class_with_underscore',
            'class:with:colon',
            'class/with/slash',
            'class$with$dollar',
            'class*with*asterisk'
        ]);
    });

    it('Should handle class names in complex nested templates', () => {
        const jsContent = `
            const html = \`
                <div class="\${condition ? 'conditional-class' : 'default-class'}">
                    <span class="\${'nested-' + dynamicPart}"></span>
                </div>
            \`;
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['conditional-class', 'default-class']);
    });

    it('Should not include class names from string concatenations', () => {
        const jsContent = `
            const className = 'class-' + 'name';
            element.className = className;
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Should handle class names in data attributes', () => {
        const jsContent = `
            element.setAttribute('data-class', 'data-class-name');
            element.dataset.className = 'data-set-class-name';
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Should handle class names in jQuery methods', () => {
        const jsContent = `
            $('.jquery-class').addClass('added-class');
            $('.jquery-class').removeClass('removed-class');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['jquery-class', 'added-class', 'removed-class']);
    });

    it('Should handle multiple class names in classList methods', () => {
        const jsContent = `
            element.classList.add('class-one', 'class-two', 'class-three');
            element.classList.remove('class-four', 'class-five');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['class-one', 'class-two', 'class-three', 'class-four', 'class-five']);
    });

    it('Should handle class names in conditional statements', () => {
        const jsContent = `
            if (condition) {
                element.classList.add('conditional-class');
            } else {
                element.classList.add('alternative-class');
            }
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['conditional-class', 'alternative-class']);
    });

    it('Should handle class names with Unicode characters', () => {
        const jsContent = `
            element.classList.add('класс-с-юникодом');
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['класс-с-юникодом']);
    });

    it('Should handle class names in nested function calls', () => {
        const jsContent = `
            addClassToElement(element, 'nested-class');
            function addClassToElement(el, className) {
                el.classList.add(className);
            }
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['nested-class']);
    });

    it('Should not fail on invalid JavaScript syntax', () => {
        const jsContent = `
            function invalidSyntax() {
                var a = ;
            }
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });

    it('Should handle class names in variables passed to classList methods', () => {
        const jsContent = `
            const className = 'variable-class';
            element.classList.add(className);
        `;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['variable-class']);
    });

    it('Должен обрабатывать имена классов в минифицированном коде без пробелов', () => {
        const jsContent = `element.classList.add('minified-class');element.className='another-minified-class';`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['minified-class', 'another-minified-class']);
    });
    
    it('Должен извлекать имена классов из минифицированного кода с короткими именами переменных', () => {
        const jsContent = `a.b('short-class');c.d='another-short-class';`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['short-class', 'another-short-class']);
    });
    
    it('Должен обрабатывать имена классов в минифицированном jQuery-коде', () => {
        const jsContent = `$('.minified-jquery-class').addClass('added-class');$('.another-class').removeClass('removed-class');`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['minified-jquery-class', 'added-class', 'another-class', 'removed-class']);
    });
    
    it('Должен обрабатывать имена классов в минифицированном коде без точек с запятой', () => {
        const jsContent = `element.classList.add('no-semicolon-class')element.className='another-class'`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['no-semicolon-class', 'another-class']);
    });
    
    it('Должен обрабатывать имена классов в минифицированном коде с сжатым синтаксисом', () => {
        const jsContent = `e.classList.add('compressed-class'),e.className='another-compressed-class'`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['compressed-class', 'another-compressed-class']);
    });
    
    it('Не должен путаться из-за строковых литералов, похожих на код, в минифицированном коде', () => {
        const jsContent = `var s="element.classList.add('fake-class')";eval(s);`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });
    
    it('Должен обрабатывать имена классов в минифицированном коде с встроенными вызовами функций', () => {
        const jsContent = `!function(){e.classList.add('inline-function-class')}();`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['inline-function-class']);
    });
    
    it('Должен игнорировать имена классов, сформированные через конкатенацию строк', () => {
        const jsContent = `e.classList.add('concat-'+'class');`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });
    
    it('Должен игнорировать имена классов, полученные из массивов или объектов', () => {
        const jsContent = `e.classList.add(['array','class'][1]);e.classList.add(obj['className']);`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });
    
    it('Должен обрабатывать имена классов в минифицированном коде с тернарными операторами', () => {
        const jsContent = `e.classList.add(cond?'true-class':'false-class');`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['true-class', 'false-class']);
    });
    
    it('Должен корректно работать с имена классов в минифицированных шаблонных строках', () => {
        const jsContent = `e.innerHTML='<div class="'+(cond?'conditional-class':'default-class')+'"></div>';`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['conditional-class', 'default-class']);
    });
    
    it('Должен игнорировать комментарии в минифицированном коде', () => {
        const jsContent = `/* Комментарий с классом 'commented-class' */e.classList.add('real-class');`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['real-class']);
    });
    
    it('Должен корректно обрабатывать Unicode-имена классов в минифицированном коде', () => {
        const jsContent = `e.classList.add('юникод-класс');`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['юникод-класс']);
    });
    
    it('Должен игнорировать имена классов в свойствах объектов при минификации', () => {
        const jsContent = `var o={'class-name':'value'};`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });
    
    it('Должен обрабатывать имена классов в минифицированных React-компонентах', () => {
        const jsContent = `const e=React.createElement('div',{className:'react-class'});`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['react-class']);
    });
    
    it('Должен корректно обрабатывать несколько имён классов в одной строке при минификации', () => {
        const jsContent = `e.className='class-one class-two class-three';`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal(['class-one', 'class-two', 'class-three']);
    });
    
    it('Должен игнорировать имена классов, заданные через переменные, в минифицированном коде', () => {
        const jsContent = `var c='dynamic-class';e.classList.add(c);`;
        const result = findClassNamesInJS(jsContent);
        expect(result).to.deep.equal([]);
    });
    
});
