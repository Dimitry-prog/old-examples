# Design Document

## Overview

Дизайн интеграции Lingui в React-приложение с TanStack Router. Решение обеспечивает легковесную (~3 KB), типобезопасную интернационализацию с поддержкой плюрализации, интерполяции и управления локалью через URL-роутинг.

### Ключевые решения:
- **React-first подход**: Использование `<I18nProvider>` и хуков `useLingui()` для удобного API
- **Компоненты вместо функций**: `<Trans>`, `<Plural>` для JSX, `useLingui()._()` для атрибутов
- **Роутинг-based локализация**: Локаль управляется через TanStack Router (`/ru/dashboard`, `/en/dashboard`)
- **Динамическая загрузка**: Каталоги переводов загружаются асинхронно при смене локали
- **TypeScript-first**: Полная типизация ключей переводов и параметров

## Architecture

### Структура файлов

```
src/
├── i18n/
│   ├── index.ts                 # Инициализация i18n, экспорт функций
│   ├── config.ts                # Конфигурация локалей
│   ├── types.ts                 # TypeScript типы для локалей
│   └── utils.ts                 # Утилиты (detectLocale, saveLocale)
├── locales/
│   ├── ru/
│   │   └── messages.po          # Русские переводы (исходный формат)
│   ├── en/
│   │   └── messages.po          # Английские переводы
│   └── {locale}/
│       └── messages.js          # Скомпилированные каталоги (генерируются)
├── components/
│   ├── common/
│   │   └── LanguageSwitcher.tsx # Компонент переключения языка
│   └── examples/
│       └── I18nExample.tsx      # Примеры использования
└── routes/
    ├── __root.tsx               # Корневой роут (обновлен для i18n)
    └── $locale/                 # Роуты с локалью
        ├── _layout.tsx          # Layout для локализованных роутов
        ├── index.tsx
        ├── dashboard.tsx
        └── ...

lingui.config.ts                 # Конфигурация Lingui CLI
```

### Поток данных

```
1. Пользователь открывает приложение
   ↓
2. Router определяет локаль из URL или редиректит на дефолтную
   ↓
3. Загружается каталог переводов для локали (i18n.load + i18n.activate)
   ↓
4. Компоненты используют макросы t/plural/Trans для переводов
   ↓
5. При смене языка → навигация на новый URL → загрузка нового каталога
```

## API Usage Patterns

### Рекомендуемые подходы к переводам

#### 1. Для JSX контента - используйте `<Trans>`

```typescript
import { Trans } from '@lingui/react/macro';

// ✅ Хорошо - чистый JSX
<h1><Trans>Добро пожаловать</Trans></h1>

// ✅ С переменными
<p><Trans>Привет, {name}!</Trans></p>

// ✅ С JSX элементами
<p><Trans>У вас <strong>{count}</strong> сообщений</Trans></p>
```

#### 2. Для плюрализации - используйте `<Plural>`

```typescript
import { Plural } from '@lingui/react/macro';

// ✅ Хорошо - декларативный подход
<Plural
  value={count}
  one="# день"
  few="# дня"
  many="# дней"
  other="# дней"
/>
```

#### 3. Для атрибутов и строк - используйте `t` макрос

```typescript
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

function Component() {
  const { i18n } = useLingui();
  
  // ✅ Простой синтаксис для атрибутов
  return <input placeholder={t(i18n)`Введите имя`} />;
  
  // ✅ С интерполяцией переменных
  const greeting = t(i18n)`Привет, ${name}!`;
  return <div title={greeting}>...</div>;
}
```

#### 4. Вне React компонентов - используйте `t` с глобальным `i18n`

```typescript
import { t } from '@lingui/core/macro';
import { i18n } from '@/i18n';

// ✅ Для утилит, констант, конфигов
const errorMessage = t(i18n)`Ошибка загрузки`;

// ✅ С параметрами (как ваш пример l('user.greetings', 'Dimitry'))
const greeting = t(i18n)`Привет, ${name}!`;
```

### Альтернатива: Создать хелпер функцию `l()`

Если хотите синтаксис точно как `l('user.greetings', 'Dimitry')`, можно создать обертку:

```typescript
// src/i18n/helpers.ts
import { MessageDescriptor } from '@lingui/core';
import { i18n } from './index';

export function l(id: string, values?: Record<string, any>): string {
  return i18n._(id, values);
}

// Использование:
import { l } from '@/i18n/helpers';

const greeting = l('user.greetings', { name: 'Dimitry' }); // "Привет, Dimitry!"
const days = l('user.days', { count: 24 }); // "24 дня"
```

Но рекомендуется использовать макросы `t` и `<Trans>`, так как они:
- Автоматически извлекают сообщения при `lingui extract`
- Обеспечивают типобезопасность
- Оптимизируются на этапе сборки

## Components and Interfaces

### 1. i18n Configuration (`src/i18n/config.ts`)

```typescript
export const LOCALES = ['ru', 'en'] as const;
export type Locale = typeof LOCALES[number];

export const DEFAULT_LOCALE: Locale = 'ru';

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
};
```

### 2. i18n Initialization (`src/i18n/index.ts`)

```typescript
import { i18n } from '@lingui/core';
import { LOCALES, DEFAULT_LOCALE, type Locale } from './config';

// Динамическая загрузка каталогов
export async function loadCatalog(locale: Locale) {
  const { messages } = await import(`../locales/${locale}/messages.js`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}

// Инициализация с дефолтной локалью
export async function initI18n(locale: Locale = DEFAULT_LOCALE) {
  await loadCatalog(locale);
}

export { i18n };
```

### 3. Locale Detection Utilities (`src/i18n/utils.ts`)

```typescript
import { LOCALES, DEFAULT_LOCALE, type Locale } from './config';

const LOCALE_STORAGE_KEY = 'app-locale';

export function saveLocale(locale: Locale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function getSavedLocale(): Locale | null {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  return saved && LOCALES.includes(saved as Locale) ? (saved as Locale) : null;
}

export function getBrowserLocale(): Locale {
  const browserLang = navigator.language.split('-')[0];
  return LOCALES.includes(browserLang as Locale) 
    ? (browserLang as Locale) 
    : DEFAULT_LOCALE;
}

export function detectLocale(): Locale {
  return getSavedLocale() ?? getBrowserLocale();
}

export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}
```

### 4. Translation Helper (`src/i18n/helpers.ts`)

Упрощенный хелпер для переводов с синтаксисом `l('key', params)`:

```typescript
import { i18n } from './index';

/**
 * Упрощенная функция перевода
 * @example
 * l('user.greetings', { name: 'Dimitry' }) // "Привет, Dimitry!"
 * l('user.days', { count: 24 }) // "24 дня"
 */
export function l(key: string, values?: Record<string, any>): string {
  return i18n._(key, values);
}
```

**Использование:**

```typescript
import { l } from '@/i18n/helpers';

// Простой перевод
const title = l('page.title');

// С параметрами
const greeting = l('user.greetings', { name: 'Dimitry' });
const days = l('user.days', { count: 24 });

// В атрибутах
<input placeholder={l('form.name')} />
<div title={l('tooltip.info', { count: 5 })}>...</div>
```

**Примечание:** Функция `l()` работает с уже извлеченными ключами. Для автоматической экстракции используйте макросы `t` и `<Trans>`.

### 5. Router Integration

#### Root Route (`src/routes/__root.tsx`)

```typescript
import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { detectLocale } from '@/i18n/utils';

export const Route = createRootRoute({
  // Редирект на локализованный URL при заходе на корень
  beforeLoad: ({ location }) => {
    if (location.pathname === '/') {
      const locale = detectLocale();
      throw redirect({ to: '/$locale', params: { locale } });
    }
  },
  component: () => <Outlet />,
});
```

#### Locale Layout Route (`src/routes/$locale/_layout.tsx`)

```typescript
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { I18nProvider } from '@lingui/react';
import { isValidLocale, saveLocale, detectLocale } from '@/i18n/utils';
import { loadCatalog, i18n } from '@/i18n';
import { Navigation } from '@/components/common/Navigation';
import { Loading } from '@/components/common/Loading';

export const Route = createFileRoute('/$locale/_layout')({
  // Валидация и загрузка локали
  beforeLoad: async ({ params }) => {
    const { locale } = params;
    
    if (!isValidLocale(locale)) {
      const defaultLocale = detectLocale();
      throw redirect({ to: '/$locale', params: { locale: defaultLocale } });
    }
    
    await loadCatalog(locale);
    saveLocale(locale);
    
    return { locale };
  },
  component: () => (
    <I18nProvider i18n={i18n}>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Navigation />
        <main>
          <Outlet />
        </main>
      </div>
    </I18nProvider>
  ),
  pendingComponent: () => <Loading message="Загрузка..." fullScreen />,
});
```

#### Example Localized Route (`src/routes/$locale/_layout/index.tsx`)

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { Trans } from '@lingui/react/macro';

export const Route = createFileRoute('/$locale/_layout/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <h1><Trans>Добро пожаловать</Trans></h1>
    </div>
  );
}
```

### 6. Language Switcher Component (`src/components/common/LanguageSwitcher.tsx`)

```typescript
import { useNavigate, useParams } from '@tanstack/react-router';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const navigate = useNavigate();
  const { locale } = useParams({ from: '/$locale/_layout' });

  const handleLocaleChange = (newLocale: Locale) => {
    // Сохраняем текущий путь без локали
    const currentPath = window.location.pathname.replace(`/${locale}`, '');
    
    // Навигация на тот же путь с новой локалью
    navigate({ 
      to: `/$locale${currentPath}`,
      params: { locale: newLocale },
    });
  };

  return (
    <select 
      value={locale} 
      onChange={(e) => handleLocaleChange(e.target.value as Locale)}
      className="px-3 py-2 border rounded"
    >
      {LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc]}
        </option>
      ))}
    </select>
  );
}
```

### 7. Usage Examples Component (`src/components/examples/I18nExample.tsx`)

```typescript
import { Trans, Plural } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';

export function I18nExample() {
  const { i18n } = useLingui();
  const [count, setCount] = useState(1);
  const [name, setName] = useState('Dimitry');

  return (
    <div className="space-y-6 p-6">
      {/* Базовый перевод */}
      <section>
        <h2><Trans>Примеры использования</Trans></h2>
      </section>

      {/* Интерполяция строк */}
      <section>
        <h3><Trans>Приветствие</Trans></h3>
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder={t(i18n)`Имя`}
          className="border px-3 py-2 rounded"
        />
        {/* В JSX - используем <Trans> */}
        <p><Trans>Привет, {name}!</Trans></p>
        
        {/* Для атрибутов - используем t(i18n) */}
        <p title={t(i18n)`Приветствие для ${name}`}>
          Наведите для подсказки
        </p>
      </section>

      {/* Плюрализация */}
      <section>
        <h3><Trans>Плюрализация</Trans></h3>
        <input 
          type="number" 
          value={count} 
          onChange={(e) => setCount(Number(e.target.value))}
          className="border px-3 py-2 rounded"
        />
        <p>
          <Plural
            value={count}
            one="# день"
            few="# дня"
            many="# дней"
            other="# дней"
          />
        </p>
      </section>

      {/* Trans с JSX */}
      <section>
        <h3><Trans>Форматирование</Trans></h3>
        <p>
          <Trans>
            У вас <strong>{count}</strong> непрочитанных сообщений
          </Trans>
        </p>
      </section>
    </div>
  );
}
```

## Data Models

### Locale Type

```typescript
// src/i18n/types.ts
import type { LOCALES } from './config';

export type Locale = typeof LOCALES[number]; // 'ru' | 'en'

export interface LocaleConfig {
  code: Locale;
  label: string;
  direction: 'ltr' | 'rtl';
}
```

### Message Catalog Structure

```typescript
// Генерируется Lingui CLI
export interface MessageCatalog {
  [messageId: string]: string | [string, Record<string, string>];
}
```

### Translation Message Format (PO файлы)

```po
# src/locales/ru/messages.po
msgid "Привет, {name}!"
msgstr "Привет, {name}!"

msgid "{count, plural, one {# день} few {# дня} many {# дней} other {# дней}}"
msgstr "{count, plural, one {# день} few {# дня} many {# дней} other {# дней}}"
```

## Error Handling

### 1. Неверная локаль в URL

```typescript
// В beforeLoad роута
if (!isValidLocale(locale)) {
  const fallbackLocale = detectLocale();
  throw redirect({ to: '/$locale', params: { locale: fallbackLocale } });
}
```

### 2. Ошибка загрузки каталога

```typescript
export async function loadCatalog(locale: Locale) {
  try {
    const { messages } = await import(`../locales/${locale}/messages.js`);
    i18n.load(locale, messages);
    i18n.activate(locale);
  } catch (error) {
    console.error(`Failed to load catalog for locale: ${locale}`, error);
    // Fallback на дефолтную локаль
    if (locale !== DEFAULT_LOCALE) {
      await loadCatalog(DEFAULT_LOCALE);
    }
  }
}
```

### 3. Отсутствующий перевод

```typescript
// В lingui.config.ts
export default {
  // ...
  fallbackLocales: {
    default: 'ru',
  },
};
```

Lingui автоматически показывает исходный текст, если перевод не найден.

## Testing Strategy

### 1. Unit Tests для утилит

```typescript
// src/i18n/__tests__/utils.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveLocale, getSavedLocale, isValidLocale } from '../utils';

describe('i18n utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and retrieve locale', () => {
    saveLocale('en');
    expect(getSavedLocale()).toBe('en');
  });

  it('should validate locale', () => {
    expect(isValidLocale('ru')).toBe(true);
    expect(isValidLocale('fr')).toBe(false);
  });
});
```

### 2. Integration Tests для компонентов

```typescript
// src/components/common/__tests__/LanguageSwitcher.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from '../LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('should switch locale on selection', async () => {
    render(<LanguageSwitcher />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'en' } });
    
    // Проверяем навигацию
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/$locale/current-path',
      params: { locale: 'en' },
    });
  });
});
```

### 3. E2E Tests для роутинга

```typescript
// e2e/i18n-routing.test.ts
import { test, expect } from '@playwright/test';

test('should redirect to default locale', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/ru/);
});

test('should switch locale via URL', async ({ page }) => {
  await page.goto('/ru/dashboard');
  await page.goto('/en/dashboard');
  
  // Проверяем, что контент изменился
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## Configuration

### Lingui Config (`lingui.config.ts`)

```typescript
import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
  locales: ['ru', 'en'],
  sourceLocale: 'ru',
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src'],
      exclude: ['**/node_modules/**', '**/*.test.ts', '**/*.test.tsx'],
    },
  ],
  format: 'po',
  fallbackLocales: {
    default: 'ru',
  },
};

export default config;
```

### Vite Config Update (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { lingui } from '@lingui/vite-plugin';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['macros'],
      },
    }),
    lingui(),
  ],
  // ... остальная конфигурация
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "i18n:extract": "lingui extract",
    "i18n:compile": "lingui compile",
    "i18n:extract:watch": "lingui extract --watch",
    "prebuild": "npm run i18n:compile"
  }
}
```

## Performance Considerations

### 1. Динамическая загрузка каталогов

Каталоги загружаются только для активной локали, уменьшая начальный бандл:

```typescript
// Вместо статического импорта всех локалей
const { messages } = await import(`../locales/${locale}/messages.js`);
```

### 2. Компиляция в production формат

`.po` файлы компилируются в оптимизированный JavaScript:

```bash
npm run i18n:compile  # Перед билдом
```

### 3. Кеширование в localStorage

Выбранная локаль сохраняется, избегая повторного определения:

```typescript
saveLocale(locale);  // При каждой смене
```

## Migration Path

### Обновление существующих роутов

1. Переместить роуты в `src/routes/$locale/_layout/`
2. Обновить импорты и навигацию для учета параметра `locale`
3. Заменить хардкод текстов на макросы `t`, `plural`, `Trans`

### Пример миграции:

```typescript
// До
// src/routes/dashboard.tsx
export const Route = createFileRoute('/dashboard')({
  component: () => <h1>Панель управления</h1>,
});

// После
// src/routes/$locale/_layout/dashboard.tsx
import { Trans } from '@lingui/react/macro';

export const Route = createFileRoute('/$locale/_layout/dashboard')({
  component: () => <h1><Trans>Панель управления</Trans></h1>,
});
```
