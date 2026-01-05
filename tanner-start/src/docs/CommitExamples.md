# Commit Message Examples

Примеры хороших и плохих сообщений коммитов для обучения команды.

## ✅ Хорошие примеры

### Простые коммиты

```bash
feat: add user registration
fix: resolve login redirect issue
docs: update API documentation
style: format components with prettier
refactor: simplify error handling
perf: optimize image loading
test: add Button component tests
build: update dependencies
ci: add automated deployment
chore: update .gitignore
```

### С областью (scope)

```bash
feat(auth): implement OAuth2 login
fix(api): handle network timeout errors
docs(readme): add quick start guide
style(components): format Button component
refactor(hooks): extract common auth logic
perf(bundle): reduce initial load time
test(utils): add validation helper tests
build(deps): update React to v19
ci(github): add pull request checks
chore(config): update TypeScript settings
```

### С подробным описанием

```bash
feat(auth): add two-factor authentication

Implement TOTP-based 2FA using authenticator apps.
Users can enable 2FA in their profile settings.
Backup codes are generated for account recovery.

Closes #234
```

```bash
fix(forms): prevent double form submission

Add loading state and disable submit button during form processing.
This prevents duplicate API calls and improves user experience.
Also add proper error handling for network failures.

Fixes #567
```

```bash
refactor(api): restructure user service

Extract common CRUD operations into base service class.
This reduces code duplication and improves maintainability.
All existing functionality remains unchanged.

Related to #890
```

### С breaking changes

```bash
feat(api): redesign authentication endpoints

Replace JWT-based auth with session-based authentication.
This provides better security and easier token management.

BREAKING CHANGE: JWT tokens are no longer supported.
Update client code to use session cookies instead.
See migration guide in docs/auth-migration.md

Closes #123
```

```bash
refactor(components): update Button API

Simplify Button component props and improve accessibility.
New design system tokens are now used for consistent styling.

BREAKING CHANGE: Button component props have changed.
- `variant` prop renamed to `appearance`
- `size` prop now uses design tokens (sm, md, lg)
- `color` prop removed, use `appearance` instead

Migration:
- <Button variant="primary" size="small" color="blue" />
+ <Button appearance="primary" size="sm" />

Closes #456
```

### Множественные issues

```bash
fix(validation): improve form error handling

- Add proper error messages for all validation rules
- Improve accessibility with aria-describedby
- Fix focus management after validation errors
- Add loading states for async validation

Fixes #123, #456, #789
Closes #101
```

### Revert коммиты

```bash
revert: "feat(auth): add OAuth2 integration"

This reverts commit 1234567890abcdef.
OAuth2 integration caused issues with existing users.
Will be re-implemented after fixing user migration.

Reopens #234
```

## ❌ Плохие примеры

### Неправильный формат

```bash
# Нет типа
❌ add login functionality
✅ feat: add login functionality

# Неправильный тип
❌ feature: add login functionality
✅ feat: add login functionality

# Заглавная буква в описании
❌ feat: Add login functionality
✅ feat: add login functionality

# Точка в конце
❌ feat: add login functionality.
✅ feat: add login functionality

# Слишком длинный заголовок
❌ feat: add very comprehensive user authentication system with OAuth2 integration and two-factor authentication
✅ feat(auth): add comprehensive authentication system
```

### Неописательные сообщения

```bash
# Слишком общие
❌ fix: bug
❌ feat: new feature
❌ update: stuff
❌ change: things

# Лучше
✅ fix(forms): resolve validation error display
✅ feat(auth): add password reset functionality
✅ refactor(api): improve error handling
✅ style(components): update Button styling
```

### Неправильное использование типов

```bash
# Неправильный тип для изменения
❌ feat: fix login bug
✅ fix: resolve login redirect issue

# Неправильный тип для документации
❌ chore: update README
✅ docs: update installation guide

# Неправильный тип для рефакторинга
❌ feat: improve code structure
✅ refactor: simplify component hierarchy
```

### Плохие области (scope)

```bash
# Слишком общие
❌ feat(app): add new feature
❌ fix(code): fix issue
❌ docs(files): update docs

# Лучше
✅ feat(auth): add login functionality
✅ fix(forms): resolve validation issue
✅ docs(api): update endpoint documentation
```

### Неправильное описание breaking changes

```bash
# Неясно что изменилось
❌ feat: update API

BREAKING CHANGE: API changed

# Лучше
✅ feat(api): redesign user endpoints

BREAKING CHANGE: User API endpoints restructured.
- GET /users/:id moved to GET /api/v2/users/:id
- POST /users now requires additional validation
- Response format changed from { user: {...} } to { data: {...} }

Migration guide: docs/api-migration.md
```

## Типичные сценарии

### Новая функциональность

```bash
# Простая функция
feat(auth): add logout button

# Сложная функция
feat(dashboard): implement user analytics

Add comprehensive analytics dashboard for users.
Includes charts for activity, engagement, and growth metrics.
Data is fetched from new analytics API endpoints.

Closes #234
```

### Исправление багов

```bash
# Простое исправление
fix(forms): resolve email validation

# Критическое исправление
hotfix(security): patch XSS vulnerability

Fix potential XSS attack vector in user input processing.
All user inputs are now properly sanitized before rendering.
This affects comment and profile description fields.

Security advisory: GHSA-xxxx-yyyy-zzzz
Fixes #CRITICAL-123
```

### Рефакторинг

```bash
# Простой рефакторинг
refactor(utils): extract common validation logic

# Большой рефакторинг
refactor(architecture): migrate to new state management

Replace Redux with Zustand for simpler state management.
This reduces bundle size and improves developer experience.
All existing functionality is preserved.

Related to #456
```

### Обновление зависимостей

```bash
# Минорные обновления
build(deps): update development dependencies

# Мажорные обновления
build(deps): upgrade React to v19

Update React and related packages to latest versions.
This includes new features like automatic batching
and improved TypeScript support.

BREAKING CHANGE: React 19 requires Node.js 16+
Update your development environment accordingly.

Closes #789
```

### Документация

```bash
# Обновление документации
docs(api): add authentication examples

# Новая документация
docs: add contributing guidelines

Create comprehensive guide for new contributors.
Includes setup instructions, coding standards,
and pull request process.

Closes #101
```

## Инструменты для команды

### Алиасы Git

```bash
# Добавьте в ~/.gitconfig
[alias]
  c = "!npm run commit"
  cl = "!npm run commit:lint-last"
  ca = "!npm run commit:check"
```

### Шпаргалка

Создайте файл `COMMIT_CHEATSHEET.md` для команды:

```markdown
# Commit Cheatsheet

## Быстрые команды
- `npm run commit` - интерактивное создание коммита
- `git commit -m "type: description"` - быстрый коммит
- `npm run commit:check` - проверка истории

## Типы коммитов
- feat ✨ - новая функциональность
- fix 🐛 - исправление бага
- docs 📚 - документация
- style 💎 - форматирование
- refactor 📦 - рефакторинг
- perf 🚀 - производительность
- test 🚨 - тесты

## Формат
type(scope): description

body

footer
```

## Заключение

Хорошие коммиты:
- Следуют стандарту Conventional Commits
- Имеют четкие и описательные сообщения
- Содержат необходимую контекстную информацию
- Ссылаются на соответствующие issues
- Документируют breaking changes

Это улучшает:
- Читаемость истории проекта
- Командную работу
- Автоматизацию процессов
- Качество релизов
