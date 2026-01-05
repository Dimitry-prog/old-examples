# Migration Guide - Убрали дублирование columnGroups

## Что изменилось

Раньше нужно было определять группы колонок дважды:
1. В определении колонок (`columns[].group`)
2. В пропе компонента (`columnGroups`)

Теперь группы автоматически извлекаются из определений колонок.

## До (старый способ)

```tsx
const columns: ExtendedColumnDef<Product>[] = [
  {
    accessorKey: "category",
    header: "Category",
    group: {
      name: "Product Info",
      collapsible: true,
      defaultExpanded: true,
      className: "bg-blue-50",
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    group: {
      name: "Product Info",
      collapsible: true,
      defaultExpanded: true,
      className: "bg-blue-50",
    },
  },
];

<TableData
  columns={columns}
  columnGroups={[
    {
      name: "Product Info",
      collapsible: true,
      defaultExpanded: true,
      className: "bg-blue-50",
    },
  ]}
/>
```

## После (новый способ)

```tsx
const columns: ExtendedColumnDef<Product>[] = [
  {
    accessorKey: "category",
    header: "Category",
    group: {
      name: "Product Info",
      collapsible: true,
      defaultExpanded: true,
      className: "bg-blue-50",
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    group: {
      name: "Product Info",
      collapsible: true,
      defaultExpanded: true,
      className: "bg-blue-50",
    },
  },
];

<TableData
  columns={columns}
  // columnGroups больше не нужен!
/>
```

## Как мигрировать

1. **Удалите проп `columnGroups`** из всех использований `<Table>` и `<TableData>`
2. **Убедитесь, что настройки группы одинаковые** для всех колонок одной группы
3. Готово! Группы будут автоматически извлечены из колонок

## Преимущества

✅ Нет дублирования кода
✅ Меньше вероятность ошибок (забыть обновить в одном месте)
✅ Более чистый и понятный API
✅ Меньше пропов для передачи

## Технические детали

Компонент `Table` теперь использует `useMemo` для автоматического извлечения уникальных групп из определений колонок. Используется первое вхождение каждой группы.
