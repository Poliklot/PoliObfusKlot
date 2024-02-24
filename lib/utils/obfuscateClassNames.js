const fs = require('fs');
const path = require('path');

const generateUniqueClassName = (() => {
    let counter = 0;
    const charSet = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const extraChars = '_-';
    const allChars = charSet + digits + extraChars;

    function incrementString(s) {
        const lastChar = s.slice(-1);
        const rest = s.slice(0, -1);

        if (lastChar !== allChars[allChars.length - 1]) {
            return rest + allChars[allChars.indexOf(lastChar) + 1];
        } else {
            return incrementString(rest) + allChars[0];
        }
    }

    function getNextIdentifier(n) {
        if (n < charSet.length) {
            return charSet[n];
        }

        n -= charSet.length;
        let identifier = 'aa'; // Starting point after 'z'

        for (let i = 0; i < n; ++i) {
            identifier = incrementString(identifier);
        }

        // Ensure first character is always a letter
        if (!charSet.includes(identifier[0])) {
            identifier = 'a' + identifier;
        }

        return identifier;
    }

    return function generateClassName() {
        const identifier = getNextIdentifier(counter);
        counter++;
        return identifier;
    };
})();

const obfuscateClassNames = (classNames) => {
    const mappings = {};

    classNames.forEach(name => {
        mappings[name] = generateUniqueClassName();
    });

    const mappingsFilePath = path.join(process.cwd(), './classMappings.json');
    fs.writeFileSync(mappingsFilePath, JSON.stringify(mappings, null, 2));

    return mappings;
};

module.exports = { obfuscateClassNames };
