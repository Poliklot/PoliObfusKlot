const obfuscateCSS = require('./obfuscateCSS');
const updateHTML = require('./updateHTML');
const updateJS = require('./updateJS');

module.exports = function(config) {
    obfuscateCSS(config.css);
    updateHTML(config.html);
    updateJS(config.js);
    console.log("Обфускация успешно завершена!");
}
