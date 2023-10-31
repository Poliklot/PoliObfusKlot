// utils/obfuscateClassNames.js

const crypto = require('crypto');

const obfuscateClassNames = (classNames) => {
    const mappings = {};

    classNames.forEach(name => {
        const hash = crypto.createHash('md5').update(name).digest('hex').substring(0, 4);
        mappings[name] = `o_${hash}`;
    });

    return mappings;
}

module.exports = obfuscateClassNames;
