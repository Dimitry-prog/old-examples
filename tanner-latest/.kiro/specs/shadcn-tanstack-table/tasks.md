# Implementation Plan

- [x] 1. Setup project structure and install dependencies



  - Create directory structure at `src/shared/components/ui/table/`
  - Install @tanstack/react-table package
  - Install shadcn/ui components (table, button, input, dropdown-menu, skeleton)
  - Verify @tanstack/react-router and lucide-react are available

  - _Requirements: 1.1, 1.2, 14.1, 14.2, 14.3, 14.4_

- [x] 2. Create TypeScript types and interfaces

  - Create `types.ts` file with all type definitions
  - Define `TableProps<TData>` type with all properties
  - Define `TableDataProps<TData, TFilters, TResponse>` type
  - Define `ExtendedColumnDef<TData>` type extending ColumnDef
  - Define `ColumnGroup`, `RowSeparator`, `FetchParams` types
  - Define `TablePaginationProps` and `TableEmptyStateProps` types

  - Export all types from `types.ts`


  - _Requirements: 1.5, 1.6_

- [x] 3. Implement base Table component


- [x] 3.1 Create table.tsx with basic structure

  - Create functional component with generic type parameter
  - Accept TableProps as props with destructuring


  - Setup useReactTable hook with getCoreRowModel
  - Implement basic table rendering with shadcn/ui Table components
  - Use flexRender for headers and cells
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.3, 14.1_





- [x] 3.2 Add pagination support

  - Add getPaginationRowModel to useReactTable
  - Manage pagination state with useState
  - Implement manualPagination for server-side pagination


  - Calculate pageCount from totalRows and pageSize
  - _Requirements: 7.1, 7.2_








- [ ] 3.3 Add sorting and filtering support
  - Add getSortedRowModel and getFilteredRowModel to useReactTable
  - Manage SortingState and ColumnFiltersState with useState


  - Pass state to useReactTable configuration
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 3.4 Add column visibility management


  - Manage ColumnVisibilityState with useState
  - Pass onColumnVisibilityChange to useReactTable
  - _Requirements: 2.4_



- [x] 4. Implement column pinning functionality





- [ ] 4.1 Add column pinning state management
  - Accept columnPinning and onColumnPinningChange props
  - Pass columnPinning state to useReactTable
  - _Requirements: 3.1, 3.2_






- [ ] 4.2 Apply sticky positioning to pinned columns
  - Check column.getIsPinned() for each column
  - Calculate position using column.getStart('left') and column.getAfter('right')
  - Apply Tailwind classes: sticky, z-10, bg-background
  - Apply dynamic left-* or right-* classes based on position
  - Use cn() utility to combine classes



  - _Requirements: 3.3, 3.4, 3.5, 12.3_


- [ ] 5. Implement sticky header functionality
  - Check stickyHeader prop
  - Apply Tailwind classes sticky, top-0, z-10 to TableHeader when enabled





  - Ensure proper z-index layering with pinned columns
  - _Requirements: 4.1, 4.2, 4.3_


- [ ] 6. Implement column grouping with collapsible headers
- [ ] 6.1 Add group header rendering logic
  - Check if columnGroups prop is provided
  - Render additional TableRow for group headers above column headers


  - Calculate colSpan for each group based on visible columns
  - Use TableCell with colSpan for group headers
  - _Requirements: 2.1, 2.2, 2.3, 2.7_

- [x] 6.2 Add group collapse/expand functionality

  - Manage expanded groups state with useState



  - Add click handler to group headers
  - Toggle column visibility using setColumnVisibility

  - Show lucide-react icons (ChevronDown/ChevronRight) for collapsible groups

  - Apply className from group definition to group header cells
  - _Requirements: 2.4, 2.5, 2.6_


- [x] 7. Implement custom cell rendering and styling

- [x] 7.1 Support custom cell renderers

  - Use flexRender with cell.column.columnDef.cell



  - Pass cell.getContext() to cell renderer
  - Support accessorKey for automatic value display
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [ ] 7.2 Apply Tailwind classes to cells and rows
  - Apply className from column definition to cells

  - Call getCellClassName function if provided and apply returned classes
  - Apply rowClassName to all rows

  - Call getRowClassName function if provided and apply returned classes


  - Apply headerClassName to header cells
  - Use cn() utility for class combination

  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 12.1, 12.2, 12.3, 12.4_


- [ ] 8. Implement row separators
  - Call rowSeparators function for each row
  - Render additional TableRow with separator styling when function returns object



  - Apply height from separator object
  - Apply className from separator object
  - _Requirements: 11.1, 11.2, 11.3_



- [-] 9. Implement infinite scroll functionality

- [x] 9.1 Add scroll event handler


  - Wrap table in scrollable container with maxHeight
  - Add onScroll event handler to container
  - Calculate scroll position and threshold


  - Call onLoadMore when near bottom and hasMore is true



  - Prevent multiple calls while isLoading is true
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 9.2 Hide pagination when infinite scroll is enabled

  - Check isLoadOnScroll prop

  - Conditionally render pagination component
  - _Requirements: 7.7_



- [ ] 10. Create TablePagination component
  - Create table-pagination.tsx file
  - Accept table, name, and pageSizeOptions props
  - Use useNavigate and useSearch from @tanstack/react-router

  - Read pagination params from URL search
  - Implement handlePageChange function to update URL
  - Call table.previousPage() and table.nextPage()
  - Render shadcn/ui Button components for Previous/Next
  - Disable buttons based on table.getCanPreviousPage() and table.getCanNextPage()

  - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 11. Create TableEmptyState component




  - Create table-empty-state.tsx file
  - Accept isLoading, isEmpty, and message props
  - Render Skeleton component from shadcn/ui when isLoading is true



  - Render "No results" message when isEmpty is true and not loading
  - Hide component when data exists
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 12. Create TableData component




- [ ] 12.1 Setup component structure and state
  - Create table-data.tsx file
  - Accept TableDataProps with fetchData, transformData, filters, refetchTrigger
  - Manage data, totalRows, and isLoading state with useState
  - _Requirements: 9.1, 9.4_



- [ ] 12.2 Integrate with @tanstack/react-router
  - Use useNavigate and useSearch hooks
  - Read pagination params from URL search using table name

  - Parse skip and take from URL parameter

  - Implement updatePagination function to update URL
  - _Requirements: 7.4, 7.5_



- [x] 12.3 Implement data fetching logic

  - Create useEffect that triggers on skip, take, filters, refetchTrigger changes


  - Call fetchData with FetchParams
  - Transform response using transformData if provided
  - Handle infinite scroll mode by appending data
  - Handle pagination mode by replacing data
  - Update totalRows state

  - Manage isLoading state

  - _Requirements: 9.2, 9.3, 9.5_


- [ ] 12.4 Render Table component with fetched data
  - Pass all props to Table component
  - Pass data and totalRows from state




  - Pass isLoading state
  - _Requirements: 9.4_


- [ ] 13. Create index.ts with exports
  - Export Table component
  - Export TableData component
  - Export TablePagination component
  - Export TableEmptyState component
  - Export all types from types.ts
  - Export shadcn/ui table components if needed
  - _Requirements: 1.6_

- [x] 14. Add cn() utility if not available




  - Check if cn() utility exists in project
  - If not, create utility function using clsx and tailwind-merge
  - Export from appropriate location
  - _Requirements: 12.3, 14.5_


- [x] 15. Write unit tests for Table component


- [x] 15.1 Test basic rendering

  - Test table renders with minimal props
  - Test table renders headers correctly
  - Test table renders data rows correctly
  - Test empty state when no data provided
  - _Requirements: 1.1, 1.2, 10.2_



- [x] 15.2 Test column pinning


  - Test sticky classes applied to pinned columns
  - Test left positioning for left-pinned columns
  - Test right positioning for right-pinned columns
  - Test z-index applied correctly
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


- [x] 15.3 Test sticky header

  - Test sticky classes applied when stickyHeader is true
  - Test sticky classes not applied when stickyHeader is false
  - _Requirements: 4.1, 4.2_

- [x] 15.4 Test column grouping

  - Test group headers render when columnGroups provided
  - Test colSpan calculated correctly
  - Test group collapse/expand functionality
  - Test column visibility changes on group toggle
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

- [x] 15.5 Test custom cell rendering

  - Test cell renderer function called with correct context
  - Test accessorKey displays value automatically
  - Test custom className applied to cells
  - Test getCellClassName function called and classes applied
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_


- [x] 15.6 Test row styling
  - Test rowClassName applied to all rows
  - Test getRowClassName function called for each row
  - Test returned classes applied correctly
  - _Requirements: 6.3, 6.4_



- [x] 15.7 Test row separators
  - Test rowSeparators function called for each row
  - Test separator row rendered when function returns object
  - Test height and className applied to separator
  - _Requirements: 11.1, 11.2, 11.3_



- [x] 15.8 Test infinite scroll

  - Test onLoadMore called when scrolling near bottom
  - Test onLoadMore not called when hasMore is false
  - Test onLoadMore not called when isLoading is true
  - Test scroll threshold calculation
  - _Requirements: 8.1, 8.2, 8.3, 8.4_


- [-] 16. Write unit tests for TableData component

- [x] 16.1 Test data fetching

  - Test fetchData called on component mount
  - Test fetchData called with correct params (skip, take, filters)
  - Test data state updated after successful fetch
  - Test totalRows state updated after successful fetch
  - _Requirements: 9.1, 9.2_


- [x] 16.2 Test filter changes

  - Test fetchData called when filters change
  - Test data reloaded with new filters
  - _Requirements: 9.3_



- [x] 16.3 Test refetch trigger

  - Test fetchData called when refetchTrigger changes
  - _Requirements: 9.3_




- [x] 16.4 Test data transformation
  - Test transformData function called when provided

  - Test transformed data passed to Table component
  - _Requirements: 9.5_



- [x] 16.5 Test infinite scroll mode
  - Test data appended in infinite scroll mode
  - Test data replaced in pagination mode

  - _Requirements: 9.3_



- [x] 16.6 Test URL parameter integration
  - Test pagination params read from URL
  - Test URL updated when pagination changes
  - Test default values used when no URL params
  - _Requirements: 7.4, 7.5_

- [x] 17. Write unit tests for TablePagination component


- [x] 17.1 Test pagination controls

  - Test Previous button calls table.previousPage()
  - Test Next button calls table.nextPage()
  - Test Previous button disabled when cannot go previous
  - Test Next button disabled when cannot go next
  - _Requirements: 7.2, 7.3_



- [x] 17.2 Test URL parameter updates
  - Test URL updated when Previous clicked
  - Test URL updated when Next clicked
  - Test skip and take calculated correctly
  - _Requirements: 7.4, 7.5_

- [x] 18. Write unit tests for TableEmptyState component



- [x] 18.1 Test loading state

  - Test Skeleton rendered when isLoading is true
  - Test Skeleton not rendered when isLoading is false

  - _Requirements: 10.1, 10.3_


- [x] 18.2 Test empty state

  - Test "No results" message shown when isEmpty is true and not loading
  - Test custom message shown when provided
  - Test component hidden when data exists
  - _Requirements: 10.2_


- [x] 19. Write integration tests


- [x] 19.1 Test pagination flow

  - Test full pagination cycle with URL updates
  - Test page size change updates data
  - Test pagination hidden in infinite scroll mode
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7_


- [x] 19.2 Test sorting and filtering
  - Test column sorting updates table
  - Test filter input updates table data
  - Test sorting and filtering work together
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_


- [x] 19.3 Test infinite scroll with data loading
  - Test initial data load
  - Test scroll triggers data load
  - Test data appended correctly
  - Test loading indicator shown during fetch
  - Test no more loads when hasMore is false
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.2, 9.3_
