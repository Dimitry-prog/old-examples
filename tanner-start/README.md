# Modern React Stack

> Полнофункциональный стартовый шаблон для создания современных React приложений с лучшими практиками и инструментами

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.13-cyan.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## ✨ Особенности

- ⚡ **Быстрая разработка** - Vite для мгновенного HMR и быстрой сборки
- 🎨 **Современный UI** - Tailwind CSS v4 + shadcn/ui компоненты
- 🔒 **Типобезопасность** - TypeScript с строгой конфигурацией
- 🧪 **Тестирование** - Vitest и React Testing Library из коробки
- 🚀 **Производительность** - Оптимизированная сборка и code splitting
- 📦 **Современный стек** - React 19, TanStack Router, Zustand, React Query
- 🎯 **Качество кода** - Biome для линтинга и форматирования
- 🔄 **CI/CD** - GitHub Actions для автоматизации
- 📋 **Пакетный менеджер** - Только pnpm для консистентности и производительности
- 🛡️ **Безопасность** - Commitlint, Git hooks, security audits

## 📋 Содержание

- [Быстрый старт](#быстрый-старт)
- [Технологический стек](#технологический-стек)
- [Структура проекта](#структура-проекта)
- [Разработка](#разработка)
- [Тестирование](#тестирование)
- [Сборка](#сборка)
- [Развертывание](#развертывание)
- [Документация](#документация)
- [Лицензия](#лицензия)

## 🚀 Быстрый старт

### Требования

- [pnpm](https://pnpm.io/) >= 8.0.0
- Node.js >= 18.0.0
- Git

### Установка

> ⚠️ **Важно**: Этот проект использует только pnpm как пакетный менеджер

```bash
# Клонировать репозиторий
git clone https://github.com/yourusername/modern-react-stack.git
cd modern-react-stack

# Установить pnpm (если не установлен)
npm install -g pnpm

# Установить зависимости
pnpm install

# Запустить dev сервер
pnpm run dev
```

Приложение будет доступно по адресу [http://localhost:5173](http://localhost:5173)

### Быстрые команды

```bash
# Разработка
pnpm run dev              # Запустить dev сервер
pnpm run build            # Собрать для production
pnpm run preview          # Предпросмотр production сборки

# Качество кода
pnpm run lint             # Проверить код
pnpm run lint:fix         # Исправить проблемы автоматически
pnpm run format           # Форматировать код
pnpm run type-check       # Проверить типы TypeScript

# Тестирование
pnpm run test             # Запустить тесты
pnpm run test:ui          # Запустить тесты с UI
pnpm run test:coverage    # Проверить покрытие тестами

# Git hooks
pnpm run hooks:install    # Установить Git hooks
pnpm run commit           # Интерактивное создание коммита
```

## 🛠 Технологический стек

### Core

- **[React 19](https://react.dev/)** - Библиотека для создания пользовательских интерфейсов
- **[TypeScript 5.7](https://www.typescriptlang.org/)** - Типизированный JavaScript
- **[Vite 7](https://vitejs.dev/)** - Быстрый сборщик и dev сервер
- **[Bun](https://bun.sh/)** - Быстрый JavaScript runtime и пакетный менеджер

### UI & Styling

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS фреймворк
- **[shadcn/ui](https://ui.shadcn.com/)** - Переиспользуемые компоненты
- **[Radix UI](https://www.radix-ui.com/)** - Примитивы для доступных компонентов
- **[Lucide Icons](https://lucide.dev/)** - Красивые иконки

### State & Data Management

- **[TanStack Router](https://tanstack.com/router)** - Типобезопасная маршрутизация
- **[TanStack Query](https://tanstack.com/query)** - Управление серверным состоянием
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Простое управление состоянием
- **[React Hook Form](https://react-hook-form.com/)** - Производительные формы
- **[Zod](https://zod.dev/)** - TypeScript-first валидация схем

### Development Tools

- **[Biome](https://biomejs.dev/)** - Быстрый линтер и форматтер
- **[Vitest](https://vitest.dev/)** - Быстрый unit test фреймворк
- **[Testing Library](https://testing-library.com/)** - Тестирование компонентов
- **[Lefthook](https://github.com/evilmartians/lefthook)** - Быстрые Git hooks

### API & HTTP

- **[Ky](https://github.com/sindresorhus/ky)** - Современный HTTP клиент
- **[Zod](https://zod.dev/)** - Валидация API ответов

## 📁 Структура проекта

```
modern-react-stack/
├── .github/                 # GitHub Actions workflows
│   ├── workflows/          # CI/CD конфигурации
│   └── ISSUE_TEMPLATE/     # Шаблоны для issues
├── docs/                    # Документация проекта
├── public/                  # Статические файлы
├── scripts/                 # Утилитарные скрипты
├── src/
│   ├── components/         # React компоненты
│   │   ├── auth/          # Компоненты аутентификации
│   │   ├── common/        # Общие компоненты
│   │   ├── forms/         # Компоненты форм
│   │   ├── guards/        # Route guards
│   │   ├── layouts/       # Layout компоненты
│   │   └── ui/            # shadcn/ui компоненты
│   ├── contexts/          # React контексты
│   ├── hooks/             # Кастомные хуки
│   │   └── api/          # API хуки
│   ├── lib/               # Утилиты и конфигурации
│   ├── routes/            # Файловая маршрутизация
│   │   └── _authenticated/ # Защищенные маршруты
│   ├── stores/            # Zustand хранилища
│   ├── styles/            # Глобальные стили
│   ├── test/              # Тестовые утилиты
│   ├── types/             # TypeScript типы
│   └── main.tsx           # Точка входа
├── tests/                  # Тесты
├── .env.example           # Пример переменных окружения
├── biome.dev.json         # Biome конфигурация (dev)
├── biome.prod.json        # Biome конфигурация (prod)
├── commitlint.config.js   # Commitlint конфигурация
├── components.json        # shadcn/ui конфигурация
├── lefthook.yml           # Git hooks конфигурация
├── package.json           # Зависимости и скрипты
├── tsconfig.json          # TypeScript конфигурация
├── vite.config.ts         # Vite конфигурация
└── vitest.config.ts       # Vitest конфигурация
```

## 💻 Разработка

### Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Настройте необходимые переменные:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Modern React Stack
```

### Стиль кода

Проект использует **Biome** для линтинга и форматирования:

```bash
# Проверить код
pnpm run lint

# Автоматически исправить проблемы
pnpm run lint:fix

# Форматировать код
pnpm run format
```

### Git Workflow

Проект использует **Conventional Commits** для сообщений коммитов:

```bash
# Интерактивное создание коммита
pnpm run commit

# Или вручную
git commit -m "feat(auth): add OAuth2 integration"
```

Типы коммитов:
- `feat` - новая функциональность
- `fix` - исправление бага
- `docs` - изменения в документации
- `style` - форматирование кода
- `refactor` - рефакторинг
- `perf` - улучшение производительности
- `test` - добавление тестов
- `build` - изменения в сборке
- `ci` - изменения в CI
- `chore` - другие изменения

### Git Hooks

Проект использует **Lefthook** для автоматических проверок:

- **pre-commit** - линтинг и форматирование staged файлов
- **commit-msg** - валидация сообщения коммита
- **pre-push** - запуск тестов перед push

Установка hooks:

```bash
pnpm run hooks:install
```

## 🧪 Тестирование

### Unit тесты

```bash
# Запустить все тесты
pnpm run test

# Запустить в watch режиме
pnpm run test:watch

# Запустить с UI
pnpm run test:ui

# Проверить покрытие
pnpm run test:coverage
```

### Написание тестов

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

## 🏗 Сборка

### Production сборка

```bash
# Собрать для production
pnpm run build

# Предпросмотр production сборки
pnpm run preview

# Анализ размера bundle
pnpm run build:analyze
```

### Оптимизация

- **Code Splitting** - автоматическое разделение кода
- **Tree Shaking** - удаление неиспользуемого кода
- **Minification** - минификация JavaScript и CSS
- **Compression** - gzip сжатие

## 🚢 Развертывание

### Vercel

```bash
# Установить Vercel CLI
npm i -g vercel

# Развернуть
vercel
```

### Netlify

```bash
# Установить Netlify CLI
npm i -g netlify-cli

# Развернуть
netlify deploy --prod
```

### Docker

```dockerfile
FROM node:18-alpine as builder

# Установить pnpm
RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📚 Документация

Дополнительная документация доступна в папке `docs/`:

- [GitHub Actions](docs/github-actions.md) - CI/CD настройка
- [Biome Configuration](docs/biome-configs.md) - Настройка линтера
- [Git Hooks](docs/git-hooks.md) - Настройка Git hooks
- [Commitlint Guide](src/docs/CommitlintGuide.md) - Руководство по коммитам
- [Testing Guide](src/docs/TestingGuide.md) - Руководство по тестированию

## 🤝 Вклад в проект

Мы приветствуем вклад в проект! Пожалуйста:

1. Fork репозиторий
2. Создайте feature ветку (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'feat: add amazing feature'`)
4. Push в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- [React Team](https://react.dev/) за отличную библиотеку
- [Vercel](https://vercel.com/) за Vite и Next.js
- [shadcn](https://twitter.com/shadcn) за shadcn/ui
- [TanStack](https://tanstack.com/) за Router и Query
- Всем контрибьюторам open-source проектов

## 📞 Поддержка

- 📧 Email: support@example.com
- 💬 Discord: [Join our server](https://discord.gg/example)
- 🐦 Twitter: [@example](https://twitter.com/example)
- 📖 Docs: [documentation](https://docs.example.com)

---

Сделано с ❤️ командой Modern React Stack
