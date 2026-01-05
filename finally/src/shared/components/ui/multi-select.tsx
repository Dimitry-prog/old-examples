import * as React from "react";
import { CheckIcon, ChevronDownIcon, Search, X } from "lucide-react";

import { cn } from "@/shared/libs/utils/index";
import { Badge } from "./badge";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type OverflowBehavior = "wrap-when-open" | "wrap" | "cutoff";
type IndicatorPosition = "left" | "right";

type MultiSelectContextValue = {
	value: string[];
	onValueChange: (value: string[]) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	indicatorIcon?: React.ReactNode;
	indicatorPosition: IndicatorPosition;
};

const MultiSelectContext = React.createContext<
	MultiSelectContextValue | undefined
>(undefined);

function useMultiSelect() {
	const context = React.useContext(MultiSelectContext);
	if (!context) {
		throw new Error("useMultiSelect must be used within MultiSelect");
	}
	return context;
}

function MultiSelect({
	value,
	defaultValues = [],
	onValueChange,
	children,
	open: controlledOpen,
	onOpenChange,
	indicatorIcon,
	indicatorPosition = "right",
}: {
	value?: string[];
	defaultValues?: string[];
	onValueChange?: (value: string[]) => void;
	children: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	indicatorIcon?: React.ReactNode;
	indicatorPosition?: IndicatorPosition;
}) {
	const [internalValue, setInternalValue] = React.useState<string[]>(
		value ?? defaultValues,
	);
	const [internalOpen, setInternalOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");

	const isControlled = value !== undefined;
	const currentValue = isControlled ? value : internalValue;
	const currentOpen =
		controlledOpen !== undefined ? controlledOpen : internalOpen;

	const handleValueChange = React.useCallback(
		(newValues: string[]) => {
			if (!isControlled) {
				setInternalValue(newValues);
			}
			onValueChange?.(newValues);
		},
		[onValueChange, isControlled],
	);

	const handleOpenChange = React.useCallback(
		(open: boolean) => {
			if (controlledOpen === undefined) {
				setInternalOpen(open);
			}
			onOpenChange?.(open);
			// Сбрасываем поиск при закрытии
			if (!open) {
				setSearchQuery("");
			}
		},
		[controlledOpen, onOpenChange],
	);

	React.useEffect(() => {
		if (isControlled && value) {
			setInternalValue(value);
		}
	}, [value, isControlled]);

	return (
		<MultiSelectContext.Provider
			value={{
				value: currentValue,
				onValueChange: handleValueChange,
				open: currentOpen,
				setOpen: handleOpenChange,
				searchQuery,
				setSearchQuery,
				indicatorIcon,
				indicatorPosition,
			}}
		>
			<Popover open={currentOpen} onOpenChange={handleOpenChange}>
				{children}
			</Popover>
		</MultiSelectContext.Provider>
	);
}

function MultiSelectTrigger({
	className,
	size = "default",
	children,
}: {
	className?: string;
	size?: "sm" | "default";
	children: React.ReactNode;
}) {
	return (
		<PopoverTrigger asChild>
			<button
				type="button"
				data-slot="multi-select-trigger"
				data-size={size}
				className={cn(
					"border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:min-h-9 data-[size=sm]:min-h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
					className,
				)}
			>
				<div className="flex-1 overflow-hidden text-left">{children}</div>
				<ChevronDownIcon className="size-4 opacity-50 shrink-0" />
			</button>
		</PopoverTrigger>
	);
}

function MultiSelectValue({
	placeholder,
	className,
	overflowBehavior = "wrap-when-open",
	maxDisplay,
	showAllWhenOpen = true,
}: {
	placeholder?: string;
	className?: string;
	overflowBehavior?: OverflowBehavior;
	maxDisplay?: number;
	showAllWhenOpen?: boolean;
}) {
	const { value, onValueChange, open } = useMultiSelect();

	const handleRemove = (itemValue: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onValueChange(value.filter((v) => v !== itemValue));
	};

	if (value.length === 0) {
		return (
			<span
				className={cn("text-muted-foreground", className)}
				data-slot="multi-select-value"
			>
				{placeholder}
			</span>
		);
	}

	// Определяем сколько элементов показывать
	const shouldShowAll = showAllWhenOpen && open;
	const displayLimit = shouldShowAll ? undefined : maxDisplay;
	const visibleItems =
		displayLimit !== undefined ? value.slice(0, displayLimit) : value;
	const remainingCount =
		displayLimit !== undefined ? value.length - displayLimit : 0;

	const shouldWrap =
		overflowBehavior === "wrap" ||
		(overflowBehavior === "wrap-when-open" && open);

	// Режим cutoff (старая логика для обратной совместимости)
	if (overflowBehavior === "cutoff" && !open && !maxDisplay) {
		const remaining = value.length - 1;
		return (
			<span
				className={cn("flex gap-1 items-center", className)}
				data-slot="multi-select-value"
			>
				<Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
					<span>{value[0]}</span>
					<button
						type="button"
						className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
						onMouseDown={(e) => handleRemove(value[0], e)}
						onClick={(e) => e.stopPropagation()}
					>
						<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
					</button>
				</Badge>
				{remaining > 0 && (
					<span className="text-muted-foreground text-xs">+{remaining}</span>
				)}
			</span>
		);
	}

	return (
		<span
			className={cn(
				"flex gap-1 items-center",
				shouldWrap ? "flex-wrap" : "overflow-hidden",
				className,
			)}
			data-slot="multi-select-value"
		>
			{visibleItems.map((item) => (
				<Badge
					key={item}
					variant="secondary"
					className="gap-1 pr-1 text-xs font-normal shrink-0"
				>
					<span>{item}</span>
					<button
						type="button"
						className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
						onMouseDown={(e) => handleRemove(item, e)}
						onClick={(e) => e.stopPropagation()}
					>
						<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
					</button>
				</Badge>
			))}
			{remainingCount > 0 && (
				<Badge
					variant="secondary"
					className="text-xs font-normal shrink-0 pointer-events-none"
				>
					+{remainingCount}
				</Badge>
			)}
		</span>
	);
}

function MultiSelectContent({
	className,
	children,
	align = "start",
}: {
	className?: string;
	children: React.ReactNode;
	align?: "start" | "center" | "end";
}) {
	return (
		<PopoverContent
			data-slot="multi-select-content"
			align={align}
			className={cn(
				"w-full min-w-[var(--radix-popover-trigger-width)] max-h-96 overflow-y-auto p-1",
				className,
			)}
		>
			{children}
		</PopoverContent>
	);
}

function MultiSelectGroup({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			data-slot="multi-select-group"
			className={cn("py-1", className)}
			role="group"
		>
			{children}
		</div>
	);
}

function MultiSelectLabel({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			data-slot="multi-select-label"
			className={cn(
				"text-muted-foreground px-2 py-1.5 text-xs font-semibold",
				className,
			)}
		>
			{children}
		</div>
	);
}

function MultiSelectItem({
	className,
	children,
	value: itemValue,
	disabled,
	keywords,
}: {
	className?: string;
	children: React.ReactNode;
	value: string;
	disabled?: boolean;
	keywords?: string[];
}) {
	const {
		value,
		onValueChange,
		searchQuery,
		indicatorIcon,
		indicatorPosition,
	} = useMultiSelect();
	const isSelected = value.includes(itemValue);

	// Фильтрация по поисковому запросу
	const searchTerms = searchQuery.toLowerCase().trim();
	const itemText = children?.toString().toLowerCase() || "";
	const itemValueLower = itemValue.toLowerCase();
	const keywordsLower = keywords?.map((k) => k.toLowerCase()) || [];

	const isVisible =
		!searchTerms ||
		itemText.includes(searchTerms) ||
		itemValueLower.includes(searchTerms) ||
		keywordsLower.some((k) => k.includes(searchTerms));

	const handleClick = () => {
		if (disabled) return;
		if (isSelected) {
			onValueChange(value.filter((v) => v !== itemValue));
		} else {
			onValueChange([...value, itemValue]);
		}
	};

	if (!isVisible) return null;

	const indicator = isSelected && (
		<span className="flex size-3.5 items-center justify-center shrink-0">
			{indicatorIcon || <CheckIcon className="size-4" />}
		</span>
	);

	return (
		<div
			data-slot="multi-select-item"
			role="option"
			aria-selected={isSelected}
			aria-disabled={disabled}
			className={cn(
				"focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground",
				indicatorPosition === "right" ? "pr-8 pl-2" : "pl-8 pr-2",
				disabled && "pointer-events-none opacity-50",
				className,
			)}
			onClick={handleClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleClick();
				}
			}}
			tabIndex={disabled ? -1 : 0}
		>
			{indicatorPosition === "left" && (
				<span className="absolute left-2">{indicator}</span>
			)}
			<span className="flex-1">{children}</span>
			{indicatorPosition === "right" && (
				<span className="absolute right-2">{indicator}</span>
			)}
		</div>
	);
}

function MultiSelectSeparator({ className }: { className?: string }) {
	return (
		<div
			data-slot="multi-select-separator"
			className={cn("bg-border -mx-1 my-1 h-px", className)}
		/>
	);
}

function MultiSelectSearch({
	placeholder = "Search...",
	className,
}: {
	placeholder?: string;
	className?: string;
}) {
	const { searchQuery, setSearchQuery } = useMultiSelect();
	const inputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		// Автофокус на поле поиска при открытии
		const timer = setTimeout(() => {
			inputRef.current?.focus();
		}, 0);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			data-slot="multi-select-search"
			className={cn("flex items-center border-b px-3 pb-2", className)}
		>
			<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
			<input
				ref={inputRef}
				type="text"
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				placeholder={placeholder}
				className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
				onKeyDown={(e) => {
					// Предотвращаем закрытие при нажатии Escape
					if (e.key === "Escape") {
						e.stopPropagation();
						if (searchQuery) {
							setSearchQuery("");
						}
					}
				}}
			/>
			{searchQuery && (
				<button
					type="button"
					onClick={() => setSearchQuery("")}
					className="ml-2 rounded-full p-1 hover:bg-accent"
				>
					<X className="h-3 w-3" />
				</button>
			)}
		</div>
	);
}

export type { OverflowBehavior, IndicatorPosition };

export {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectLabel,
	MultiSelectSearch,
	MultiSelectSeparator,
	MultiSelectTrigger,
	MultiSelectValue,
};
