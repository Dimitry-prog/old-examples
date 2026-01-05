# Multi-Select Component - Новый API

Компонент мультиселекта с компонентным API, аналогичным обычному Select.

## Быстрый старт

```tsx
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/shared/components/ui/multi-select"

export function BasicMultiSelect() {
  const [value, setValue] = React.useState<string[]>([])

  return (
    <MultiSelect value={value} onValueChange={setValue}>
      <MultiSelectTrigger className="w-full max-w-[400px]">
        <MultiSelectValue placeholder="Выберите фреймворки..." />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectGroup>
          <MultiSelectItem value="next.js">Next.js</MultiSelectItem>
          <MultiSelectItem value="react">React</MultiSelectItem>
          <MultiSelectItem value="vue">Vue.js</MultiSelectItem>
          <MultiSelectItem value="svelte">Svelte</MultiSelectItem>
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  )
}
```

## Компоненты

### MultiSelect

Корневой компонент, управляющий состоянием выбранных значений.

**Props:**
- `value?: string[]` - Массив выбранных значений (контролируемый режим)
- `defaultValues?: string[]` - Начальные значения (неконтролируемый режим)
- `onValueChange?: (value: string[]) => void` - Callback при изменении
- `open?: boolean` - Контроль открытия (контролируемый режим)
- `onOpenChange?: (open: boolean) => void` - Callback при изменении открытия
- `children: React.ReactNode` - Дочерние компоненты

### MultiSelectTrigger

Кнопка-триггер для открытия выпадающего списка.

**Props:**
- `className?: string` - Дополнительные CSS классы
- `size?: "sm" | "default"` - Размер компонента
- `children: React.ReactNode` - Обычно содержит MultiSelectValue

### MultiSelectValue

Отображает выбранные значения в виде badges или placeholder.

**Props:**
- `placeholder?: string` - Текст, когда ничего не выбрано
- `overflowBehavior?: "wrap-when-open" | "wrap" | "cutoff"` - Поведение при переполнении
  - `wrap-when-open` (по умолчанию) - переносит badges только когда открыт
  - `wrap` - всегда переносит badges
  - `cutoff` - показывает только первый badge + счетчик остальных
- `className?: string` - Дополнительные CSS классы

### MultiSelectContent

Контейнер для выпадающего списка опций.

**Props:**
- `position?: "popper" | "item-aligned"` - Позиционирование
- `align?: "start" | "center" | "end"` - Выравнивание
- `className?: string` - Дополнительные CSS классы

### MultiSelectGroup

Группа опций (опционально с заголовком).

**Props:**
- `children: React.ReactNode` - MultiSelectItem компоненты

### MultiSelectItem

Отдельная опция для выбора.

**Props:**
- `value: string` - Уникальное значение опции
- `disabled?: boolean` - Отключить опцию
- `children: React.ReactNode` - Отображаемый текст

### MultiSelectLabel

Заголовок для группы опций.

**Props:**
- `children: React.ReactNode` - Текст заголовка
- `className?: string` - Дополнительные CSS классы

## Примеры

### С поиском

```tsx
<MultiSelect value={value} onValueChange={setValue}>
  <MultiSelectTrigger className="w-full">
    <MultiSelectValue placeholder="Выберите..." />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectSearch placeholder="Поиск фреймворков..." />
    <MultiSelectGroup>
      <MultiSelectItem value="next.js">Next.js</MultiSelectItem>
      <MultiSelectItem value="react">React</MultiSelectItem>
      <MultiSelectItem value="vue">Vue.js</MultiSelectItem>
    </MultiSelectGroup>
  </MultiSelectContent>
</MultiSelect>
```

### С группами

```tsx
<MultiSelect value={value} onValueChange={setValue}>
  <MultiSelectTrigger className="w-full">
    <MultiSelectValue placeholder="Выберите технологии..." />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectGroup>
      <MultiSelectLabel>Frontend</MultiSelectLabel>
      <MultiSelectItem value="react">React</MultiSelectItem>
      <MultiSelectItem value="vue">Vue.js</MultiSelectItem>
    </MultiSelectGroup>
    <MultiSelectGroup>
      <MultiSelectLabel>Backend</MultiSelectLabel>
      <MultiSelectItem value="node">Node.js</MultiSelectItem>
      <MultiSelectItem value="express">Express</MultiSelectItem>
    </MultiSelectGroup>
  </MultiSelectContent>
</MultiSelect>
```

### Маленький размер

```tsx
<MultiSelect value={value} onValueChange={setValue}>
  <MultiSelectTrigger className="w-full" size="sm">
    <MultiSelectValue placeholder="Выберите..." />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectGroup>
      <MultiSelectItem value="option1">Опция 1</MultiSelectItem>
      <MultiSelectItem value="option2">Опция 2</MultiSelectItem>
    </MultiSelectGroup>
  </MultiSelectContent>
</MultiSelect>
```

### С отключенными элементами

```tsx
<MultiSelect value={value} onValueChange={setValue}>
  <MultiSelectTrigger className="w-full">
    <MultiSelectValue placeholder="Выберите..." />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectGroup>
      <MultiSelectItem value="option1">Опция 1</MultiSelectItem>
      <MultiSelectItem value="option2" disabled>
        Опция 2 (отключена)
      </MultiSelectItem>
      <MultiSelectItem value="option3">Опция 3</MultiSelectItem>
    </MultiSelectGroup>
  </MultiSelectContent>
</MultiSelect>
```

### Контролируемое состояние

```tsx
const [value, setValue] = React.useState<string[]>(["react", "vue"])

const handleReset = () => setValue([])
const handleSelectAll = () => setValue(["react", "vue", "angular"])

<MultiSelect value={value} onValueChange={setValue}>
  <MultiSelectTrigger className="w-full">
    <MultiSelectValue placeholder="Выберите..." />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectGroup>
      <MultiSelectItem value="react">React</MultiSelectItem>
      <MultiSelectItem value="vue">Vue.js</MultiSelectItem>
      <MultiSelectItem value="angular">Angular</MultiSelectItem>
    </MultiSelectGroup>
  </MultiSelectContent>
</MultiSelect>

<button onClick={handleReset}>Сбросить</button>
<button onClick={handleSelectAll}>Выбрать все</button>
```

## Особенности

✅ **Компонентный API** - Похож на обычный Select
✅ **Badges** - Выбранные значения отображаются как badges
✅ **Удаление** - Можно удалить выбранное значение кликом на X
✅ **Группировка** - Поддержка MultiSelectGroup и MultiSelectLabel
✅ **Размеры** - Поддержка size="sm" и size="default"
✅ **Disabled** - Отключение отдельных опций
✅ **Контролируемый** - Полный контроль через value/onValueChange
✅ **Доступность** - Полная поддержка клавиатуры и ARIA
✅ **Стилизация** - Tailwind CSS с поддержкой темной темы

## Отличия от старого API

**Старый API (multi-select-old.tsx):**
```tsx
<MultiSelect
  options={options}
  onChange={setSelected}
  value={selected}
  placeholder="Выберите..."
/>
```

**Новый API (multi-select.tsx):**
```tsx
<MultiSelect value={value} onValueChange={setValue}>
  <MultiSelectTrigger>
    <MultiSelectValue placeholder="Выберите..." />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectGroup>
      <MultiSelectItem value="option1">Опция 1</MultiSelectItem>
    </MultiSelectGroup>
  </MultiSelectContent>
</MultiSelect>
```

## Примеры использования

Полные примеры доступны в:
- `multi-select-new.example.tsx` - Примеры кода
- `multi-select-new-demo.tsx` - Демо-страница

## Overflow Behavior

Управление отображением выбранных значений при переполнении:

```tsx
<MultiSelect defaultValues={["next.js", "react", "vue", "svelte", "angular"]}>
  <MultiSelectTrigger className="w-[300px]">
    <MultiSelectValue 
      overflowBehavior="cutoff" 
      placeholder="Выберите..." 
    />
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectGroup>
      <MultiSelectItem value="next.js">Next.js</MultiSelectItem>
      <MultiSelectItem value="react">React</MultiSelectItem>
      {/* ... */}
    </MultiSelectGroup>
  </MultiSelectContent>
</MultiSelect>
```

**Режимы:**
- `wrap-when-open` - badges переносятся только когда выпадающий список открыт
- `wrap` - badges всегда переносятся на новую строку
- `cutoff` - показывается только первый badge + счетчик (например: "Next.js +4")

## defaultValues

Для неконтролируемого режима используйте `defaultValues`:

```tsx
<MultiSelect defaultValues={["react", "vue"]}>
  <MultiSelectTrigger>
    <MultiSelectValue placeholder="Выберите..." />
  </MultiSelectTrigger>
  <MultiSelectContent>
    {/* ... */}
  </MultiSelectContent>
</MultiSelect>
```

## Миграция

Если вы использовали старый API, он все еще доступен в `multi-select-old.tsx`. Новый API рекомендуется для новых проектов.
