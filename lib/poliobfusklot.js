const path = require('path');
const fs = require('fs');

const obfuscateCSS = require('./obfuscateCSS');
const { updateHTML } = require('./updateHTML');
const updateJS = require('./updateJS');
const {findAllClassNames} = require('../lib/utils/findAllClassNames');
const {obfuscateClassNames} = require('../lib/utils/obfuscateClassNames');

module.exports = function(config) {
    const allClasses = findAllClassNames(config);
    obfuscateClassNames(allClasses);
    obfuscateCSS(config.css);
    updateHTML(config.html);
    // updateJS(config.js);
    console.log("Обфускация успешно завершена!");
}
