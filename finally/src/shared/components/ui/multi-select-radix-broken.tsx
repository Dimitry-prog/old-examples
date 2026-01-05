import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, X } from "lucide-react";

import { cn } from "@/shared/libs/utils/index";
import { Badge } from "./badge";

type OverflowBehavior = "wrap-when-open" | "wrap" | "cutoff";

type MultiSelectContextValue = {
	value: string[];
	onValueChange: (value: string[]) => void;
	open: boolean;
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
	...props
}: Omit<
	React.ComponentProps<typeof SelectPrimitive.Root>,
	"value" | "onValueChange"
> & {
	value?: string[];
	defaultValues?: string[];
	onValueChange?: (value: string[]) => void;
}) {
	const [internalValue, setInternalValue] = React.useState<string[]>(
		value ?? defaultValues,
	);
	const [internalOpen, setInternalOpen] = React.useState(false);

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
			}}
		>
			<SelectPrimitive.Root
				open={currentOpen}
				onOpenChange={handleOpenChange}
				{...props}
			>
				{children}
			</SelectPrimitive.Root>
		</MultiSelectContext.Provider>
	);
}

function MultiSelectGroup({
	...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
	return <SelectPrimitive.Group data-slot="multi-select-group" {...props} />;
}

function MultiSelectValue({
	placeholder,
	className,
	overflowBehavior = "wrap-when-open",
}: React.ComponentProps<typeof SelectPrimitive.Value> & {
	placeholder?: string;
	overflowBehavior?: OverflowBehavior;
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

	// Определяем поведение переноса
	const shouldWrap =
		overflowBehavior === "wrap" ||
		(overflowBehavior === "wrap-when-open" && open);

	// Для cutoff режима показываем только первый элемент + счетчик
	if (overflowBehavior === "cutoff" && !open) {
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
			{value.map((item) => (
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
		</span>
	);
}

function MultiSelectTrigger({
	className,
	size = "default",
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
	size?: "sm" | "default";
}) {
	return (
		<SelectPrimitive.Trigger
			data-slot="multi-select-trigger"
			data-size={size}
			className={cn(
				"border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:min-h-9 data-[size=sm]:min-h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<div className="flex-1 overflow-hidden">{children}</div>
			<SelectPrimitive.Icon asChild>
				<ChevronDownIcon className="size-4 opacity-50" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function MultiSelectContent({
	className,
	children,
	position = "popper",
	align = "center",
	...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				data-slot="multi-select-content"
				className={cn(
					"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
					position === "popper" &&
						"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
					className,
				)}
				position={position}
				align={align}
				{...props}
			>
				<MultiSelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(
						"p-1",
						position === "popper" &&
							"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<MultiSelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function MultiSelectLabel({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot="multi-select-label"
			className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
			{...props}
		/>
	);
}

function MultiSelectItem({
	className,
	children,
	value: itemValue,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
	const { value, onValueChange } = useMultiSelect();
	const isSelected = value.includes(itemValue);

	const handleSelect = (e: Event) => {
		e.preventDefault();
		if (isSelected) {
			onValueChange(value.filter((v) => v !== itemValue));
		} else {
			onValueChange([...value, itemValue]);
		}
	};

	return (
		<SelectPrimitive.Item
			data-slot="multi-select-item"
			value={itemValue}
			className={cn(
				"focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			onSelect={handleSelect}
			{...props}
		>
			<span className="absolute right-2 flex size-3.5 items-center justify-center">
				{isSelected && <CheckIcon className="size-4" />}
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function MultiSelectSeparator({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot="multi-select-separator"
			className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
			{...props}
		/>
	);
}

function MultiSelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
	return (
		<SelectPrimitive.ScrollUpButton
			data-slot="multi-select-scroll-up-button"
			className={cn(
				"flex cursor-default items-center justify-center py-1",
				className,
			)}
			{...props}
		>
			<ChevronUpIcon className="size-4" />
		</SelectPrimitive.ScrollUpButton>
	);
}

function MultiSelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
	return (
		<SelectPrimitive.ScrollDownButton
			data-slot="multi-select-scroll-down-button"
			className={cn(
				"flex cursor-default items-center justify-center py-1",
				className,
			)}
			{...props}
		>
			<ChevronDownIcon className="size-4" />
		</SelectPrimitive.ScrollDownButton>
	);
}

export type { OverflowBehavior };

export {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectLabel,
	MultiSelectScrollDownButton,
	MultiSelectScrollUpButton,
	MultiSelectSeparator,
	MultiSelectTrigger,
	MultiSelectValue,
};
