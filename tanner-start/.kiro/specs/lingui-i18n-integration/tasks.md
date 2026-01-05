# Implementation Plan

- [x] 1. Установка и базовая конфигурация Lingui


  - Установить пакеты: `@lingui/core`, `@lingui/react`, `@lingui/macro`, `@lingui/cli`, `@lingui/vite-plugin`
  - Создать `lingui.config.ts` с настройками локалей (ru, en), путей к каталогам и формата PO
  - Обновить `vite.config.ts` для поддержки Lingui макросов через `@lingui/vite-plugin`
  - Добавить npm-скрипты: `i18n:extract`, `i18n:compile`, `prebuild`
  - _Requirements: 1.1, 1.2, 1.3, 1.4_






- [x] 2. Создание i18n инфраструктуры
  - [x] 2.1 Создать модуль конфигурации `src/i18n/config.ts`
    - Определить константы `LOCALES`, `DEFAULT_LOCALE`
    - Создать тип `Locale` и `LOCALE_LABELS`
    - _Requirements: 2.1, 3.4_
  
  - [x] 2.2 Создать модуль инициализации `src/i18n/index.ts`
    - Реализовать функцию `loadCatalog()` для динамической загрузки переводов
    - Реализовать функцию `initI18n()` для инициализации с дефолтной локалью
    - Экспортировать экземпляр `i18n` из `@lingui/core`
    - Добавить обработку ошибок загрузки каталогов с fallback
    - _Requirements: 2.2, 2.3_
  
  - [x] 2.3 Создать утилиты `src/i18n/utils.ts`
    - Реализовать `saveLocale()` и `getSavedLocale()` для работы с localStorage
    - Реализовать `getBrowserLocale()` для определения языка браузера
    - Реализовать `detectLocale()` для автоопределения локали
    - Реализовать `isValidLocale()` для валидации локали
    - _Requirements: 2.4, 6.2_
  
  - [x] 2.4 Создать типы `src/i18n/types.ts`
    - Определить интерфейс `LocaleConfig`
    - Экспортировать тип `Locale`
    - _Requirements: 3.1, 3.4_
  
  - [x] 2.5 Создать хелпер `src/i18n/helpers.ts`
    - Реализовать функцию `l(key, values)` для упрощенного синтаксиса переводов
    - Функция должна вызывать `i18n._(key, values)` внутри
    - Добавить JSDoc комментарии с примерами использования
    - _Requirements: 5.1, 5.2, 5.3, 5.4_



- [x] 3. Интеграция с TanStack Router
  - [x] 3.1 Обновить корневой роут `src/routes/__root.tsx`
    - Добавить `beforeLoad` с редиректом на `/$locale` при заходе на корень
    - Использовать `detectLocale()` для определения начальной локали
    - Убрать Navigation и main из корневого роута (переместить в layout)
    - _Requirements: 2.4, 6.3_
  
  - [x] 3.2 Создать layout роут `src/routes/$locale/_layout.tsx`
    - Реализовать `beforeLoad` с валидацией локали через `isValidLocale()`
    - Загружать каталог переводов через `loadCatalog()`
    - Сохранять локаль в localStorage через `saveLocale()`
    - Добавить редирект на валидную локаль при ошибке
    - Обернуть компонент в `<I18nProvider i18n={i18n}>`
    - Переместить Navigation и main wrapper из __root.tsx
    - Добавить `pendingComponent` с Loading
    - _Requirements: 2.2, 2.3, 2.5, 6.2_
  
  - [x] 3.3 Мигрировать существующие роуты в `$locale/_layout`
    - Переместить `index.tsx` в `$locale/_layout/index.tsx`
    - Переместить `about.tsx` в `$locale/_layout/about.tsx`
    - Переместить `login.tsx` в `$locale/_layout/login.tsx`
    - Обновить `_authenticated.tsx` на `$locale/_layout/_authenticated.tsx`
    - Переместить все роуты из `_authenticated/` в `$locale/_layout/_authenticated/`
    - Обновить импорты и типы роутов
    - _Requirements: 2.5_

- [x] 4. Создание начальных каталогов переводов
  - Создать структуру директорий `src/locales/ru/` и `src/locales/en/`
  - Создать пустые файлы `messages.po` для каждой локали
  - Запустить `npm run i18n:extract` для инициализации каталогов
  - Запустить `npm run i18n:compile` для генерации JS файлов
  - _Requirements: 7.3, 7.4_

- [x] 5. Компонент переключения языка
  - Создать `src/components/common/LanguageSwitcher.tsx`
  - Использовать `useParams` для получения текущей локали
  - Использовать `useNavigate` для навигации на новую локаль
  - Реализовать сохранение текущего пути при смене языка
  - Отобразить список локалей из `LOCALES` с лейблами из `LOCALE_LABELS`
  - Добавить стилизацию с Tailwind CSS
  - _Requirements: 6.1, 6.4_

- [x] 6. Интеграция LanguageSwitcher в Navigation

  - Обновить `src/components/common/Navigation.tsx`
  - Импортировать и добавить `<LanguageSwitcher />` в навигацию
  - Обновить все `<Link>` компоненты для работы с параметром `locale`
  - Использовать `useParams` для получения текущей локали в ссылках
  - _Requirements: 6.4_

- [x] 7. Создание примеров использования


  - [x] 7.1 Создать компонент `src/components/examples/I18nExample.tsx`



    - Добавить пример базового перевода с компонентом `<Trans>`
    - Добавить пример интерполяции строк с переменной `name` через `<Trans>`
    - Добавить пример плюрализации с компонентом `<Plural>` и разными числами (1, 2, 5, 24)
    - Добавить пример использования `t(i18n)` для атрибутов (placeholder, title)
    - Добавить пример использования хелпера `l()` для простого синтаксиса
    - Добавить пример `<Trans>` с вложенными JSX элементами (strong, em)
    - Добавить интерактивные инпуты для изменения значений
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  


  - [x] 7.2 Добавить роут для примеров


    - Создать `src/routes/$locale/_layout/examples/i18n.tsx`
    - Импортировать и отобразить `<I18nExample />`
    - _Requirements: 8.5_
  
  - [x] 7.3 Добавить ссылку на примеры в Navigation


    - Обновить Navigation для включения ссылки на `/examples/i18n`
    - _Requirements: 8.5_

- [x] 8. Перевод существующих текстов



  - Обновить `src/routes/$locale/_layout/index.tsx` с использованием `<Trans>`
  - Обновить `src/components/common/Navigation.tsx` для перевода пунктов меню через `<Trans>`
  - Обновить `src/components/common/Loading.tsx` для перевода сообщения через `<Trans>`
  - Запустить `npm run i18n:extract` для извлечения всех сообщений
  - Добавить английские переводы в `src/locales/en/messages.po`
  - Запустить `npm run i18n:compile` для компиляции каталогов
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 7.1, 7.2_

- [x] 9. Документация



  - Создать `src/i18n/README.md` с описанием использования Lingui
  - Добавить примеры использования: `<Trans>`, `<Plural>`, `t(i18n)`, `l()`
  - Описать когда использовать каждый подход (JSX vs атрибуты vs вне React)
  - Объяснить разницу между макросами (автоэкстракция) и хелпером `l()` (ручные ключи)



  - Описать процесс добавления новых переводов


  - Описать команды CLI: extract, compile
  - Добавить гайд по миграции существующих компонентов
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 10. Тестирование




  - [x]* 10.1 Написать unit-тесты для утилит

    - Тесты для `saveLocale()` и `getSavedLocale()`
    - Тесты для `isValidLocale()`


    - Тесты для `detectLocale()` с моками localStorage и navigator
    - _Requirements: 2.4, 6.2_
  



  - [x]* 10.2 Написать integration-тесты для компонентов

    - Тесты для `LanguageSwitcher` с проверкой навигации
    - Тесты для `I18nExample` с проверкой рендеринга переводов
    - _Requirements: 6.1, 8.1, 8.2, 8.3, 8.4_
  

  - [x]* 10.3 Написать E2E тесты для роутинга

    - Тест редиректа с `/` на `/$locale`
    - Тест переключения локали через URL
    - Тест сохранения локали в localStorage
    - _Requirements: 2.4, 6.1, 6.3, 6.5_
