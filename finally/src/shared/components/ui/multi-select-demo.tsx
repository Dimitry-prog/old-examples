import {
	BasicMultiSelectExample,
	GroupedMultiSelectExample,
	LimitedMultiSelectExample,
	CreatableMultiSelectExample,
	AsyncMultiSelectExample,
	FixedValuesMultiSelectExample,
	ImperativeMultiSelectExample,
} from "./multi-select.example";

export function MultiSelectDemo() {
	return (
		<div className="container mx-auto p-8 space-y-12">
			<div>
				<h1 className="text-3xl font-bold mb-2">Multi-Select Component Demo</h1>
				<p className="text-muted-foreground">
					Примеры использования компонента мультиселекта
				</p>
			</div>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">Базовый пример</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Простой мультиселект с предопределенными опциями
					</p>
				</div>
				<BasicMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">С группировкой</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Опции сгруппированы по категориям
					</p>
				</div>
				<GroupedMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">
						С ограничением количества
					</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Максимум 3 элемента можно выбрать
					</p>
				</div>
				<LimitedMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">
						С возможностью создания
					</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Можно создавать новые опции прямо из поля ввода
					</p>
				</div>
				<CreatableMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">С асинхронным поиском</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Опции загружаются динамически при вводе
					</p>
				</div>
				<AsyncMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">
						С фиксированными значениями
					</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Некоторые значения нельзя удалить
					</p>
				</div>
				<FixedValuesMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">
						С императивным управлением
					</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Управление компонентом через ref
					</p>
				</div>
				<ImperativeMultiSelectExample />
			</section>
		</div>
	);
}
