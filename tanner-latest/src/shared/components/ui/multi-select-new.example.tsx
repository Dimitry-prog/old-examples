import * as React from "react";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectLabel,
	MultiSelectTrigger,
	MultiSelectValue,
} from "./multi-select";

// Базовый пример
export function BasicMultiSelectExample() {
	const [value, setValue] = React.useState<string[]>([]);

	return (
		<div className="w-full max-w-md space-y-2">
			<MultiSelect value={value} onValueChange={setValue}>
				<MultiSelectTrigger className="w-full">
					<MultiSelectValue placeholder="Выберите фреймворки..." />
				</MultiSelectTrigger>
				<MultiSelectContent>
					<MultiSelectGroup>
						<MultiSelectItem value="next.js">Next.js</MultiSelectItem>
						<MultiSelectItem value="react">React</MultiSelectItem>
						<MultiSelectItem value="vue">Vue.js</MultiSelectItem>
						<MultiSelectItem value="svelte">Svelte</MultiSelectItem>
						<MultiSelectItem value="angular">Angular</MultiSelectItem>
					</MultiSelectGroup>
				</MultiSelectContent>
			</MultiSelect>
			<p className="text-xs text-muted-foreground">
				Выбрано: {value.length > 0 ? value.join(", ") : "ничего"}
			</p>
		</div>
	);
}

// Пример с группами
export function GroupedMultiSelectExample() {
	const [value, setValue] = React.useState<string[]>([]);

	return (
		<div className="w-full max-w-md space-y-2">
			<MultiSelect value={value} onValueChange={setValue}>
				<MultiSelectTrigger className="w-full">
					<MultiSelectValue placeholder="Выберите технологии..." />
				</MultiSelectTrigger>
				<MultiSelectContent>
					<MultiSelectGroup>
						<MultiSelectLabel>Frontend</MultiSelectLabel>
						<MultiSelectItem value="react">React</MultiSelectItem>
						<MultiSelectItem value="vue">Vue.js</MultiSelectItem>
						<MultiSelectItem value="angular">Angular</MultiSelectItem>
					</MultiSelectGroup>
					<MultiSelectGroup>
						<MultiSelectLabel>Backend</MultiSelectLabel>
						<MultiSelectItem value="node">Node.js</MultiSelectItem>
						<MultiSelectItem value="express">Express</MultiSelectItem>
						<MultiSelectItem value="nestjs">NestJS</MultiSelectItem>
					</MultiSelectGroup>
					<MultiSelectGroup>
						<MultiSelectLabel>Database</MultiSelectLabel>
						<MultiSelectItem value="postgres">PostgreSQL</MultiSelectItem>
						<MultiSelectItem value="mongodb">MongoDB</MultiSelectItem>
						<MultiSelectItem value="redis">Redis</MultiSelectItem>
					</MultiSelectGroup>
				</MultiSelectContent>
			</MultiSelect>
			<p className="text-xs text-muted-foreground">
				Выбрано: {value.length} технологий
			</p>
		</div>
	);
}

// Пример с маленьким размером
export function SmallMultiSelectExample() {
	const [value, setValue] = React.useState<string[]>([]);

	return (
		<div className="w-full max-w-md">
			<MultiSelect value={value} onValueChange={setValue}>
				<MultiSelectTrigger className="w-full" size="sm">
					<MultiSelectValue placeholder="Выберите языки..." />
				</MultiSelectTrigger>
				<MultiSelectContent>
					<MultiSelectGroup>
						<MultiSelectItem value="javascript">JavaScript</MultiSelectItem>
						<MultiSelectItem value="typescript">TypeScript</MultiSelectItem>
						<MultiSelectItem value="python">Python</MultiSelectItem>
						<MultiSelectItem value="java">Java</MultiSelectItem>
						<MultiSelectItem value="go">Go</MultiSelectItem>
					</MultiSelectGroup>
				</MultiSelectContent>
			</MultiSelect>
		</div>
	);
}

// Пример с отключенными элементами
export function DisabledItemsMultiSelectExample() {
	const [value, setValue] = React.useState<string[]>([]);

	return (
		<div className="w-full max-w-md">
			<MultiSelect value={value} onValueChange={setValue}>
				<MultiSelectTrigger className="w-full">
					<MultiSelectValue placeholder="Выберите опции..." />
				</MultiSelectTrigger>
				<MultiSelectContent>
					<MultiSelectGroup>
						<MultiSelectItem value="option1">Опция 1</MultiSelectItem>
						<MultiSelectItem value="option2" disabled>
							Опция 2 (отключена)
						</MultiSelectItem>
						<MultiSelectItem value="option3">Опция 3</MultiSelectItem>
						<MultiSelectItem value="option4" disabled>
							Опция 4 (отключена)
						</MultiSelectItem>
						<MultiSelectItem value="option5">Опция 5</MultiSelectItem>
					</MultiSelectGroup>
				</MultiSelectContent>
			</MultiSelect>
		</div>
	);
}

// Пример с контролируемым состоянием
export function ControlledMultiSelectExample() {
	const [value, setValue] = React.useState<string[]>(["react", "vue"]);

	const handleReset = () => setValue([]);
	const handleSelectAll = () =>
		setValue(["react", "vue", "angular", "svelte", "next.js"]);

	return (
		<div className="w-full max-w-md space-y-4">
			<MultiSelect value={value} onValueChange={setValue}>
				<MultiSelectTrigger className="w-full">
					<MultiSelectValue placeholder="Выберите фреймворки..." />
				</MultiSelectTrigger>
				<MultiSelectContent>
					<MultiSelectGroup>
						<MultiSelectItem value="react">React</MultiSelectItem>
						<MultiSelectItem value="vue">Vue.js</MultiSelectItem>
						<MultiSelectItem value="angular">Angular</MultiSelectItem>
						<MultiSelectItem value="svelte">Svelte</MultiSelectItem>
						<MultiSelectItem value="next.js">Next.js</MultiSelectItem>
					</MultiSelectGroup>
				</MultiSelectContent>
			</MultiSelect>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={handleReset}
					className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
				>
					Сбросить
				</button>
				<button
					type="button"
					onClick={handleSelectAll}
					className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
				>
					Выбрать все
				</button>
			</div>
		</div>
	);
}

// Пример с формой
export function FormMultiSelectExample() {
	const [value, setValue] = React.useState<string[]>([]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		alert(`Выбранные значения: ${value.join(", ")}`);
	};

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
			<div className="space-y-2">
				<label className="text-sm font-medium">Любимые фреймворки</label>
				<MultiSelect value={value} onValueChange={setValue}>
					<MultiSelectTrigger className="w-full">
						<MultiSelectValue placeholder="Выберите фреймворки..." />
					</MultiSelectTrigger>
					<MultiSelectContent>
						<MultiSelectGroup>
							<MultiSelectItem value="react">React</MultiSelectItem>
							<MultiSelectItem value="vue">Vue.js</MultiSelectItem>
							<MultiSelectItem value="angular">Angular</MultiSelectItem>
							<MultiSelectItem value="svelte">Svelte</MultiSelectItem>
						</MultiSelectGroup>
					</MultiSelectContent>
				</MultiSelect>
				<p className="text-xs text-muted-foreground">
					Выберите один или несколько фреймворков
				</p>
			</div>
			<button
				type="submit"
				className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
			>
				Отправить
			</button>
		</form>
	);
}

// Пример с overflow behavior
export function OverflowBehaviorMultiSelectExample() {
	const [overflowBehavior, setOverflowBehavior] = React.useState<
		"wrap-when-open" | "wrap" | "cutoff"
	>("wrap-when-open");

	return (
		<div className="flex w-full max-w-md flex-col gap-8">
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">Overflow Behavior</label>
				<select
					value={overflowBehavior}
					onChange={(e) =>
						setOverflowBehavior(
							e.target.value as "wrap-when-open" | "wrap" | "cutoff",
						)
					}
					className="rounded border border-input bg-transparent px-3 py-2 text-sm"
				>
					<option value="wrap-when-open">wrap-when-open</option>
					<option value="wrap">wrap</option>
					<option value="cutoff">cutoff</option>
				</select>
				<p className="text-xs text-muted-foreground">
					<strong>wrap-when-open:</strong> переносит только когда открыт
					<br />
					<strong>wrap:</strong> всегда переносит
					<br />
					<strong>cutoff:</strong> показывает только первый + счетчик
				</p>
			</div>

			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">Frameworks</label>
				<MultiSelect
					defaultValues={[
						"next.js",
						"sveltekit",
						"nuxt.js",
						"remix",
						"astro",
						"vue",
					]}
				>
					<MultiSelectTrigger className="w-full">
						<MultiSelectValue
							overflowBehavior={overflowBehavior}
							placeholder="Выберите фреймворки..."
						/>
					</MultiSelectTrigger>
					<MultiSelectContent>
						<MultiSelectGroup>
							<MultiSelectItem value="next.js">Next.js</MultiSelectItem>
							<MultiSelectItem value="sveltekit">SvelteKit</MultiSelectItem>
							<MultiSelectItem value="nuxt.js">Nuxt.js</MultiSelectItem>
							<MultiSelectItem value="remix">Remix</MultiSelectItem>
							<MultiSelectItem value="astro">Astro</MultiSelectItem>
							<MultiSelectItem value="vue">Vue.js</MultiSelectItem>
							<MultiSelectItem value="react">React</MultiSelectItem>
						</MultiSelectGroup>
					</MultiSelectContent>
				</MultiSelect>
			</div>
		</div>
	);
}
