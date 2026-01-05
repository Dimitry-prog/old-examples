# Commitlint Guide

Руководство по использованию Commitlint для стандартизации сообщений коммитов в соответствии с Conventional Commits.

## Обзор

Commitlint обеспечивает:
- Единообразие сообщений коммитов в команде
- Автоматическую генерацию changelog
- Семантическое версионирование
- Лучшую читаемость истории проекта
- Автоматизацию релизных процессов

## Стандарт Conventional Commits

### Формат сообщения

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Компоненты

#### Type (обязательно)
Тип изменения:

- `feat` ✨ - новая функциональность
- `fix` 🐛 - исправление бага
- `docs` 📚 - изменения в документации
- `style` 💎 - форматирование, отсутствующие точки с запятой
- `refactor` 📦 - рефакторинг кода
- `perf` 🚀 - улучшение производительности
- `test` 🚨 - добавление или изменение тестов
- `build` 🛠️ - изменения в системе сборки или зависимостях
- `ci` ⚙️ - изменения в CI конфигурации
- `chore` ♻️ - другие изменения
- `revert` 🗑️ - откат предыдущего коммита
- `hotfix` 🔥 - критические исправления
- `wip` 🚧 - work in progress

#### Scope (необязательно)
Область изменения:

```
feat(auth): add OAuth2 integration
fix(api): handle timeout errors
docs(readme): update installation guide
```

**Доступные области:**
- `components`, `ui`, `forms`, `layout`, `auth`
- `api`, `hooks`, `utils`, `lib`, `types`, `contexts`, `providers`
- `pages`, `routes`, `router`
- `styles`, `assets`, `icons`
- `config`, `build`, `deps`, `env`
- `tests`, `e2e`, `mocks`
- `docs`, `readme`, `changelog`
- `ci`, `cd`, `scripts`
- `lint`, `format`, `hooks`
- `security`, `perf`, `a11y`, `i18n`

#### Subject (обязательно)
Краткое описание изменения:

- Используйте повелительное наклонение ("add", а не "added")
- Не ставьте точку в конце
- Максимум 80 символов
- Начинайте с маленькой буквы

#### Body (необязательно)
Подробное описание:

- Объясните ЧТО и ПОЧЕМУ, а не КАК
- Максимум 100 символов на строку
- Отделите от заголовка пустой строкой

#### Footer (необязательно)
Дополнительная информация:

- Ссылки на issues: `Fixes #123`, `Closes #456`
- Breaking changes: `BREAKING CHANGE: описание`
- Отделите от тела пустой строкой

## Примеры коммитов

### Простые коммиты

```bash
feat: add user authentication
fix: resolve memory leak in data processing
docs: update API documentation
style: format code with prettier
refactor: simplify error handling logic
perf: optimize database queries
test: add unit tests for auth service
```

### С областью (scope)

```bash
feat(auth): implement OAuth2 login
fix(api): handle network timeout errors
docs(readme): add installation instructions
style(components): format Button component
refactor(hooks): simplify useAuth implementation
perf(bundle): reduce initial load time
test(utils): add validation helper tests
```

### С телом сообщения

```bash
feat(auth): add two-factor authentication

Implement TOTP-based 2FA using authenticator apps.
Users can enable 2FA in their profile settings.
Backup codes are generated for account recovery.

Closes #234
```

### С breaking changes

```bash
feat(api): redesign user authentication API

Replace JWT tokens with session-based authentication.
This provides better security and easier token management.

BREAKING CHANGE: JWT tokens are no longer supported.
Update client code to use session cookies instead.

Closes #456
```

### Исправления

```bash
fix(forms): prevent double submission

Add loading state and disable submit button during form submission.
This prevents duplicate requests and improves user experience.

Fixes #789
```

## Использование

### Интерактивное создание коммитов

```bash
# Интерактивный помощник
npm run commit

# Следуйте инструкциям для создания правильного коммита
```

### Ручное создание коммитов

```bash
# Обычный коммит
git commit -m "feat(auth): add login functionality"

# С телом сообщения
git commit -m "feat(auth): add login functionality

Implement basic email/password authentication.
Users can now sign in and access protected routes."
```

### Проверка коммитов

```bash
# Проверить последний коммит
npm run commit:lint-last

# Проверить последние 10 коммитов
npm run commit:lint-all

# Проверить историю коммитов
npm run commit:check

# Проверить конкретный диапазон
npm run commit:check 5        # Последние 5 коммитов
npm run commit:check HEAD~5 HEAD  # Диапазон коммитов
```

## Конфигурация

### commitlint.config.js

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'header-max-length': [2, 'always', 100],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
  },
}
```

### Интеграция с Git hooks

Commitlint автоматически интегрирован с Lefthook:

```yaml
# lefthook.yml
commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}
```

### Шаблон коммитов

Используйте `.gitmessage` как шаблон:

```bash
git config commit.template .gitmessage
```

## VS Code интеграция

### Рекомендуемые расширения

- **GitLens** - расширенная Git интеграция
- **Conventional Commits** - помощник для создания коммитов
- **Commitlint** - валидация коммитов в редакторе

### Настройки

```json
{
  "git.inputValidation": "always",
  "git.inputValidationLength": 100,
  "git.template": ".gitmessage",
  "conventionalCommits.showEditor": true
}
```

## Автоматизация

### Генерация changelog

```bash
# Установка conventional-changelog
npm install --save-dev conventional-changelog-cli

# Генерация changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

### Семантическое версионирование

```bash
# Установка semantic-release
npm install --save-dev semantic-release

# Автоматический релиз
npx semantic-release
```

### GitHub Actions

```yaml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint commits
        run: npx commitlint --from HEAD~10 --to HEAD --verbose
      
      - name: Release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Правила валидации

### Обязательные правила

- `type-empty`: тип не может быть пустым
- `subject-empty`: описание не может быть пустым
- `header-max-length`: заголовок максимум 100 символов
- `type-enum`: тип должен быть из разрешенного списка

### Рекомендуемые правила

- `subject-case`: описание в нижнем регистре
- `subject-full-stop`: без точки в конце описания
- `body-leading-blank`: пустая строка перед телом
- `footer-leading-blank`: пустая строка перед футером

### Кастомные правила

```javascript
// commitlint.config.js
export default {
  rules: {
    'custom-scope-enum': [2, 'always', [
      'components', 'api', 'hooks', 'utils'
    ]],
    'subject-min-length': [2, 'always', 3],
    'body-max-line-length': [2, 'always', 100],
  }
}
```

## Отладка и устранение проблем

### Частые ошибки

1. **Неправильный тип**
   ```
   ❌ feat: add new feature
   ✅ feat: add user authentication
   ```

2. **Заглавная буква в описании**
   ```
   ❌ feat: Add user authentication
   ✅ feat: add user authentication
   ```

3. **Точка в конце описания**
   ```
   ❌ feat: add user authentication.
   ✅ feat: add user authentication
   ```

4. **Слишком длинный заголовок**
   ```
   ❌ feat: add very long description that exceeds the maximum allowed length for commit headers
   ✅ feat: add user authentication with OAuth2
   ```

### Исправление коммитов

```bash
# Исправить последний коммит
git commit --amend

# Интерактивный rebase для исправления нескольких коммитов
git rebase -i HEAD~3

# Использовать fixup для объединения коммитов
git commit --fixup HEAD~1
git rebase -i --autosquash HEAD~2
```

### Пропуск валидации

```bash
# Пропустить commitlint (не рекомендуется)
git commit --no-verify -m "emergency fix"

# Отключить commitlint временно
LEFTHOOK=0 git commit -m "emergency fix"
```

## Лучшие практики

### 1. Атомарные коммиты

Каждый коммит должен представлять одно логическое изменение:

```bash
# ✅ Хорошо
feat(auth): add login form
feat(auth): add logout functionality
fix(auth): handle invalid credentials

# ❌ Плохо
feat(auth): add login, logout and fix validation
```

### 2. Описательные сообщения

```bash
# ✅ Хорошо
fix(api): handle timeout errors in user service
feat(ui): add loading spinner to submit buttons
refactor(hooks): extract common auth logic

# ❌ Плохо
fix: bug
feat: new stuff
refactor: cleanup
```

### 3. Использование scope

```bash
# ✅ Хорошо - четко указывает область
feat(auth): add OAuth2 integration
fix(api): resolve memory leak in data processing
docs(readme): update installation guide

# ❌ Плохо - слишком общее
feat: add new feature
fix: fix bug
docs: update docs
```

### 4. Breaking changes

```bash
# ✅ Хорошо - четко описывает изменения
feat(api): redesign authentication endpoints

BREAKING CHANGE: Authentication endpoints now use different URL structure.
Update API calls from /auth/login to /v2/auth/signin.

# ❌ Плохо - неясно что изменилось
feat: update auth
```

### 5. Ссылки на issues

```bash
# ✅ Хорошо
fix(forms): prevent double submission

Fixes #123
Closes #456

# ✅ Также хорошо
feat(auth): add two-factor authentication

Implements the 2FA feature requested in #789.
Users can now enable TOTP-based authentication.

Closes #789
```

## Интеграция с командой

### Обучение команды

1. **Документация**: поделитесь этим руководством
2. **Примеры**: покажите хорошие и плохие коммиты
3. **Инструменты**: настройте VS Code расширения
4. **Практика**: используйте `npm run commit` для обучения

### Постепенное внедрение

1. **Этап 1**: Добавить commitlint без блокировки
2. **Этап 2**: Включить предупреждения в CI
3. **Этап 3**: Блокировать невалидные коммиты
4. **Этап 4**: Автоматизировать релизы

### Мониторинг качества

```bash
# Регулярно проверяйте качество коммитов
npm run commit:check

# Анализируйте статистику типов коммитов
git log --oneline --grep="^feat" --since="1 month ago" | wc -l
git log --oneline --grep="^fix" --since="1 month ago" | wc -l
```

## Заключение

Commitlint обеспечивает:

- ✅ Единообразие сообщений коммитов
- ✅ Лучшую читаемость истории проекта
- ✅ Автоматическую генерацию changelog
- ✅ Семантическое версионирование
- ✅ Улучшенную командную работу

Следуйте принципам:
- Используйте стандартные типы коммитов
- Пишите описательные сообщения
- Делайте атомарные коммиты
- Ссылайтесь на issues
- Документируйте breaking changes
