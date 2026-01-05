# Quick Start - Table Component

## Минимальный пример

```tsx
import { TableData } from "@/shared/components/ui/table";

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
];

const fetchData = async ({ skip, take }) => {
  const res = await fetch(`/api/data?skip=${skip}&take=${take}`);
  return res.json();
};

<TableData
  name="my-table"
  columns={columns}
  fetchData={fetchData}
/>
```

## С группировкой колонок

```tsx
const columns = [
  {
    accessorKey: "id",
    header: "ID",
    // Без группы
  },
  {
    accessorKey: "category",
    header: "Category",
    group: "Info",  // Упрощенный формат!
  },
  {
    accessorKey: "price",
    header: "Price",
    group: "Info",  // Та же группа
  },
  {
    accessorKey: "notes",
    header: "Notes",
    group: { name: "Extra", defaultExpanded: false },  // Свернута по умолчанию
  },
];
```

## Все возможности

```tsx
<TableData
  name="products"
  columns={columns}
  fetchData={fetchData}
  
  // Пагинация
  pageSize={10}
  pageSizeOptions={[5, 10, 20, 50]}
  
  // Стилизация
  stickyHeader
  maxHeight="600px"
  rowClassName="hover:bg-gray-50"
  getRowClassName={(row, index) => row.status === "inactive" ? "opacity-50" : ""}
  
  // Разделители
  rowSeparators={(row, index) => 
    (index + 1) % 5 === 0 ? { height: 8, className: "bg-gray-200" } : null
  }
  
  // Обновление данных
  refetchTrigger={refetchCounter}
/>
```

## Кастомные ячейки

```tsx
{
  accessorKey: "status",
  header: "Status",
  cell: ({ getValue }) => {
    const status = getValue();
    return <Badge variant={status === "active" ? "success" : "error"}>{status}</Badge>;
  },
  getCellClassName: (value) => value === "active" ? "bg-green-50" : "bg-red-50",
}
```

## Демо

Полный пример: http://localhost:5001/demo/table
