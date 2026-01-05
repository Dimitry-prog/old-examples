# Design Document

## Overview

Дизайн компонента таблицы на базе shadcn/ui и @tanstack/react-table, который максимально использует встроенные возможности библиотек и дополняет их кастомным функционалом для группировки колонок, бесконечной прокрутки и визуальных разделителей.

### Архитектурные принципы

1. **Максимальное использование встроенного функционала**: Используем Column Pinning API, Pagination API, Sorting API, Filtering API из @tanstack/react-table
2. **Композиция компонентов**: Используем shadcn/ui компоненты как строительные блоки
3. **Типобезопасность**: Полная типизация с TypeScript generics
4. **Tailwind-first**: Все стили через Tailwind классы, никаких inline стилей
5. **Разделение ответственности**: Table для отображения, TableData для загрузки данных

## Architecture

### Component Structure

```
src/shared/components/ui/table/
├── index.ts               # Экспорты
├── table.tsx              # Основной компонент Table
├── table-data.tsx         # Компонент TableData для загрузки данных
├── table-pagination.tsx   # Компонент пагинации
├── table-empty-state.tsx  # Компонент пустого состояния
├── types.ts               # TypeScript типы
└── ui.tsx                 # Shadcn UI базовые компоненты (если еще не установлены)
```

### Technology Stack

- **@tanstack/react-table v8**: Headless UI для управления состоянием таблицы
- **@tanstack/react-router**: Роутинг и управление URL параметрами
- **shadcn/ui**: UI компоненты (Table, Button, Input, DropdownMenu)
- **Tailwind CSS**: Утилитарные классы для стилизации
- **lucide-react**: Иконки
- **React 18+**: Hooks
- **TypeScript**: Полная типизация

## Components and Interfaces

### 1. Table Component

Основной компонент для отображения таблицы с данными.

#### Props Type

```typescript
type TableProps<TData> = {
  // Основные данные
  name: string
  columns: ColumnDef<TData>[]
  data: TData[]
  
  // Пагинация
  totalRows?: number
  pageSize?: number
  pageSizeOptions?: number[]
  
  // Фиксация
  stickyHeader?: boolean
  columnPinning?: ColumnPinningState
  onColumnPinningChange?: (state: ColumnPinningState) => void
  
  // Бесконечная прокрутка
  isLoadOnScroll?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  
  // Состояние
  isLoading?: boolean
  
  // Стилизация
  maxHeight?: string | number
  rowClassName?: string
  getRowClassName?: (row: TData, index: number) => string
  
  // Разделители
  rowSeparators?: (row: TData, index: number) => RowSeparator | null
  
  // Группировка колонок (кастомное расширение)
  columnGroups?: ColumnGroup[]
}
```

#### Key Features

1. **Использование useReactTable hook**:
```typescript
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    pagination,
    sorting,
    columnFilters,
    columnVisibility,
    columnPinning,
  },
  onPaginationChange: setPagination,
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onColumnVisibilityChange: setColumnVisibility,
  onColumnPinningChange,
  manualPagination: true, // для серверной пагинации
  pageCount: Math.ceil((totalRows ?? 0) / pageSize),
})
```

2. **Рендеринг с группировкой колонок**:
```typescript
// Если есть группы - рендерим два ряда заголовков
{columnGroups && (
  <TableRow>
    {renderGroupHeaders()}
  </TableRow>
)}
<TableRow>
  {table.getHeaderGroups().map(headerGroup => (
    renderColumnHeaders(headerGroup)
  ))}
</TableRow>
```

3. **Фиксированные колонки через Column Pinning API**:
```typescript
// В рендере ячейки
const isPinned = column.getIsPinned()
const pinnedStyles = isPinned
  ? cn(
      'sticky z-10 bg-background',
      isPinned === 'left' && `left-[${column.getStart('left')}px]`,
      isPinned === 'right' && `right-[${column.getAfter('right')}px]`
    )
  : ''
```

4. **Бесконечная прокрутка**:
```typescript
const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
  const threshold = 50
  
  if (scrollHeight - scrollTop - clientHeight < threshold && hasMore && !isLoading) {
    onLoadMore?.()
  }
}, [hasMore, isLoading, onLoadMore])
```

### 2. TableData Component

Компонент-обертка для автоматической загрузки данных.

#### Props Type

```typescript
type TableDataProps<TData, TFilters = unknown, TResponse = unknown> = {
  // Все пропсы Table кроме data и totalRows
  ...Omit<TableProps<TData>, 'data' | 'totalRows'>
  
  // Загрузка данных
  fetchData: (params: FetchParams<TFilters>) => Promise<{ data: TResponse }>
  transformData?: (response: TResponse) => { items: TData[]; count: number }
  
  // Фильтры
  filters?: TFilters
  
  // Триггеры перезагрузки
  refetchTrigger?: number
}

type FetchParams<TFilters> = {
  skip: number
  take: number
  filters?: TFilters
}
```

#### Key Features

1. **Управление состоянием загрузки**:
```typescript
const [data, setData] = useState<TData[]>([])
const [totalRows, setTotalRows] = useState(0)
const [isLoading, setIsLoading] = useState(false)
```

2. **Интеграция с URL параметрами через @tanstack/react-router**:
```typescript
import { useNavigate, useSearch } from '@tanstack/react-router'

const navigate = useNavigate()
const search = useSearch({ strict: false })

// Получаем параметры пагинации из URL
const pageParam = search[name] as string | undefined
const [skip, take] = pageParam?.split('-').map(Number) ?? [0, 10]

// Обновляем URL при изменении страницы
const updatePagination = (newSkip: number, newTake: number) => {
  navigate({
    search: (prev) => ({
      ...prev,
      [name]: `${newSkip}-${newTake}`,
    }),
  })
}
```

3. **Загрузка данных с эффектами**:
```typescript
useEffect(() => {
  const loadData = async () => {
    setIsLoading(true)
    const response = await fetchData({ skip, take, filters })
    const transformed = transformData?.(response.data) ?? response.data
    
    if (isLoadOnScroll) {
      setData(prev => skip === 0 ? transformed.items : [...prev, ...transformed.items])
    } else {
      setData(transformed.items)
    }
    
    setTotalRows(transformed.count)
    setIsLoading(false)
  }
  
  loadData()
}, [skip, take, filters, refetchTrigger])
```

### 3. Column Definition Extensions

Расширение стандартного ColumnDef для поддержки группировки и кастомных стилей.

```typescript
type ExtendedColumnDef<TData> = ColumnDef<TData> & {
  // Группировка
  group?: ColumnGroup
  
  // Стилизация через Tailwind
  className?: string
  headerClassName?: string
  getCellClassName?: (value: unknown, row: TData) => string
  
  // Фиксация (через meta)
  meta?: {
    pinned?: 'left' | 'right'
  }
}

type ColumnGroup = {
  name: string
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}
```

### 4. Supporting Components

#### TablePagination

```typescript
type TablePaginationProps = {
  table: Table<any>
  name: string
  pageSizeOptions?: number[]
}

// Реализация с @tanstack/react-router
const TablePagination = ({ table, name, pageSizeOptions }: TablePaginationProps) => {
  const navigate = useNavigate()
  const search = useSearch({ strict: false })
  
  const handlePageChange = (direction: 'prev' | 'next') => {
    const currentParam = search[name] as string | undefined
    const [skip, take] = currentParam?.split('-').map(Number) ?? [0, 10]
    
    const newSkip = direction === 'prev' 
      ? Math.max(0, skip - take)
      : skip + take
    
    navigate({
      search: (prev) => ({
        ...prev,
        [name]: `${newSkip}-${take}`,
      }),
    })
    
    if (direction === 'prev') {
      table.previousPage()
    } else {
      table.nextPage()
    }
  }
  
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange('prev')}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange('next')}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  )
}
```

#### TableEmptyState

```typescript
type TableEmptyStateProps = {
  isLoading: boolean
  isEmpty: boolean
  message?: string
}

// Отображает Skeleton или сообщение "No results"
```

## Data Models

### Column Pinning State

```typescript
type ColumnPinningState = {
  left?: string[]  // IDs колонок, зафиксированных слева
  right?: string[] // IDs колонок, зафиксированных справа
}
```

### Row Separator

```typescript
type RowSeparator = {
  height?: number
  className?: string
}
```

### Table State

```typescript
type TableState = {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  columnPinning: ColumnPinningState
}
```

## Error Handling

### Loading States

1. **Initial Loading**: Отображаем Skeleton в TableEmptyState
2. **Pagination Loading**: Disabled кнопки пагинации
3. **Infinite Scroll Loading**: Индикатор внизу таблицы

### Error States

1. **Fetch Error**: Отображаем сообщение об ошибке в TableEmptyState
2. **Empty Data**: Отображаем "No results" сообщение

### Edge Cases

1. **Нет данных + загрузка**: Показываем Skeleton
2. **Нет данных + не загружается**: Показываем "No results"
3. **Infinite scroll + конец данных**: Скрываем индикатор загрузки
4. **Фиксированные колонки + узкий экран**: Горизонтальная прокрутка работает корректно

## Testing Strategy

### Unit Tests

1. **Table Component**:
   - Рендеринг с базовыми данными
   - Применение Tailwind классов
   - Вызов функций рендеринга ячеек
   - Обработка пустого состояния

2. **TableData Component**:
   - Загрузка данных при монтировании
   - Перезагрузка при изменении фильтров
   - Обновление URL параметров
   - Infinite scroll логика

3. **Column Grouping**:
   - Рендеринг групповых заголовков
   - Сворачивание/разворачивание групп
   - Управление видимостью колонок

### Integration Tests

1. **Pagination Flow**:
   - Переключение страниц
   - Изменение размера страницы
   - Синхронизация с URL

2. **Column Pinning**:
   - Фиксация колонок слева/справа
   - Корректное позиционирование
   - Прокрутка с фиксированными колонками

3. **Infinite Scroll**:
   - Загрузка при прокрутке
   - Предотвращение дублирующих запросов
   - Обработка конца данных

## Implementation Notes

### Tailwind v4 Configuration

В Tailwind CSS v4 конфигурация делается через CSS переменные. Если нужны кастомные z-index значения, добавьте их в ваш CSS файл:

```css
@import "tailwindcss";

@theme {
  /* Кастомные z-index значения, если нужны дополнительные */
  --z-index-sticky-header: 10;
  --z-index-sticky-column: 20;
}
```

Однако, стандартные Tailwind классы `z-10`, `z-20` уже доступны по умолчанию, поэтому дополнительная конфигурация не требуется для базового функционала таблицы.

### Shadcn UI Components

Необходимо установить следующие shadcn/ui компоненты:

```bash
npx shadcn@latest add table
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dropdown-menu
npx shadcn@latest add skeleton
```

### Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-table": "^8.x",
    "@tanstack/react-router": "^1.x",
    "lucide-react": "^0.x"
  }
}
```

### Performance Considerations

1. **Memoization**: Используем `useMemo` для columns и `useCallback` для обработчиков
2. **Virtual Scrolling**: Для очень больших списков можно добавить `@tanstack/react-virtual`
3. **Debounce**: Для infinite scroll используем debounce на 200ms
4. **Lazy Loading**: Компоненты загружаются только когда нужны

### Accessibility

1. **ARIA Labels**: Все интерактивные элементы имеют aria-label
2. **Keyboard Navigation**: Поддержка Tab, Enter, Space
3. **Screen Readers**: Правильная семантика HTML таблицы
4. **Focus Management**: Видимый focus indicator

## Migration Path

### From Material-UI Table

1. **Column Definition**:
```typescript
// Старый формат
{
  key: 'email',
  label: 'Email',
  renderCell: (value, row) => <div>{value}</div>
}

// Новый формат
{
  accessorKey: 'email',
  header: 'Email',
  cell: ({ getValue, row }) => <div>{getValue()}</div>
}
```

2. **Styling**:
```typescript
// Старый формат
style: { backgroundColor: 'red' }

// Новый формат
className: 'bg-red-500'
```

3. **Fixed Columns**:
```typescript
// Старый формат
isFixed: true

// Новый формат
meta: { pinned: 'left' }
```

## Future Enhancements

1. **Row Selection**: Добавить чекбоксы для выбора строк
2. **Column Resizing**: Возможность изменять ширину колонок
3. **Column Reordering**: Drag & drop для изменения порядка колонок
4. **Export**: Экспорт данных в CSV/Excel
5. **Advanced Filtering**: Фильтры с операторами (equals, contains, greater than)
6. **Virtualization**: Для таблиц с тысячами строк
