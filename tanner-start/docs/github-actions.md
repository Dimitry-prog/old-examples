# GitHub Actions CI/CD

Документация по настройке и использованию GitHub Actions в проекте.

## Обзор

Проект использует GitHub Actions для автоматизации следующих процессов:

- **Continuous Integration (CI)** - автоматическая проверка кода
- **Pull Request проверки** - валидация PR перед слиянием
- **Автоматические релизы** - создание релизов на основе коммитов
- **Управление зависимостями** - обновление и аудит зависимостей
- **Очистка репозитория** - удаление старых артефактов и кешей

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Основной workflow для проверки качества кода, запускается при:
- Push в ветки `main`, `master`, `develop`
- Pull Request в эти же ветки

**Jobs:**
- **code-quality** - проверка TypeScript, линтинг, форматирование
- **tests** - unit и integration тесты с покрытием
- **build** - сборка приложения и анализ bundle
- **security** - аудит безопасности и проверка дублирования
- **quality-checks** - дополнительные проверки качества
- **compatibility** - проверка совместимости с разными версиями Node.js

### 2. PR Checks Workflow (`.github/workflows/pr-checks.yml`)

Специализированные проверки для Pull Request:

**Features:**
- **Детекция изменений** - запуск только необходимых проверок
- **Валидация PR title** - проверка соответствия Conventional Commits
- **Проверка коммитов** - валидация всех коммитов в PR
- **Условные проверки** - запуск тестов только при изменении кода
- **Проверка размера PR** - предупреждения о больших PR
- **Комментарии с покрытием** - автоматические комментарии с результатами тестов

### 3. Release Workflow (`.github/workflows/release.yml`)

Автоматическое создание релизов:

**Процесс:**
1. **Анализ коммитов** - определение типа релиза (major/minor/patch)
2. **Pre-release тесты** - полная проверка перед релизом
3. **Генерация changelog** - автоматическое создание changelog
4. **Обновление версии** - bump версии в package.json
5. **Создание GitHub Release** - с артефактами и release notes
6. **Post-release уведомления** - создание deployment issue

### 4. Dependency Updates (`.github/workflows/dependency-updates.yml`)

Автоматическое управление зависимостями:

**Функции:**
- **Еженедельная проверка** - поиск устаревших пакетов
- **Автоматические patch обновления** - безопасные обновления
- **Аудит безопасности** - поиск уязвимостей
- **Создание issues** - уведомления о необходимых обновлениях
- **Автоматические PR** - для patch обновлений

### 5. Cleanup Workflow (`.github/workflows/cleanup.yml`)

Ежедневная очистка репозитория:

**Очистка:**
- **Workflow runs** - удаление старых запусков (оставляем 50 последних)
- **Артефакты** - удаление файлов старше 30 дней
- **Кеши** - удаление кешей старше 7 дней
- **Ветки** - удаление слитых веток старше 30 дней

## Конфигурация

### Secrets

Необходимые secrets для работы workflows:

```bash
# GitHub token (автоматически доступен)
GITHUB_TOKEN

# Дополнительные secrets (если нужны)
CODECOV_TOKEN      # Для загрузки покрытия в Codecov
SLACK_WEBHOOK      # Для уведомлений в Slack
DEPLOY_KEY         # Для автоматического деплоя
```

### Variables

Переменные окружения для workflows:

```bash
# Основные настройки
NODE_VERSION=18
BUN_VERSION=latest

# Настройки тестов
TEST_TIMEOUT=15
COVERAGE_THRESHOLD=80

# Настройки релизов
RELEASE_BRANCHES=main,master
```

### Branch Protection

Настройки защиты веток в `.github/settings.yml`:

```yaml
branches:
  - name: main
    protection:
      required_status_checks:
        contexts:
          - "All Checks Passed"
          - "Code Quality"
          - "Tests"
          - "Build"
      required_pull_request_reviews:
        required_approving_review_count: 1
        require_code_owner_reviews: true
```

## Использование

### Создание Pull Request

1. **Название PR** должно соответствовать Conventional Commits:
   ```
   feat(auth): add OAuth2 integration
   fix(api): handle timeout errors
   docs: update installation guide
   ```

2. **Автоматические проверки** запустятся автоматически
3. **Покрытие тестов** будет добавлено в комментарий
4. **Все проверки** должны пройти для возможности слияния

### Создание релиза

Релизы создаются автоматически при push в main/master:

1. **Анализ коммитов** определяет тип релиза:
   - `feat:` → minor версия
   - `fix:` → patch версия
   - `BREAKING CHANGE:` → major версия

2. **Ручной релиз** через workflow_dispatch:
   ```bash
   # В GitHub UI: Actions → Release → Run workflow
   # Выберите тип релиза: auto/patch/minor/major/prerelease
   ```

### Управление зависимостями

1. **Автоматические обновления** patch версий создают PR
2. **Еженедельные отчеты** создают issues с устаревшими пакетами
3. **Аудит безопасности** создает high-priority issues при уязвимостях

### Мониторинг

**Проверка статуса workflows:**
```bash
# Через GitHub CLI
gh run list --limit 10

# Проверка конкретного workflow
gh run view <run-id>
```

**Логи и отладка:**
- Все workflows имеют подробные логи
- Используйте `echo` для отладочной информации
- Проверяйте статус в GitHub UI

## Оптимизация

### Кеширование

Все workflows используют кеширование для ускорения:

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.bun/install/cache
      node_modules
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
```

### Параллельное выполнение

Jobs выполняются параллельно где возможно:

```yaml
jobs:
  code-quality:
    # Быстрые проверки
  tests:
    # Тесты параллельно с проверками
  build:
    # Сборка параллельно с тестами
```

### Условное выполнение

Проверки запускаются только при необходимости:

```yaml
- name: Run tests
  if: needs.changes.outputs.src == 'true'
  run: bun run test
```

## Troubleshooting

### Частые проблемы

1. **Workflow не запускается**
   - Проверьте синтаксис YAML
   - Убедитесь в правильности triggers
   - Проверьте permissions

2. **Тесты падают в CI**
   - Проверьте переменные окружения
   - Убедитесь в наличии всех зависимостей
   - Проверьте timeout настройки

3. **Кеш не работает**
   - Проверьте ключи кеширования
   - Убедитесь в правильности путей
   - Очистите кеш вручную если нужно

### Отладка

```yaml
# Добавьте отладочную информацию
- name: Debug info
  run: |
    echo "Node version: $(node --version)"
    echo "Bun version: $(bun --version)"
    echo "Working directory: $(pwd)"
    echo "Environment: $NODE_ENV"
```

### Мониторинг производительности

```yaml
# Добавьте измерение времени
- name: Run tests with timing
  run: |
    start_time=$(date +%s)
    bun run test
    end_time=$(date +%s)
    echo "Tests took $((end_time - start_time)) seconds"
```

## Лучшие практики

### 1. Безопасность

- Используйте `secrets` для чувствительных данных
- Не логируйте секреты
- Ограничивайте permissions для jobs
- Используйте pinned versions для actions

### 2. Производительность

- Кешируйте зависимости
- Используйте параллельное выполнение
- Оптимизируйте Docker образы
- Ограничивайте timeout для jobs

### 3. Надежность

- Добавляйте retry для нестабильных операций
- Используйте условное выполнение
- Мониторьте статус workflows
- Настройте уведомления о сбоях

### 4. Поддержка

- Документируйте все workflows
- Используйте понятные названия jobs
- Добавляйте комментарии в сложные места
- Регулярно обновляйте actions

## Интеграции

### Codecov

```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v4
  with:
    file: ./coverage/lcov.info
    flags: unittests
```

### Slack уведомления

```yaml
- name: Slack notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Deployment

```yaml
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  run: |
    # Deployment commands
```

## Заключение

GitHub Actions обеспечивают:

- ✅ Автоматическую проверку качества кода
- ✅ Безопасные и надежные релизы
- ✅ Эффективное управление зависимостями
- ✅ Автоматическую очистку репозитория
- ✅ Полную интеграцию с GitHub экосистемой

Следуйте документации и лучшим практикам для максимальной эффективности CI/CD процессов.
