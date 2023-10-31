# PoliObfusKlot

[![version](https://img.shields.io/badge/version-0.0.1-brightgreen)](https://github.com/Poliklot/PoliObfusKlot/releases/tag/v0.0.1) 
[![license](https://img.shields.io/badge/license-MIT-blue)](https://github.com/Poliklot/PoliObfusKlot/blob/main/LICENSE)

**PoliObfusKlot** — это инструмент для обфускации CSS-классов, предоставляющий простой и эффективный способ скрыть исходные имена классов в вашем проекте.

## Особенности

- 🚀 Быстрая обфускация CSS-классов.
- 📜 Создание карты соответствия между оригинальными и обфусцированными классами.
- 🔄 Автоматическое обновление HTML и JS файлов с новыми именами классов.
  
## Установка

```bash
npm i poliobfusklot
```

## Использование
После установки `poliobfusklot`, вы можете использовать его для обфускации ваших CSS-классов. Чтобы добавить возможность запуска обфускации напрямую из командной строки, выполните следующие шаги:

1. Добавьте скрипт `obfuscate` в ваш файл `package.json`:

```json
"scripts": {
  "obfuscate": "poliobfusklot"
}
```

Для запуска процесса обфускации выполните команду:

```bash
npm run obfuscate
```

## Вклад

Если вы хотите внести свой вклад в проект, ознакомьтесь с [руководством по участию](https://github.com/Poliklot/PoliObfusKlot/blob/main/CONTRIBUTING.md).

## Лицензия

PoliObfusKlot распространяется под лицензией MIT. Детали можно прочитать в файле [LICENSE](https://github.com/Poliklot/PoliObfusKlot/blob/main/LICENSE).

Разработано с ❤️ by [Poliklot](https://github.com/Poliklot).