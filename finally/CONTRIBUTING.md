# Contributing Guide

## Commit Message Format

Этот проект использует [Conventional Commits](https://www.conventionalcommits.org/).

### Формат

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: Новая функциональность
- **fix**: Исправление бага
- **docs**: Изменения в документации
- **style**: Форматирование кода (не влияет на логику)
- **refactor**: Рефакторинг кода
- **perf**: Улучшение производительности
- **test**: Добавление или изменение тестов
- **chore**: Обновление зависимостей, конфигов
- **build**: Изменения в системе сборки
- **ci**: Изменения в CI/CD
- **revert**: Откат изменений

### Примеры

```bash
# Простой коммит
git commit -m "feat: добавить компонент Button"

# С scope
git commit -m "fix(auth): исправить проверку токена"

# С телом сообщения
git commit -m "feat(ui): добавить темную тему

Добавлена поддержка темной темы с автоматическим
переключением в зависимости от системных настроек."

# Breaking change
git commit -m "feat!: изменить API компонента Button

BREAKING CHANGE: свойство 'type' переименовано в 'variant'"
```

### Проверка коммитов

Commitlint автоматически проверяет формат при каждом коммите через lefthook.

Чтобы проверить сообщение вручную:
```bash
echo "feat: test message" | pnpm commitlint
```

## Development Workflow

1. Создайте ветку от `develop`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. Внесите изменения и закоммитьте:
   ```bash
   git add .
   git commit -m "feat: описание изменений"
   ```

3. Git hooks автоматически запустят:
   - Форматирование и линтинг (pre-commit)
   - Проверку формата коммита (commit-msg)

4. Перед push запустятся тесты (pre-push)

5. Создайте Pull Request в `develop`

## Пропуск проверок

Не рекомендуется, но можно пропустить hooks:
```bash
git commit --no-verify
git push --no-verify
```
