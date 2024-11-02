const chai = require('chai');
const expect = chai.expect;

const {findClassNamesInHTML} = require('../lib/utils/findAllClassNames');

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