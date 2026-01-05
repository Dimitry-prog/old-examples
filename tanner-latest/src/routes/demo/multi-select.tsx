import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectGroup,
	MultiSelectItem,
	MultiSelectLabel,
	MultiSelectSearch,
	MultiSelectTrigger,
	MultiSelectValue,
	type OverflowBehavior,
} from "@/shared/components/ui/multi-select";
import { Star, Circle, Square } from "lucide-react";

export const Route = createFileRoute("/demo/multi-select")({
	component: MultiSelectDemo,
});

function MultiSelectDemo() {
	return (
		<div className="container mx-auto p-8 space-y-12 max-w-4xl">
			<div>
				<h1 className="text-3xl font-bold mb-2">Multi-Select Component Demo</h1>
				<p className="text-muted-foreground">
					Интерактивная демонстрация компонента мультиселекта
				</p>
			</div>

			<BasicExample />
			<SearchExample />
			<GroupedExample />
			<CustomIndicatorExample />
			<MaxDisplayExample />
			<OverflowBehaviorExample />
			<ControlledExample />
			<FormExample />
		</div>
	);
}

function BasicExample() {
	const [value, setValue] = React.useState<string[]>([]);

	return (
		<section className="space-y-4 p-6 border rounded-lg bg-card">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Базовый пример</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Простой мультиселект с выбором фреймворков
				</p>
			</div>

			<div className="space-y-4">
				<MultiSelect value={value} onValueChange={setValue}>
					<MultiSelectTrigger className="w-full max-w-md">
						<MultiSelectValue placeholder="Выберите фреймворки..." />
					</MultiSelectTrigger>
					<MultiSelectContent>
						<MultiSelectGroup>
							<MultiSelectItem value="next.js">Next.js</MultiSelectItem>
							<MultiSelectItem value="react">React</MultiSelectItem>
							<MultiSelectItem value="vue">Vue.js</MultiSelectItem>
							<MultiSelectItem value="svelte">Svelte</MultiSelectItem>
							<MultiSelectItem value="angular">Angular</MultiSelectItem>
							<MultiSelectItem value="remix">Remix</MultiSelectItem>
							<MultiSelectItem value="astro">Astro</MultiSelectItem>
						</MultiSelectGroup>
					</MultiSelectContent>
				</MultiSelect>

				<div className="p-4 bg-muted rounded-md">
					<p className="text-sm font-medium mb-2">Выбранные значения:</p>
					<code className="text-sm">
						{value.length > 0 ? JSON.stringify(value, null, 2) : "[]"}
					</code>
				</div>
			</div>
		</section>
	);
}

function SearchExample() {
	const [value, setValue] = React.useState<string[]>([]);

	return (
		<section className="space-y-4 p-6 border rounded-lg bg-card">
			<div>
				<h2 className="text-2xl font-semibold mb-2">С поиском</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Поиск по названию фреймворка
				</p>
			</div>

			<div className="space-y-4">
				<MultiSelect value={value} onValueChange={setValue}>
					<MultiSelectTrigger className="w-full max-w-md">
						<MultiSelectValue placeholder="Выберите фреймворки..." />
					</MultiSelectTrigger>
					<MultiSelectContent>
						<MultiSelectSearch placeholder="Поиск фреймворков..." />
						<MultiSelectGroup>
							<MultiSelectItem value="next.js">Next.js</MultiSelectItem>
							<MultiSelectItem value="react">React</MultiSelectItem>
							<MultiSelectItem value="vue">Vue.js</MultiSelectItem>
							<MultiSelectItem value="svelte">Svelte</MultiSelectItem>
							<MultiSelectItem value="angular">Angular</MultiSelectItem>
							<MultiSelectItem value="remix">Remix</MultiSelectItem>
							<MultiSelectItem value="astro">Astro</MultiSelectItem>
							<MultiSelectItem value="sveltekit">SvelteKit</MultiSelectItem>
							<MultiSelectItem value="nuxt">Nuxt.js</MultiSelectItem>
							<MultiSelectItem value="gatsby">Gatsby</MultiSelectItem>
						</MultiSelectGroup>
					</MultiSelectContent>
				</MultiSelect>

				<div className="p-4 bg-muted rounded-md">
					<p className="text-sm font-medium mb-2">Выбранные значения:</p>
					<code className="text-sm">
						{value.length > 0 ? JSON.stringify(value, null, 2) : "[]"}
					</code>
				</div>
			</div>
		</section>
	);
}

function GroupedExample() {
	const [value, setValue] = React.useState<string[]>([]);

	return (
		<section className="space-y-4 p-6 border rounded-lg bg-card">
			<div>
				<h2 className="text-2xl font-semibold mb-2">
					С группировкой и поиском
				</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Опции сгруппированы по категориям с возможностью поиска
				</p>
			</div>

			<div className="space-y-4">
				<MultiSelect value={value} onValueChange={setValue}>
					<MultiSelectTrigger className="w-full max-w-md">
						<MultiSelectValue placeholder="Выберите технологии..." />
					</MultiSelectTrigger>
					<MultiSelectContent>
						<MultiSelectSearch placeholder="Поиск технологий..." />
						<MultiSelectGroup>
							<MultiSelectLabel>Frontend</MultiSelectLabel>
							<MultiSelectItem value="react">React</MultiSelectItem>
							<MultiSelectItem value="vue">Vue.js</MultiSelectItem>
							<MultiSelectItem value="angular">Angular</MultiSelectItem>
							<MultiSelectItem value="svelte">Svelte</MultiSelectItem>
						</MultiSelectGroup>
						<MultiSelectGroup>
							<MultiSelectLabel>Backend</MultiSelectLabel>
							<MultiSelectItem value="node">Node.js</MultiSelectItem>
							<MultiSelectItem value="express">Express</MultiSelectItem>
							<MultiSelectItem value="nestjs">NestJS</MultiSelectItem>
							<MultiSelectItem value="fastify">Fastify</MultiSelectItem>
						</MultiSelectGroup>
						<MultiSelectGroup>
							<MultiSelectLabel>Database</MultiSelectLabel>
							<MultiSelectItem value="postgres">PostgreSQL</MultiSelectItem>
							<MultiSelectItem value="mongodb">MongoDB</MultiSelectItem>
							<MultiSelectItem value="redis">Redis</MultiSelectItem>
							<MultiSelectItem value="mysql">MySQL</MultiSelectItem>
						</MultiSelectGroup>
					</MultiSelectContent>
				</MultiSelect>

				<div className="p-4 bg-muted rounded-md">
					<p className="text-sm font-medium mb-2">
						Выбрано: {value.length} технологий
					</p>
					<div className="flex flex-wrap gap-2 mt-2">
						{value.map((v) => (
							<span
								key={v}
								className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
							>
								{v}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function CustomIndicatorExample() {
	const [indicatorType, setIndicatorType] = React.useState<
		"check" | "star" | "circle" | "square"
	>("check");
	const [indicatorPosition, setIndicatorPosition] = React.useState<
		"left" | "right"
	>("right");

	const getIndicatorIcon = () => {
		switch (indicatorType) {
			case "star":
				return <Star className="size-4 fill-current" />;
			case "circle":
				return <Circle className="size-4 fill-current" />;
			case "square":
				return <Square className="size-4 fill-current" />;
			default:
				return undefined; // Используется CheckIcon по умолчанию
		}
	};

	return (
		<section className="space-y-4 p-6 border rounded-lg bg-card">
			<div>
				<h2 className="text-2xl font-semibold mb-2">
					Кастомный индикатор выбора
				</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Настройка иконки и позиции индикатора
				</p>
			</div>

			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Тип индикатора:</label>
						<select
							value={indicatorType}
							onChange={(e) =>
								setIndicatorType(
									e.target.value as "check" | "star" | "circle" | "square",
								)
							}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						>
							<option value="check">Галочка (по умолчанию)</option>
							<option value="star">Звезда</option>
							<option value="circle">Круг</option>
							<option value="square">Квадрат</option>
						</select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Позиция:</label>
						<select
							value={indicatorPosition}
							onChange={(e) =>
								setIndicatorPosition(e.target.value as "left" | "right")
							}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						>
							<option value="right">Справа</option>
							<option value="left">Слева</option>
						</select>
					</div>
				</div>

				<MultiSelect
					defaultValues={["react", "vue"]}
					indicatorIcon={getIndicatorIcon()}
					indicatorPosition={indicatorPosition}
				>
					<MultiSelectTrigger className="w-full max-w-md">
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

				<div className="text-xs text-muted-foreground space-y-1">
					<p>
						<strong>Индикатор:</strong> {indicatorType}
					</p>
					<p>
						<strong>Позиция:</strong> {indicatorPosition}
					</p>
				</div>
			</div>
		</section>
	);
}

function MaxDisplayExample() {
	const [maxDisplay, setMaxDisplay] = React.useState<number>(3);
	const [showAllWhenOpen, setShowAllWhenOpen] = React.useState(true);

	return (
		<section className="space-y-4 p-6 border rounded-lg bg-card">
			<div>
				<h2 className="text-2xl font-semibold mb-2">
					Ограничение отображения со счетчиком
				</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Показывает N элементов + счетчик остальных
				</p>
			</div>

			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">
							Максимум badges (закрыто):
						</label>
						<input
							type="number"
							min="1"
							max="10"
							value={maxDisplay}
							onChange={(e) => setMaxDisplay(Number(e.target.value))}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium flex items-center gap-2">
							<input
								type="checkbox"
								checked={showAllWhenOpen}
								onChange={(e) => setShowAllWhenOpen(e.target.checked)}
								className="rounded"
							/>
							Показывать все при открытии
						</label>
						<p className="text-xs text-muted-foreground">
							Когда открыт - показывать все badges
						</p>
					</div>
				</div>

				<MultiSelect
					defaultValues={[
						"next.js",
						"react",
						"vue",
						"svelte",
						"angular",
						"remix",
						"astro",
					]}
				>
					<MultiSelectTrigger className="w-full max-w-md">
						<MultiSelectValue
							placeholder="Выберите фреймворки..."
							maxDisplay={maxDisplay}
							showAllWhenOpen={showAllWhenOpen}
						/>
					</MultiSelectTrigger>
					<MultiSelectContent>
						<MultiSelectSearch placeholder="Поиск..." />
						<MultiSelectGroup>
							<MultiSelectItem value="next.js">Next.js</MultiSelectItem>
							<MultiSelectItem value="react">React</MultiSelectItem>
							<MultiSelectItem value="vue">Vue.js</MultiSelectItem>
							<MultiSelectItem value="svelte">Svelte</MultiSelectItem>
							<MultiSelectItem value="angular">Angular</MultiSelectItem>
							<MultiSelectItem value="remix">Remix</MultiSelectItem>
							<MultiSelectItem value="astro">Astro</MultiSelectItem>
							<MultiSelectItem value="sveltekit">SvelteKit</MultiSelectItem>
							<MultiSelectItem value="nuxt">Nuxt.js</MultiSelectItem>
							<MultiSelectItem value="gatsby">Gatsby</MultiSelectItem>
						</MultiSelectGroup>
					</MultiSelectContent>
				</MultiSelect>

				<div className="p-4 bg-muted rounded-md text-xs space-y-1">
					<p>
						<strong>Максимум badges:</strong> {maxDisplay}
					</p>
					<p>
						<strong>Показывать все при открытии:</strong>{" "}
						{showAllWhenOpen ? "Да" : "Нет"}
					</p>
					<p className="text-muted-foreground mt-2">
						💡 Попробуйте выбрать больше {maxDisplay} элементов и закрыть селект
					</p>
				</div>
			</div>
		</section>
	);
}

function OverflowBehaviorExample() {
	const [overflowBehavior, setOverflowBehavior] =
		React.useState<OverflowBehavior>("wrap-when-open");

	return (
		<section className="space-y-4 p-6 border rounded-lg bg-card">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Overflow Behavior</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Управление отображением выбранных значений
				</p>
			</div>

			<div className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">Режим отображения:</label>
					<select
						value={overflowBehavior}
						onChange={(e) =>
							setOverflowBehavior(e.target.value as OverflowBehavior)
						}
						className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
					>
						<option value="wrap-when-open">wrap-when-open</option>
						<option value="wrap">wrap</option>
						<option value="cutoff">cutoff</option>
					</select>
					<div className="text-xs text-muted-foreground space-y-1">
						<p>
							<strong>wrap-when-open:</strong> переносит badges только когда
							открыт
						</p>
						<p>
							<strong>wrap:</strong> всегда переносит badges на новую строку
						</p>
						<p>
							<strong>cutoff:</strong> показывает только первый badge + счетчик
						</p>
					</div>
				</div>

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
					<MultiSelectTrigger className="w-full max-w-md">
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
							<MultiSelectItem value="angular">Angular</MultiSelectItem>
						</MultiSelectGroup>
					</MultiSelectContent>
				</MultiSelect>
			</div>
		</section>
	);
}

function ControlledExample() {
	const [value, setValue] = React.useState<string[]>(["react", "vue"]);

	const handleReset = () => setValue([]);
	const handleSelectAll = () =>
		setValue(["react", "vue", "angular", "svelte", "next.js"]);
	const handleSelectPopular = () => setValue(["react", "next.js"]);

	return (
		<section className="space-y-4 p-6 border rounded-lg bg-card">
			<div>
				<h2 className="text-2xl font-semibold mb-2">
					Контролируемое состояние
				</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Управление значениями через внешние кнопки
				</p>
			</div>

			<div className="space-y-4">
				<MultiSelect value={value} onValueChange={setValue}>
					<MultiSelectTrigger className="w-full max-w-md">
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

				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={handleReset}
						className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm"
					>
						Сбросить
					</button>
					<button
						type="button"
						onClick={handleSelectAll}
						className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm"
					>
						Выбрать все
					</button>
					<button
						type="button"
						onClick={handleSelectPopular}
						className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm"
					>
						Популярные
					</button>
				</div>

				<div className="p-4 bg-muted rounded-md">
					<p className="text-sm">
						Выбрано: <strong>{value.length}</strong> из 5
					</p>
				</div>
			</div>
		</section>
	);
}

function FormExample() {
	const [value, setValue] = React.useState<string[]>([]);
	const [submitted, setSubmitted] = React.useState<string[] | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(value);
	};

	return (
		<section className="space-y-4 p-6 border rounded-lg bg-card">
			<div>
				<h2 className="text-2xl font-semibold mb-2">В форме</h2>
				<p className="text-sm text-muted-foreground mb-4">
					Использование в HTML форме с валидацией
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">
						Любимые языки программирования *
					</label>
					<MultiSelect value={value} onValueChange={setValue}>
						<MultiSelectTrigger className="w-full max-w-md">
							<MultiSelectValue placeholder="Выберите языки..." />
						</MultiSelectTrigger>
						<MultiSelectContent>
							<MultiSelectGroup>
								<MultiSelectItem value="javascript">JavaScript</MultiSelectItem>
								<MultiSelectItem value="typescript">TypeScript</MultiSelectItem>
								<MultiSelectItem value="python">Python</MultiSelectItem>
								<MultiSelectItem value="java">Java</MultiSelectItem>
								<MultiSelectItem value="go">Go</MultiSelectItem>
								<MultiSelectItem value="rust">Rust</MultiSelectItem>
								<MultiSelectItem value="csharp">C#</MultiSelectItem>
							</MultiSelectGroup>
						</MultiSelectContent>
					</MultiSelect>
					<p className="text-xs text-muted-foreground">
						Выберите хотя бы один язык программирования
					</p>
					{value.length === 0 && submitted !== null && (
						<p className="text-xs text-destructive">
							Пожалуйста, выберите хотя бы один язык
						</p>
					)}
				</div>

				<button
					type="submit"
					disabled={value.length === 0}
					className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
				>
					Отправить
				</button>

				{submitted && submitted.length > 0 && (
					<div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
						<p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
							✓ Форма успешно отправлена!
						</p>
						<p className="text-xs text-muted-foreground">
							Выбранные языки: {submitted.join(", ")}
						</p>
					</div>
				)}
			</form>
		</section>
	);
}
