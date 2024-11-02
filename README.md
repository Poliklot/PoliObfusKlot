
# PoliObfusKlot

[![npm version](https://img.shields.io/npm/v/poliobfusklot.svg)](https://www.npmjs.com/package/poliobfusklot)
[![npm downloads](https://img.shields.io/npm/dt/poliobfusklot.svg)](https://www.npmjs.com/package/poliobfusklot)
[![License](https://img.shields.io/npm/l/poliobfusklot.svg)](https://github.com/Poliklot/PoliObfusKlot/blob/main/LICENSE)

**PoliObfusKlot** — это инструмент для обфускации имен CSS-классов в вашем проекте. Он помогает защитить ваш код, уменьшая вероятность его чтения и понимания сторонними лицами, а также уменьшает размер файлов за счет сокращения имен классов.

## Особенности

- 🔒 **Обфускация CSS, HTML и JS файлов**: Инструмент проходит по вашим файлам и заменяет имена классов на обфусцированные версии.
- 💡 **Поддержка сложных селекторов и шаблонных строк**: Правильно обрабатывает различные случаи использования классов в коде.
- ⚙️ **Настраиваемая конфигурация**: Вы можете указать, какие директории и файлы обрабатывать, а какие исключать.
- 🚀 **Совместимость с современными стандартами**: Поддерживает JavaScript с использованием JSX и TypeScript.

## Установка

Установите пакет как зависимость для разработки с помощью npm:

```bash
npm install --save-dev poliobfusklot
```

## Использование

### Шаг 1: Создайте файл конфигурации

Создайте файл `poliobfusklot.config.json` в корневой директории вашего проекта со следующим содержимым:

```json
{
  "css": {
    "directories": ["./css"],
    "extensions": [".css"],
    "exclude": []
  },
  "html": {
    "directories": ["./"],
    "extensions": [".html"],
    "exclude": []
  },
  "js": {
    "directories": ["./js"],
    "extensions": [".js"],
    "exclude": []
  }
}
```

Измените пути и расширения в соответствии с вашим проектом.

### Шаг 2: Запустите обфускацию

В командной строке выполните:

```bash
poliobfusklot --config poliobfusklot.config.json
```

Или, если вы установили пакет локально:

```bash
npx poliobfusklot --config poliobfusklot.config.json
```

### Дополнительные параметры

- **--config**: Путь к файлу конфигурации. Если не указан, по умолчанию ищется `poliobfusklot.config.json` в текущей директории.

## Пример конфигурации

```json
{
  "css": {
    "directories": ["src/styles"],
    "extensions": [".css", ".scss"],
    "exclude": ["src/styles/vendor"]
  },
  "html": {
    "directories": ["public"],
    "extensions": [".html"],
    "exclude": []
  },
  "js": {
    "directories": ["src/scripts"],
    "extensions": [".js", ".jsx"],
    "exclude": ["src/scripts/vendor"]
  }
}
```

## Сохранение отображения классов

После обфускации создается файл `classMappings.json`, содержащий отображение исходных имен классов на обфусцированные. Этот файл полезен для отладки, но не рекомендуется включать его в продакшен-сборку.

## Известные ограничения

- ⚠️ Инструмент не обрабатывает динамически сформированные имена классов, которые создаются во время выполнения.
- ⚠️ Если вы используете шаблоны или фреймворки, которые генерируют HTML на сервере, убедитесь, что обфускация не нарушает их работу.

## Вклад

Если вы хотите внести свой вклад в проект, ознакомьтесь с [руководством по участию](https://github.com/Poliklot/PoliObfusKlot/blob/main/CONTRIBUTING.md).

## Лицензия

Этот проект лицензирован под лицензией MIT — подробности смотрите в файле [LICENSE](LICENSE).

Разработано с ❤️ by [Poliklot](https://github.com/Poliklot).
