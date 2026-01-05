# Multi-Select Component

Компонент мультиселекта, построенный на основе Radix UI и cmdk, с полной поддержкой TypeScript.

## Установка

Компонент уже установлен в проекте. Необходимые зависимости:

```bash
pnpm add cmdk @radix-ui/react-icons class-variance-authority
```

## Основное использование

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

## API

### MultiSelectProps

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `value` | `MultiSelectOption[]` | `undefined` | Выбранные значения (контролируемый режим) |
| `defaultOptions` | `MultiSelectOption[]` | `[]` | Начальные опции по умолчанию |
| `options` | `MultiSelectOption[]` | `[]` | Статические опции для отображения |
| `placeholder` | `string` | `undefined` | Текст placeholder |
| `onChange` | `(options: MultiSelectOption[]) => void` | `undefined` | Callback при изменении выбора |
| `disabled` | `boolean` | `false` | Отключить компонент |
| `maxSelected` | `number` | `Number.MAX_SAFE_INTEGER` | Максимальное количество выбранных элементов |
| `onMaxSelected` | `(maxLimit: number) => void` | `undefined` | Callback при достижении лимита |
| `hidePlaceholderWhenSelected` | `boolean` | `false` | Скрыть placeholder при выборе |
| `groupBy` | `string` | `undefined` | Ключ для группировки опций |
| `creatable` | `boolean` | `false` | Разрешить создание новых опций |
| `onSearch` | `(value: string) => Promise<MultiSelectOption[]>` | `undefined` | Асинхронный поиск |
| `onSearchSync` | `(value: string) => MultiSelectOption[]` | `undefined` | Синхронный поиск |
| `delay` | `number` | `500` | Задержка debounce для поиска (мс) |
| `triggerSearchOnFocus` | `boolean` | `false` | Запускать поиск при фокусе |
| `loadingIndicator` | `React.ReactNode` | `undefined` | Индикатор загрузки |
| `emptyIndicator` | `React.ReactNode` | `undefined` | Индикатор пустого состояния |
| `className` | `string` | `undefined` | Дополнительные CSS классы |
| `badgeClassName` | `string` | `undefined` | CSS классы для badge |
| `hideClearAllButton` | `boolean` | `false` | Скрыть кнопку очистки всех |
| `selectFirstItem` | `boolean` | `true` | Автоматически выделять первый элемент |

### MultiSelectOption

```typescript
type MultiSelectOption = {
  label: string          // Отображаемый текст
  value: string          // Уникальный идентификатор
  icon?: React.ComponentType<{ className?: string }> // Опциональная иконка
  disabled?: boolean     // Отключить опцию
  fixed?: boolean        // Зафиксированная опция (нельзя удалить)
  [key: string]: any     // Дополнительные свойства для группировки
}
```

### MultiSelectRef

Методы для императивного управления:

```typescript
type MultiSelectRef = {
  selectedValue: MultiSelectOption[]  // Текущие выбранные значения
  input: HTMLInputElement             // Ссылка на input элемент
  focus: () => void                   // Установить фокус
  reset: () => void                   // Сбросить выбор
}
```

## Примеры использования

### Базовый пример

```tsx
const [selected, setSelected] = useState<MultiSelectOption[]>([])

const options: MultiSelectOption[] = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
]

<MultiSelect
  options={options}
  onChange={setSelected}
  value={selected}
  placeholder="Выберите фреймворки..."
/>
```

### С группировкой

```tsx
const options: MultiSelectOption[] = [
  { label: "React", value: "react", category: "Frontend" },
  { label: "Vue", value: "vue", category: "Frontend" },
  { label: "Node.js", value: "nodejs", category: "Backend" },
  { label: "Express", value: "express", category: "Backend" },
]

<MultiSelect
  options={options}
  onChange={setSelected}
  value={selected}
  groupBy="category"
  placeholder="Выберите технологии..."
/>
```

### С ограничением количества

```tsx
<MultiSelect
  options={options}
  onChange={setSelected}
  value={selected}
  maxSelected={3}
  onMaxSelected={(limit) => alert(`Максимум ${limit} элементов`)}
  placeholder="Выберите до 3 элементов..."
/>
```

### С возможностью создания

```tsx
<MultiSelect
  options={options}
  onChange={setSelected}
  value={selected}
  creatable
  emptyIndicator={<p className="text-center text-sm">Ничего не найдено</p>}
  placeholder="Выберите или создайте..."
/>
```

### С асинхронным поиском

```tsx
const searchOptions = async (searchTerm: string) => {
  const response = await fetch(`/api/search?q=${searchTerm}`)
  return response.json()
}

<MultiSelect
  onChange={setSelected}
  value={selected}
  onSearch={searchOptions}
  loadingIndicator={<p className="py-2 text-center">Загрузка...</p>}
  emptyIndicator={<p className="py-2 text-center">Ничего не найдено</p>}
  placeholder="Поиск..."
/>
```

### С фиксированными значениями

```tsx
const [selected, setSelected] = useState<MultiSelectOption[]>([
  { label: "Admin", value: "admin", fixed: true },
])

const options: MultiSelectOption[] = [
  { label: "Admin", value: "admin", fixed: true },
  { label: "User", value: "user" },
  { label: "Guest", value: "guest" },
]

<MultiSelect
  options={options}
  onChange={setSelected}
  value={selected}
  placeholder="Выберите роли..."
/>
```

### С императивным управлением

```tsx
const multiSelectRef = useRef<MultiSelectRef>(null)

<MultiSelect
  ref={multiSelectRef}
  options={options}
  onChange={setSelected}
  value={selected}
/>

<button onClick={() => multiSelectRef.current?.reset()}>
  Сбросить
</button>
<button onClick={() => multiSelectRef.current?.focus()}>
  Фокус
</button>
<button onClick={() => {
  const values = multiSelectRef.current?.selectedValue
  console.log(values)
}}>
  Получить значения
</button>
```

## Стилизация

Компонент использует Tailwind CSS и поддерживает темную тему через CSS переменные. Вы можете кастомизировать стили через:

- `className` - для основного контейнера
- `badgeClassName` - для выбранных элементов (badges)

```tsx
<MultiSelect
  className="w-full max-w-md"
  badgeClassName="bg-blue-500 text-white"
  options={options}
  onChange={setSelected}
  value={selected}
/>
```

## Доступность

Компонент полностью доступен и поддерживает:

- Навигацию с клавиатуры (стрелки, Enter, Escape, Backspace)
- Screen readers
- ARIA атрибуты
- Focus management

## Примеры

Полные примеры использования доступны в файле `multi-select.example.tsx`.
