# Table Component Demo

## Доступ к демо-странице

Демо-страница доступна по адресу: **http://localhost:5001/demo/table**

## Возможности таблицы

### ✓ Основные функции
- **Пагинация** с синхронизацией URL
- **Сортировка** колонок
- **Фильтрация** данных
- **Sticky header** (закрепленный заголовок)
- **Загрузка данных** с сервера (mock API)

### ✓ Группировка колонок
- Сворачиваемые группы колонок
- Кастомные стили для групп
- Управление видимостью групп

### ✓ Стилизация
- Динамическая стилизация ячеек
- Условные классы для строк
- Кастомные рендереры ячеек
- Разделители между строками

### ✓ Состояния
- Индикация загрузки
- Пустое состояние
- Обработка ошибок

## Быстрый старт

```tsx
import { TableData } from "@/shared/components/ui/table";

// Определите тип данных
type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
};

// Определите колонки с группами (упрощенный формат!)
const columns: ExtendedColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
    group: "Product Info",  // Просто строка!
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ getValue }) => `$${getValue()}`,
    group: "Product Info",  // Та же группа
  },
];

// Функция загрузки данных
const fetchData = async (params: FetchParams) => {
  const response = await fetch(`/api/products?skip=${params.skip}&take=${params.take}`);
  return response.json();
};

// Используйте компонент
<TableData
  name="products"
  columns={columns}
  fetchData={fetchData}
  pageSize={10}
/>
```

## Примеры использования

Смотрите полный пример в файле `demo-page.tsx` с:
- Моковыми данными
- Всеми возможностями таблицы
- Группировкой колонок
- Условной стилизацией
- Разделителями строк
