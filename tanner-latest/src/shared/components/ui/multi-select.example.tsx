import * as React from "react";
import { MultiSelect, type MultiSelectOption } from "./multi-select";

// Базовый пример
export function BasicMultiSelectExample() {
	const [selectedValues, setSelectedValues] = React.useState<
		MultiSelectOption[]
	>([]);

	const options: MultiSelectOption[] = [
		{ label: "React", value: "react" },
		{ label: "Vue", value: "vue" },
		{ label: "Angular", value: "angular" },
		{ label: "Svelte", value: "svelte" },
		{ label: "Next.js", value: "nextjs" },
	];

	return (
		<div className="w-full max-w-md">
			<MultiSelect
				options={options}
				onChange={setSelectedValues}
				value={selectedValues}
				placeholder="Выберите фреймворки..."
			/>
		</div>
	);
}

// Пример с группировкой
export function GroupedMultiSelectExample() {
	const [selectedValues, setSelectedValues] = React.useState<
		MultiSelectOption[]
	>([]);

	const options: MultiSelectOption[] = [
		{ label: "React", value: "react", category: "Frontend" },
		{ label: "Vue", value: "vue", category: "Frontend" },
		{ label: "Angular", value: "angular", category: "Frontend" },
		{ label: "Node.js", value: "nodejs", category: "Backend" },
		{ label: "Express", value: "express", category: "Backend" },
		{ label: "NestJS", value: "nestjs", category: "Backend" },
	];

	return (
		<div className="w-full max-w-md">
			<MultiSelect
				options={options}
				onChange={setSelectedValues}
				value={selectedValues}
				placeholder="Выберите технологии..."
				groupBy="category"
			/>
		</div>
	);
}

// Пример с максимальным количеством выбранных элементов
export function LimitedMultiSelectExample() {
	const [selectedValues, setSelectedValues] = React.useState<
		MultiSelectOption[]
	>([]);

	const options: MultiSelectOption[] = [
		{ label: "JavaScript", value: "js" },
		{ label: "TypeScript", value: "ts" },
		{ label: "Python", value: "python" },
		{ label: "Java", value: "java" },
		{ label: "Go", value: "go" },
	];

	return (
		<div className="w-full max-w-md">
			<MultiSelect
				options={options}
				onChange={setSelectedValues}
				value={selectedValues}
				placeholder="Выберите до 3 языков..."
				maxSelected={3}
				onMaxSelected={(limit) => {
					alert(`Вы можете выбрать максимум ${limit} элементов`);
				}}
			/>
		</div>
	);
}

// Пример с возможностью создания новых опций
export function CreatableMultiSelectExample() {
	const [selectedValues, setSelectedValues] = React.useState<
		MultiSelectOption[]
	>([]);

	const options: MultiSelectOption[] = [
		{ label: "Красный", value: "red" },
		{ label: "Синий", value: "blue" },
		{ label: "Зеленый", value: "green" },
	];

	return (
		<div className="w-full max-w-md">
			<MultiSelect
				options={options}
				onChange={setSelectedValues}
				value={selectedValues}
				placeholder="Выберите или создайте цвет..."
				creatable
				emptyIndicator={
					<p className="text-center text-sm">Ничего не найдено</p>
				}
			/>
		</div>
	);
}

// Пример с асинхронным поиском
export function AsyncMultiSelectExample() {
	const [selectedValues, setSelectedValues] = React.useState<
		MultiSelectOption[]
	>([]);

	const mockApiSearch = async (
		searchTerm: string,
	): Promise<MultiSelectOption[]> => {
		// Имитация API запроса
		await new Promise((resolve) => setTimeout(resolve, 500));

		const allOptions: MultiSelectOption[] = [
			{ label: "Apple", value: "apple" },
			{ label: "Banana", value: "banana" },
			{ label: "Cherry", value: "cherry" },
			{ label: "Date", value: "date" },
			{ label: "Elderberry", value: "elderberry" },
			{ label: "Fig", value: "fig" },
			{ label: "Grape", value: "grape" },
		];

		return allOptions.filter((option) =>
			option.label.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	};

	return (
		<div className="w-full max-w-md">
			<MultiSelect
				onChange={setSelectedValues}
				value={selectedValues}
				placeholder="Поиск фруктов..."
				onSearch={mockApiSearch}
				loadingIndicator={
					<p className="py-2 text-center text-sm">Загрузка...</p>
				}
				emptyIndicator={
					<p className="py-2 text-center text-sm">Ничего не найдено</p>
				}
			/>
		</div>
	);
}

// Пример с фиксированными значениями
export function FixedValuesMultiSelectExample() {
	const [selectedValues, setSelectedValues] = React.useState<
		MultiSelectOption[]
	>([{ label: "Admin", value: "admin", fixed: true }]);

	const options: MultiSelectOption[] = [
		{ label: "Admin", value: "admin", fixed: true },
		{ label: "User", value: "user" },
		{ label: "Guest", value: "guest" },
		{ label: "Moderator", value: "moderator" },
	];

	return (
		<div className="w-full max-w-md">
			<MultiSelect
				options={options}
				onChange={setSelectedValues}
				value={selectedValues}
				placeholder="Выберите роли..."
			/>
			<p className="mt-2 text-xs text-muted-foreground">
				Роль "Admin" зафиксирована и не может быть удалена
			</p>
		</div>
	);
}

// Пример с использованием ref для императивного управления
export function ImperativeMultiSelectExample() {
	const [selectedValues, setSelectedValues] = React.useState<
		MultiSelectOption[]
	>([]);
	const multiSelectRef = React.useRef<{
		reset: () => void;
		focus: () => void;
		selectedValue: MultiSelectOption[];
		input: HTMLInputElement;
	} | null>(null);

	const options: MultiSelectOption[] = [
		{ label: "Option 1", value: "opt1" },
		{ label: "Option 2", value: "opt2" },
		{ label: "Option 3", value: "opt3" },
	];

	return (
		<div className="w-full max-w-md space-y-4">
			<MultiSelect
				ref={multiSelectRef}
				options={options}
				onChange={setSelectedValues}
				value={selectedValues}
				placeholder="Выберите опции..."
			/>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={() => multiSelectRef.current?.reset()}
					className="rounded bg-gray-200 px-3 py-1 text-sm"
				>
					Сбросить
				</button>
				<button
					type="button"
					onClick={() => multiSelectRef.current?.focus()}
					className="rounded bg-gray-200 px-3 py-1 text-sm"
				>
					Фокус
				</button>
				<button
					type="button"
					onClick={() => {
						const values = multiSelectRef.current?.selectedValue;
						console.log("Выбранные значения:", values);
					}}
					className="rounded bg-gray-200 px-3 py-1 text-sm"
				>
					Получить значения
				</button>
			</div>
		</div>
	);
}
