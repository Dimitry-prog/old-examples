import {
	BasicMultiSelectExample,
	GroupedMultiSelectExample,
	SmallMultiSelectExample,
	DisabledItemsMultiSelectExample,
	ControlledMultiSelectExample,
	FormMultiSelectExample,
	OverflowBehaviorMultiSelectExample,
} from "./multi-select-new.example";

export function MultiSelectNewDemo() {
	return (
		<div className="container mx-auto p-8 space-y-12">
			<div>
				<h1 className="text-3xl font-bold mb-2">
					Multi-Select Component (New API)
				</h1>
				<p className="text-muted-foreground">
					Компонентный API как у обычного Select
				</p>
			</div>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">Базовый пример</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Простой мультиселект с компонентным API
					</p>
				</div>
				<BasicMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">С группами</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Опции сгруппированы по категориям
					</p>
				</div>
				<GroupedMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">Маленький размер</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Компактный вариант с size="sm"
					</p>
				</div>
				<SmallMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">
						С отключенными элементами
					</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Некоторые опции недоступны для выбора
					</p>
				</div>
				<DisabledItemsMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">
						Контролируемое состояние
					</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Управление значениями извне
					</p>
				</div>
				<ControlledMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">В форме</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Использование в HTML форме
					</p>
				</div>
				<FormMultiSelectExample />
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-2xl font-semibold mb-2">Overflow Behavior</h2>
					<p className="text-sm text-muted-foreground mb-4">
						Управление отображением выбранных значений
					</p>
				</div>
				<OverflowBehaviorMultiSelectExample />
			</section>
		</div>
	);
}
