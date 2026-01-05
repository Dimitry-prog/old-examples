# CI/CD Configuration

## Lefthook (Git Hooks)

Lefthook автоматически запускается при git операциях:

### Pre-commit
Запускается перед каждым коммитом:
- ✅ Форматирование кода (Biome)
- ✅ Линтинг (Biome)
- ✅ Проверка типов (TypeScript)
- ✅ Запуск тестов для измененных файлов

### Commit-msg
Проверяет формат сообщения коммита (Conventional Commits):
- `feat: добавить новую функцию`
- `fix: исправить баг`
- `docs: обновить документацию`
- `style: форматирование кода`
- `refactor: рефакторинг`
- `test: добавить тесты`
- `chore: обновить зависимости`

### Pre-push
Запускается перед push:
- ✅ Полная проверка кода (Biome check)
- ✅ Запуск всех тестов
- ✅ Проверка покрытия кода тестами

## GitHub Actions

### CI Workflow (`.github/workflows/ci.yml`)
Запускается на push и PR в ветки `main` и `develop`:
1. Линтинг и проверка типов
2. Запуск тестов с покрытием
3. Сборка проекта
4. Загрузка артефактов

### Deploy Workflow (`.github/workflows/deploy.yml`)
Запускается при push в `main`:
1. Сборка проекта
2. Деплой на GitHub Pages

## Команды

```bash
# Установить git hooks
pnpm prepare

# Пропустить pre-commit hook (не рекомендуется)
git commit --no-verify

# Пропустить pre-push hook (не рекомендуется)
git push --no-verify

# Запустить проверки вручную
pnpm check
pnpm test
pnpm test:coverage
```

## Локальная настройка

Создайте файл `lefthook-local.yml` для переопределения настроек:

```yaml
# Отключить проверку coverage
pre-push:
  commands:
    test-coverage:
      skip: true

# Отключить тесты при коммите
pre-commit:
  commands:
    test-related:
      skip: true
```
