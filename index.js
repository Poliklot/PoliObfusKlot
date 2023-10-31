#!/usr/bin/env node

// Зависимости, которые могут понадобиться
const path = require('path');

// Импортируем функции из других файлов (если они экспортируются из этих файлов)
const obfuscateCSS = require(path.join(__dirname, 'obfuscateCSS.js'));
const updateHTML = require(path.join(__dirname, 'updateHTML.js'));
const updateJS = require(path.join(__dirname, 'updateJS.js'));

// Вызываем функции для обфускации
obfuscateCSS();
updateHTML();
updateJS();

console.log("Обфускация успешно завершена!");
