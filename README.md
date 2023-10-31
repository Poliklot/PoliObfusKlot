# PoliObfusKlot

[![version](https://img.shields.io/badge/version-0.0.1-brightgreen)](https://github.com/Poliklot/PoliObfusKlot/releases/tag/v0.0.1) 
[![license](https://img.shields.io/badge/license-MIT-blue)](https://github.com/Poliklot/PoliObfusKlot/blob/main/LICENSE)

**PoliObfusKlot** — это инструмент для обфускации CSS-классов, предоставляющий простой и эффективный способ скрыть исходные имена классов в вашем проекте.

## Особенности

- 🚀 Быстро и безопасно обфусцирует CSS-классы.
- 📜 Генерирует карту соответствия оригинальных и обфусцированных имен классов.
- 🔄 Автоматически обновляет ваши HTML и JS файлы для соответствия новым именам классов.
- 🛠 Поддержка конфигурации для указания конкретных директорий и файлов.
  
## Установка

```bash
npm i poliobfusklot --save-dev
```

## Использование
После установки poliobfusklot, создайте конфигурационный файл poliobfusklot.config.json в корневой директории вашего проекта, указав необходимые параметры для обфускации. Пример:

```json
{
    "html": {
      "directories": ["./dist"],
      "exclude": ["template.html"]
    },
    "css": {
      "directories": ["./dist/assets/css"]
    },
    "js": {
      "directories": ["./dist/assets/scripts"]
    }
}
```

Запустите обфускацию с помощью следующей команды:

```bash
npx poliobfusklot
```

## Вклад

Если вы хотите внести свой вклад в проект, ознакомьтесь с [руководством по участию](https://github.com/Poliklot/PoliObfusKlot/blob/main/CONTRIBUTING.md).

## Лицензия

PoliObfusKlot распространяется под лицензией MIT. Детали можно прочитать в файле [LICENSE](https://github.com/Poliklot/PoliObfusKlot/blob/main/LICENSE).

Разработано с ❤️ by [Poliklot](https://github.com/Poliklot).