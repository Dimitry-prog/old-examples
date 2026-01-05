# Git Hooks с Lefthook

Этот проект использует [Lefthook](https://github.com/evilmartians/lefthook) для управления Git hooks, что обеспечивает качество кода и автоматизацию процессов разработки.

## Что такое Lefthook?

Lefthook - это быстрый и мощный менеджер Git hooks, написанный на Go. Он позволяет:

- Запускать команды параллельно для лучшей производительности
- Настраивать hooks через YAML конфигурацию
- Поддерживать локальные настройки для каждого разработчика
- Интегрироваться с различными инструментами линтинга и тестирования

## Установка

### Автоматическая установка

```bash
# Установка и настройка всех hooks
bun run hooks:setup
```

### Ручная установка

```bash
# Установка Lefthook hooks
bun run hooks:install

# Или напрямую
bunx lefthook install
```

## Настроенные Hooks

### Pre-commit

Выполняется перед каждым коммитом:

- **Линтинг и форматирование** - проверка и исправление кода
- **Проверка типов** - TypeScript type checking
- **Проверка консольных выводов** - предупреждение о console.log
- **Проверка TODO/FIXME** - информация о комментариях
- **Валидация package.json** - проверка корректности JSON
- **Проверка размера файлов** - предупреждение о больших файлах

### Pre-push

Выполняется перед отправкой изменений:

- **Тесты** - запуск всех тестов
- **Сборка** - проверка успешной сборки проекта
- **Финальный линтинг** - последняя проверка кода
- **Проверка типов** - финальная TypeScript проверка

### Commit-msg

Проверка формата сообщений коммитов:

- Валидация согласно Conventional Commits
- Поддерживаемые типы: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

### Post-checkout / Post-merge

Автоматические действия после переключения веток или слияния:

- Установка зависимостей при изменении `package.json`
- Очистка старых артефактов сборки

## Локальная настройка

### Создание локальной конфигурации

```bash
# Копируем пример конфигурации
cp lefthook-local.yml.example lefthook-local.yml
```

### Примеры локальных настроек

```yaml
# lefthook-local.yml

# Отключить проверку типов для быстрых коммитов
pre-commit:
  commands:
    type-check:
      skip: true

# Добавить кастомные команды
pre-commit:
  commands:
    my-custom-check:
      run: echo "Running my custom check..."
      
# Отключить весь pre-push hook
pre-push:
  skip: true
```

## Команды

### Основные команды

```bash
# Запуск конкретного hook
bun run hooks:run pre-commit
bun run hooks:run pre-push

# Установка hooks
bun run hooks:install

# Удаление hooks
bun run hooks:uninstall

# Полная настройка (рекомендуется для новых разработчиков)
bun run hooks:setup
```

### Прямые команды Lefthook

```bash
# Проверка версии
bunx lefthook version

# Запуск hook в dry-run режиме (без выполнения)
bunx lefthook run pre-commit --dry-run

# Запуск конкретной команды из hook
bunx lefthook run pre-commit --commands=lint-staged

# Показать все доступные hooks
bunx lefthook list
```

## Отладка

### Проверка конфигурации

```bash
# Валидация конфигурации
bunx lefthook run pre-commit --dry-run

# Подробный вывод
bunx lefthook run pre-commit --verbose
```

### Пропуск hooks

```bash
# Пропустить все pre-commit hooks
git commit --no-verify

# Пропустить конкретный hook через переменную окружения
LEFTHOOK=0 git commit

# Пропустить только конкретные команды
LEFTHOOK_EXCLUDE=type-check,test git commit
```

## Интеграция с IDE

### VS Code

Добавьте в `.vscode/settings.json`:

```json
{
  "git.enableCommitSigning": true,
  "git.alwaysSignOff": true,
  "git.inputValidation": "warn",
  "git.inputValidationLength": 50,
  "git.inputValidationSubjectLength": 50
}
```

### WebStorm/IntelliJ

1. Откройте Settings → Version Control → Git
2. Включите "Use credential helper"
3. В разделе "Commit" включите "Analyze code" и "Check TODO"

## Troubleshooting

### Проблемы с установкой

```bash
# Переустановка hooks
bun run hooks:uninstall
bun run hooks:install

# Проверка прав доступа
ls -la .git/hooks/
```

### Медленные hooks

```bash
# Отключить параллельное выполнение в локальной конфигурации
# lefthook-local.yml
pre-commit:
  parallel: false
```

### Конфликты с другими hook менеджерами

```bash
# Удалить старые hooks
rm -rf .git/hooks/*
bun run hooks:install
```

## Лучшие практики

### Для команды

1. **Не изменяйте основную конфигурацию** без обсуждения с командой
2. **Используйте локальную конфигурацию** для персональных настроек
3. **Тестируйте hooks** перед коммитом изменений в конфигурацию
4. **Документируйте изменения** в конфигурации

### Для разработчиков

1. **Запускайте hooks локально** перед push
2. **Не пропускайте hooks** без веской причины
3. **Обновляйте зависимости** регулярно
4. **Сообщайте о проблемах** с hooks команде

## Дополнительные ресурсы

- [Официальная документация Lefthook](https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Hooks документация](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

## Поддержка

Если у вас возникли проблемы с Git hooks:

1. Проверьте документацию выше
2. Запустите `bun run hooks:setup` для переустановки
3. Создайте issue в репозитории проекта
4. Обратитесь к команде разработки