#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const poliobfusklot = require('./lib/poliobfusklot');

// Получаем аргументы командной строки
const args = process.argv.slice(2);
let configFilePath;

// Парсим аргументы
if (args.length > 0 && args[0] === '--config' && args[1]) {
  configFilePath = path.resolve(process.cwd(), args[1]);
} else {
  // Если аргумент не передан, используем конфигурацию по умолчанию
  configFilePath = path.join(process.cwd(), 'poliobfusklot.config.json');
}

if (!fs.existsSync(configFilePath)) {
  console.error(`Не найден файл конфигурации '${configFilePath}'.`);
  process.exit(1);
}

let config;

try {
  config = require(configFilePath);
} catch (error) {
  console.error(`Ошибка при загрузке файла конфигурации '${configFilePath}':`, error.message);
  process.exit(1);
}

(async () => {
  try {
    await poliobfusklot(config);
  } catch (error) {
    console.error('Ошибка при выполнении обфускации:', error.message);
    process.exit(1);
  }
})();
