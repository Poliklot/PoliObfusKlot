#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const poliobfusklot = require('./lib/poliobfusklot');

const configFile = path.join(process.cwd(), 'poliobfusklot.config.json');

if (!fs.existsSync(configFile)) {
  console.error("Не найден файл конфигурации 'poliobfusklot.config.json'.");
  process.exit(1);
}

const config = require(configFile);
poliobfusklot(config);
