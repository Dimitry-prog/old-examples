# Multi-Select - Быстрый старт

## Что это?

Multi-Select - это компонент для выбора нескольких значений из списка. Построен на основе вашего существующего Select компонента с использованием Radix UI и cmdk.

## Быстрый старт

### 1. Базовое использование

```tsx
import { MultiSelect, type MultiSelectOption } from "@/shared/components/ui/multi-select"
import { useState } from "react"

function MyComponent() {
  const [selected, setSelected] = useState<MultiSelectOption[]>([])

  const options: MultiSelectOption[] = [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Angular", value: "angular" },
  ]

  return (
    <MultiSelect
      options={options}
      onChange={setSelected}
      value={selected}
      placeholder="Выберите фреймворки..."
    />
  )
}
```

### 2. С группировкой

```tsx
const options: MultiSelectOption[] = [
  { label: "React", value: "react", category: "Frontend" },
  { label: "Vue", value: "vue", category: "Frontend" },
  { label: "Node.js", value: "nodejs", category: "Backend" },
]

<MultiSelect
  options={options}
  onChange={setSelected}
  value={selected}
  groupBy="category"  // Группировка по полю category
/>
```

### 3. С ограничением количества

```tsx
<MultiSelect
  options={options}
  onChange={setSelected}
  value={selected}
  maxSelected={3}  // Максимум 3 элемента
  onMaxSelected={(limit) => alert(`Максимум ${limit} элементов`)}
/>
```

### 4. С возможностью создания новых опций

```tsx
<MultiSelect
  options={options}
  onChange={setSelected}
  value={selected}
  creatable  // Можно создавать новые опции
  emptyIndicator={<p>Ничего не найдено</p>}
/>
```

### 5. С асинхронным поиском

```tsx
const searchOptions = async (searchTerm: string) => {
  const response = await fetch(`/api/search?q=${searchTerm}`)
  return response.json()
}

<MultiSelect
  onChange={setSelected}
  value={selected}
  onSearch={searchOptions}  // Асинхронный поиск
  loadingIndicator={<p>Загрузка...</p>}
/>
```

## Основные свойства

| Свойство | Описание | Пример |
|----------|----------|--------|
| `options` | Список опций | `[{ label: "React", value: "react" }]` |
| `value` | Выбранные значения | `[{ label: "React", value: "react" }]` |
| `onChange` | Callback при изменении | `(values) => setSelected(values)` |
| `placeholder` | Текст placeholder | `"Выберите..."` |
| `maxSelected` | Максимум элементов | `3` |
| `groupBy` | Поле для группировки | `"category"` |
| `creatable` | Создание новых опций | `true` |
| `onSearch` | Асинхронный поиск | `async (term) => fetchData(term)` |
| `disabled` | Отключить компонент | `true` |

## Структура опции

```typescript
type MultiSelectOption = {
  label: string          // Отображаемый текст
  value: string          // Уникальный ID
  disabled?: boolean     // Отключить опцию
  fixed?: boolean        // Нельзя удалить
  [key: string]: any     // Дополнительные поля
}
```

## Примеры

Полные примеры смотрите в файлах:
- `multi-select.example.tsx` - примеры кода
- `multi-select-demo.tsx` - демо-страница
- `MULTI-SELECT-README.md` - полная документация

## Клавиатурные сокращения

- `Backspace` / `Delete` - удалить последний выбранный элемент
- `Escape` - закрыть выпадающий список
- `↑` / `↓` - навигация по опциям
- `Enter` - выбрать опцию

## Стилизация

```tsx
<MultiSelect
  className="w-full max-w-md"           // Стили контейнера
  badgeClassName="bg-blue-500"          // Стили выбранных элементов
  options={options}
  onChange={setSelected}
  value={selected}
/>
```
