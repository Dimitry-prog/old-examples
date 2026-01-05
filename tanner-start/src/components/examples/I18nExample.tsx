import { l } from "@/i18n/helpers";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Plural, Trans } from "@lingui/react/macro";
import { useState } from "react";

export function I18nExample() {
	const { i18n } = useLingui();
	const [count, setCount] = useState(1);
	const [name, setName] = useState("Dimitry");

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Заголовок */}
				<section>
					<h1 className="text-3xl font-bold mb-2">
						<Trans>Примеры использования Lingui</Trans>
					</h1>
					<p className="text-muted-foreground">
						<Trans>
							Демонстрация различных способов работы с переводами в React
							приложении
						</Trans>
					</p>
				</section>

				{/* Базовый перевод */}
				<section className="p-6 border rounded-lg bg-card">
					<h2 className="text-xl font-semibold mb-4">
						<Trans>1. Базовый перевод с Trans</Trans>
					</h2>
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">
							<Trans>Простой текст без переменных:</Trans>
						</p>
						<div className="p-4 bg-muted rounded">
							<Trans>Добро пожаловать в наше приложение!</Trans>
						</div>
					</div>
				</section>

				{/* Интерполяция строк */}
				<section className="p-6 border rounded-lg bg-card">
					<h2 className="text-xl font-semibold mb-4">
						<Trans>2. Интерполяция переменных</Trans>
					</h2>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="name-input"
								className="block text-sm font-medium mb-2"
							>
								<Trans>Введите имя:</Trans>
							</label>
							<input
								id="name-input"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={t(i18n)`Ваше имя`}
								className="w-full px-3 py-2 border border-border rounded-md bg-background"
							/>
						</div>
						<div className="p-4 bg-muted rounded">
							<p>
								<Trans>Привет, {name}! Рады видеть тебя здесь.</Trans>
							</p>
						</div>
					</div>
				</section>

				{/* Плюрализация */}
				<section className="p-6 border rounded-lg bg-card">
					<h2 className="text-xl font-semibold mb-4">
						<Trans>3. Плюрализация</Trans>
					</h2>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="count-input"
								className="block text-sm font-medium mb-2"
							>
								<Trans>Выберите количество:</Trans>
							</label>
							<input
								id="count-input"
								type="number"
								value={count}
								onChange={(e) => setCount(Number(e.target.value))}
								min="0"
								max="100"
								className="w-full px-3 py-2 border border-border rounded-md bg-background"
							/>
						</div>
						<div className="space-y-2">
							<div className="p-4 bg-muted rounded">
								<p>
									<Trans>У вас</Trans>{" "}
									<Plural
										value={count}
										one="# день"
										few="# дня"
										many="# дней"
										other="# дней"
									/>
								</p>
							</div>
							<div className="p-4 bg-muted rounded">
								<p>
									<Trans>Найдено</Trans>{" "}
									<Plural
										value={count}
										one="# сообщение"
										few="# сообщения"
										many="# сообщений"
										other="# сообщений"
									/>
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Использование t(i18n) для атрибутов */}
				<section className="p-6 border rounded-lg bg-card">
					<h2 className="text-xl font-semibold mb-4">
						<Trans>4. Переводы в атрибутах (t макрос)</Trans>
					</h2>
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							<Trans>
								Для атрибутов (placeholder, title, aria-label) используйте
								макрос t:
							</Trans>
						</p>
						<input
							type="text"
							placeholder={t(i18n)`Введите текст здесь...`}
							title={t(i18n)`Это поле для ввода текста`}
							className="w-full px-3 py-2 border border-border rounded-md bg-background"
						/>
						<button
							type="button"
							title={t(i18n)`Нажмите для отправки формы`}
							className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
						>
							<Trans>Отправить</Trans>
						</button>
					</div>
				</section>

				{/* Использование хелпера l() */}
				<section className="p-6 border rounded-lg bg-card">
					<h2 className="text-xl font-semibold mb-4">
						<Trans>5. Хелпер l() для простого синтаксиса</Trans>
					</h2>
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							<Trans>
								Функция l() удобна для переводов вне JSX или с ручными ключами:
							</Trans>
						</p>
						<div className="p-4 bg-muted rounded space-y-2">
							<p>
								<strong>
									<Trans>Пример 1:</Trans>
								</strong>{" "}
								{l("user.greeting", { name })}
							</p>
							<p>
								<strong>
									<Trans>Пример 2:</Trans>
								</strong>{" "}
								{l("user.days", { count })}
							</p>
						</div>
						<p className="text-xs text-muted-foreground">
							<Trans>
								Примечание: Для l() нужно вручную добавлять ключи в messages.po
							</Trans>
						</p>
					</div>
				</section>

				{/* Trans с вложенными JSX элементами */}
				<section className="p-6 border rounded-lg bg-card">
					<h2 className="text-xl font-semibold mb-4">
						<Trans>6. Trans с вложенными элементами</Trans>
					</h2>
					<div className="space-y-4">
						<div className="p-4 bg-muted rounded">
							<p>
								<Trans>
									У вас <strong>{count}</strong> непрочитанных сообщений
								</Trans>
							</p>
						</div>
						<div className="p-4 bg-muted rounded">
							<p>
								<Trans>
									Это <em>важное</em> уведомление для{" "}
									<strong className="text-primary">{name}</strong>
								</Trans>
							</p>
						</div>
						<div className="p-4 bg-muted rounded">
							<p>
								<Trans>
									Пожалуйста, прочитайте{" "}
									<a
										href="#"
										className="text-primary hover:underline"
										onClick={(e) => e.preventDefault()}
									>
										документацию
									</a>{" "}
									для получения дополнительной информации
								</Trans>
							</p>
						</div>
					</div>
				</section>

				{/* Интерактивный пример */}
				<section className="p-6 border rounded-lg bg-card">
					<h2 className="text-xl font-semibold mb-4">
						<Trans>7. Интерактивный пример</Trans>
					</h2>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<button
								type="button"
								onClick={() => setCount(Math.max(0, count - 1))}
								className="px-4 py-2 border border-border rounded-md hover:bg-muted"
							>
								<Trans>Уменьшить</Trans>
							</button>
							<button
								type="button"
								onClick={() => setCount(count + 1)}
								className="px-4 py-2 border border-border rounded-md hover:bg-muted"
							>
								<Trans>Увеличить</Trans>
							</button>
						</div>
						<div className="p-4 bg-primary/10 border border-primary/20 rounded">
							<p className="text-center text-lg">
								<Trans>
									Пользователь <strong>{name}</strong> имеет{" "}
								</Trans>
								<Plural
									value={count}
									one="# балл"
									few="# балла"
									many="# баллов"
									other="# баллов"
								/>
							</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
