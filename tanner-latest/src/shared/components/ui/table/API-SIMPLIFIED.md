# Упрощенный API для групп колонок

## До упрощения

```tsx
{
  accessorKey: "category",
  header: "Category",
  group: {
    name: "Product Info",
    collapsible: true,        // По умолчанию true
    defaultExpanded: true,    // По умолчанию true
    className: "bg-blue-50",
  },
}
```

## После упрощения

### Вариант 1: Просто строка (самый простой)
```tsx
{
  accessorKey: "category",
  header: "Category",
  group: "Product Info",  // collapsible: true, defaultExpanded: true
}
```

### Вариант 2: Объект с настройками
```tsx
{
  accessorKey: "category",
  header: "Category",
  group: { 
    name: "Product Info",
    defaultExpanded: false,  // Свернута по умолчанию
  },
}
```

### Вариант 3: Полная кастомизация
```tsx
{
  accessorKey: "category",
  header: "Category",
  group: { 
    name: "Product Info",
    collapsible: false,      // Нельзя сворачивать
    className: "bg-blue-50", // Кастомные стили
  },
}
```

## Значения по умолчанию

| Свойство | По умолчанию | Описание |
|----------|--------------|----------|
| `collapsible` | `true` | Можно ли сворачивать группу |
| `defaultExpanded` | `true` | Развернута ли группа при загрузке |
| `className` | `undefined` | CSS классы для заголовка группы |

## Примеры использования

```tsx
const columns = [
  // Без группы
  { accessorKey: "id", header: "ID" },
  
  // Обычная группа (можно сворачивать, развернута)
  { accessorKey: "name", header: "Name", group: "Main" },
  { accessorKey: "email", header: "Email", group: "Main" },
  
  // Свернута по умолчанию
  { accessorKey: "notes", header: "Notes", group: { name: "Extra", defaultExpanded: false } },
  { accessorKey: "tags", header: "Tags", group: { name: "Extra", defaultExpanded: false } },
  
  // Нельзя сворачивать
  { accessorKey: "status", header: "Status", group: { name: "Critical", collapsible: false } },
  
  // С кастомными стилями
  { accessorKey: "price", header: "Price", group: { name: "Finance", className: "bg-green-50" } },
];
```

## Преимущества

✅ **Меньше кода** - `group: "Name"` вместо 4 строк
✅ **Умные значения по умолчанию** - не нужно указывать `collapsible: true`
✅ **Гибкость** - можно использовать строку или объект
✅ **Обратная совместимость** - старый формат тоже работает
