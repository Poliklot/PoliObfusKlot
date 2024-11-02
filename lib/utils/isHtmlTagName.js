// utils/isHtmlTagName.js

/**
 * Проверяет, является ли имя HTML-тегом.
 * @param {string} name - Имя для проверки.
 * @returns {boolean} true, если имя является тегом HTML.
 */
function isHtmlTagName(name) {
    const htmlTags = new Set([
        'div', 'span', 'input', 'button', 'img', 'a', 'p',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'li',
        'table', 'tr', 'td', 'th', 'form', 'textarea',
        'select', 'option', 'iframe', 'script', 'style',
        'link', 'meta', 'head', 'body', 'html',
    ]);
    return htmlTags.has(name.toLowerCase());
}

module.exports = {
    isHtmlTagName,
};
