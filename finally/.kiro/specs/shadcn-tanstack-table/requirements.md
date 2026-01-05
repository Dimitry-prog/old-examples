# Requirements Document

## Introduction

Создание переиспользуемого компонента таблицы на базе shadcn/ui и @tanstack/react-table, который сохраняет весь функционал существующей таблицы на Material-UI, но использует современный стек технологий. Компонент должен максимально использовать встроенные возможности @tanstack/react-table (column pinning, pagination, sorting, filtering, grouping) и shadcn/ui компоненты, дополняя их только необходимым функционалом для группировки колонок с заголовками, бесконечной прокрутки и визуальных разделителей.

## Glossary

- **Table Component**: Основной компонент таблицы, отображающий данные в табличном формате
- **TableData Component**: Компонент-обертка для работы с асинхронными данными и пагинацией
- **Column**: Определение колонки таблицы с настройками отображения и поведения
- **Column Group**: Группа связанных колонок с общим заголовком
- **Sticky Column**: Фиксированная колонка, которая остается видимой при горизонтальной прокрутке
- **Sticky Header**: Фиксированный заголовок таблицы, который остается видимым при вертикальной прокрутке
- **Infinite Scroll**: Режим загрузки данных при прокрутке до конца списка
- **Pagination**: Постраничная навигация по данным
- **Custom Cell Renderer**: Функция для кастомного отображения содержимого ячейки
- **Row Separator**: Визуальный разделитель между строками таблицы

## Requirements

### Requirement 1

**User Story:** Как разработчик, я хочу использовать компонент таблицы на базе shadcn/ui и @tanstack/react-table, чтобы иметь современный и производительный UI компонент

#### Acceptance Criteria

1. THE Table Component SHALL использовать @tanstack/react-table для управления состоянием таблицы
2. THE Table Component SHALL использовать shadcn/ui компоненты для визуального оформления
3. THE Table Component SHALL использовать Tailwind CSS для всех стилей
4. THE Table Component SHALL использовать встроенный функционал @tanstack/react-table где это возможно
5. THE Table Component SHALL поддерживать TypeScript с полной типизацией
6. THE Table Component SHALL экспортировать типы ColumnType, TableProps и другие необходимые типы

### Requirement 2

**User Story:** Как разработчик, я хочу группировать колонки с визуальными заголовками групп и возможностью сворачивания, чтобы организовать большое количество колонок в логические группы

#### Acceptance Criteria

1. THE Table Component SHALL использовать getHeaderGroups из @tanstack/react-table для рендеринга групповых заголовков
2. THE Table Component SHALL поддерживать кастомное свойство group в определении колонки для группировки
3. WHEN колонка имеет свойство group, THE Table Component SHALL отображать дополнительный ряд групповых заголовков над основными заголовками
4. WHEN пользователь кликает на групповой заголовок, THE Table Component SHALL управлять видимостью колонок через ColumnVisibilityState
5. THE Table Component SHALL использовать lucide-react иконки для индикации состояния группы
6. THE Table Component SHALL применять Tailwind классы из свойства className группы к групповому заголовку
7. THE Table Component SHALL использовать TableCell с colSpan для отображения групповых заголовков

### Requirement 3

**User Story:** Как пользователь, я хочу видеть фиксированные колонки при горизонтальной прокрутке, чтобы всегда видеть ключевую информацию

#### Acceptance Criteria

1. THE Table Component SHALL использовать встроенный Column Pinning API из @tanstack/react-table
2. THE Table Component SHALL поддерживать ColumnPinningState для управления фиксированными колонками
3. THE Table Component SHALL использовать методы getIsPinned, getStart, getAfter из Column API для позиционирования
4. THE Table Component SHALL применять Tailwind классы sticky, left-*, right-* и z-index для фиксации колонок
5. THE Table Component SHALL поддерживать фиксацию колонок слева и справа

### Requirement 4

**User Story:** Как пользователь, я хочу видеть заголовок таблицы при вертикальной прокрутке, чтобы всегда понимать значение колонок

#### Acceptance Criteria

1. WHERE свойство stickyHeader равно true, THE Table Component SHALL применять Tailwind класс sticky к TableHeader
2. THE Table Component SHALL применять Tailwind классы top-0 и z-10 для фиксации заголовка
3. THE Table Component SHALL использовать getHeaderGroups из @tanstack/react-table для рендеринга заголовков

### Requirement 5

**User Story:** Как разработчик, я хочу использовать кастомный рендеринг ячеек, чтобы отображать сложное содержимое в таблице

#### Acceptance Criteria

1. THE Table Component SHALL использовать ColumnDef с свойством cell из @tanstack/react-table
2. THE Table Component SHALL использовать flexRender для рендеринга содержимого ячеек
3. THE Table Component SHALL передавать cell.getContext() в функцию рендеринга
4. WHERE колонка использует accessorKey, THE Table Component SHALL автоматически отображать значение
5. THE Table Component SHALL поддерживать возврат ReactNode из функции cell

### Requirement 6

**User Story:** Как разработчик, я хочу применять кастомные стили к строкам и ячейкам через Tailwind классы, чтобы визуально выделять важную информацию

#### Acceptance Criteria

1. WHERE колонка имеет свойство className, THE Table Component SHALL применять Tailwind классы к ячейкам колонки
2. WHERE колонка имеет функцию getCellClassName, THE Table Component SHALL вызывать эту функцию и применять возвращаемые Tailwind классы
3. WHERE передана функция getRowClassName, THE Table Component SHALL вызывать эту функцию для каждой строки и применять возвращаемые Tailwind классы
4. THE Table Component SHALL поддерживать свойство rowClassName для применения общих Tailwind классов ко всем строкам
5. THE Table Component SHALL применять headerClassName к заголовкам колонок

### Requirement 7

**User Story:** Как пользователь, я хочу использовать пагинацию для навигации по большим наборам данных, чтобы не загружать все данные сразу

#### Acceptance Criteria

1. THE Table Component SHALL использовать getPaginationRowModel из @tanstack/react-table
2. THE Table Component SHALL использовать методы previousPage, nextPage, getCanPreviousPage, getCanNextPage
3. THE Table Component SHALL использовать shadcn/ui Button компоненты для навигации по страницам
4. WHEN пользователь меняет страницу, THE Table Component SHALL обновлять URL параметры через useNavigate из @tanstack/react-router
5. THE Table Component SHALL использовать useSearch из @tanstack/react-router для чтения параметров пагинации из URL
6. THE Table Component SHALL поддерживать свойство perPageOptions для выбора количества строк на странице
7. WHERE isLoadOnScroll равно true, THE Table Component SHALL скрывать компонент пагинации

### Requirement 8

**User Story:** Как пользователь, я хочу использовать бесконечную прокрутку для загрузки данных, чтобы плавно просматривать большие списки

#### Acceptance Criteria

1. WHERE свойство isLoadOnScroll равно true, THE Table Component SHALL отслеживать позицию прокрутки
2. WHEN пользователь прокручивает до конца списка, THE Table Component SHALL вызывать функцию onLoadMore
3. WHERE hasMore равно false, THE Table Component SHALL прекращать вызовы onLoadMore
4. WHILE данные загружаются, THE Table Component SHALL предотвращать повторные вызовы onLoadMore

### Requirement 9

**User Story:** Как разработчик, я хочу использовать компонент TableData для автоматической загрузки данных, чтобы не писать логику загрузки вручную

#### Acceptance Criteria

1. THE TableData Component SHALL принимать функцию fetchData для загрузки данных
2. WHEN компонент монтируется, THE TableData Component SHALL вызывать fetchData
3. WHEN изменяются фильтры, THE TableData Component SHALL вызывать fetchData с новыми параметрами
4. THE TableData Component SHALL управлять состоянием загрузки и передавать его в Table Component
5. WHERE передана функция transformData, THE TableData Component SHALL трансформировать полученные данные перед отображением

### Requirement 10

**User Story:** Как пользователь, я хочу видеть индикатор загрузки и пустое состояние, чтобы понимать статус таблицы

#### Acceptance Criteria

1. WHILE данные загружаются, THE Table Component SHALL отображать индикатор загрузки
2. WHERE данные пустые и загрузка завершена, THE Table Component SHALL отображать сообщение о пустом состоянии
3. THE Table Component SHALL скрывать индикатор загрузки после завершения загрузки данных

### Requirement 11

**User Story:** Как разработчик, я хочу добавлять визуальные разделители между строками, чтобы группировать связанные данные

#### Acceptance Criteria

1. WHERE передана функция rowSeparators, THE Table Component SHALL вызывать эту функцию для каждой строки
2. WHERE функция rowSeparators возвращает объект, THE Table Component SHALL отображать разделитель после строки
3. THE Table Component SHALL применять высоту и стили из объекта разделителя

### Requirement 12

**User Story:** Как разработчик, я хочу применять Tailwind классы к колонкам и заголовкам, чтобы использовать утилитарные классы для стилизации

#### Acceptance Criteria

1. WHERE колонка имеет свойство className, THE Table Component SHALL применять Tailwind классы к ячейкам колонки
2. WHERE колонка имеет свойство headerClassName, THE Table Component SHALL применять Tailwind классы к заголовку колонки
3. THE Table Component SHALL использовать cn() утилиту из shadcn для объединения классов
4. THE Table Component SHALL поддерживать динамические Tailwind классы через функции


### Requirement 13

**User Story:** Как разработчик, я хочу использовать встроенные возможности @tanstack/react-table для сортировки и фильтрации, чтобы не писать эту логику вручную

#### Acceptance Criteria

1. THE Table Component SHALL использовать getSortedRowModel из @tanstack/react-table для сортировки
2. THE Table Component SHALL использовать getFilteredRowModel для фильтрации данных
3. THE Table Component SHALL управлять SortingState и ColumnFiltersState через useState
4. THE Table Component SHALL использовать методы toggleSorting и setFilterValue из Column API
5. THE Table Component SHALL использовать shadcn/ui Input компонент для фильтров

### Requirement 14

**User Story:** Как разработчик, я хочу использовать встроенные shadcn/ui компоненты, чтобы обеспечить консистентный дизайн

#### Acceptance Criteria

1. THE Table Component SHALL использовать Table, TableHeader, TableBody, TableRow, TableHead, TableCell из shadcn/ui
2. THE Table Component SHALL использовать Button компонент из shadcn/ui для действий
3. THE Table Component SHALL использовать DropdownMenu из shadcn/ui для меню действий
4. THE Table Component SHALL использовать Input из shadcn/ui для фильтров
5. THE Table Component SHALL использовать утилиту cn() для объединения Tailwind классов
