# Dropdown для выбора страницы

## Как работает

При клике на троеточие (...) открывается dropdown со списком скрытых страниц.

## Визуальный пример

### Начальное троеточие (ellipsis-start)

```
Страница 10 из 20:

⏮ ◀ 1 ... 9 [10] 11 ... 20 ▶ ⏭
       ↓ (клик)
   ┌─────────┐
   │ Page 2  │
   │ Page 3  │
   │ Page 4  │
   │ Page 5  │
   │ Page 6  │
   │ Page 7  │
   │ Page 8  │
   └─────────┘
```

Показывает страницы между первой (1) и началом видимого диапазона (9).

### Конечное троеточие (ellipsis-end)

```
Страница 10 из 20:

⏮ ◀ 1 ... 9 [10] 11 ... 20 ▶ ⏭
                    ↓ (клик)
                ┌─────────┐
                │ Page 12 │
                │ Page 13 │
                │ Page 14 │
                │ Page 15 │
                │ Page 16 │
                │ Page 17 │
                │ Page 18 │
                │ Page 19 │
                └─────────┘
```

Показывает страницы между концом видимого диапазона (11) и последней (20).

## Логика отображения

### Начальное троеточие
- Появляется когда `currentPage > 3`
- Показывает страницы от 2 до `currentPage - 2`
- Пример: на странице 10 показывает 2-8

### Конечное троеточие
- Появляется когда `currentPage < totalPages - 2`
- Показывает страницы от `currentPage + 2` до `totalPages - 1`
- Пример: на странице 10 из 20 показывает 12-19

## Поведение

1. **Клик на троеточие** - открывает dropdown
2. **Клик на страницу** - переходит на страницу и закрывает dropdown
3. **Клик вне dropdown** - закрывает dropdown
4. **Скролл** - если страниц много (max-height: 200px)

## Стилизация

```tsx
// Dropdown контейнер
className="absolute top-full mt-1 z-50 min-w-[80px] rounded-md border border-gray-200 bg-white shadow-lg"

// Список страниц
className="max-h-[200px] overflow-y-auto py-1"

// Элемент страницы
className="w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
```

## Технические детали

### Состояние
```tsx
const [openDropdown, setOpenDropdown] = useState<"start" | "end" | null>(null);
```

### Закрытие при клике вне
```tsx
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpenDropdown(null);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
```

### Генерация списка страниц
```tsx
const getDropdownPages = (type: "start" | "end") => {
  const pages: number[] = [];
  if (type === "start") {
    // Страницы между 1 и текущим видимым диапазоном
    const start = 2;
    const end = Math.max(2, currentPage - 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  } else {
    // Страницы между текущим видимым диапазоном и последней
    const start = Math.min(totalPages - 1, currentPage + 2);
    const end = totalPages - 1;
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  return pages;
};
```

## Примеры

### Страница 5 из 20
```
⏮ ◀ 1 ... 4 [5] 6 ... 20 ▶ ⏭
       ↓              ↓
   Page 2-3      Page 7-19
```

### Страница 15 из 20
```
⏮ ◀ 1 ... 14 [15] 16 ... 20 ▶ ⏭
       ↓                ↓
   Page 2-13       Page 17-19
```

### Страница 3 из 20
```
⏮ ◀ 1 2 [3] 4 ... 20 ▶ ⏭
              ↓
         Page 5-19
(Начальное троеточие не показывается, т.к. currentPage <= 3)
```
