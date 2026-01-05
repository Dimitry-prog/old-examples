import { MainLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";

function HomePage() {
	const { locale } = useParams({ from: "/$locale/_layout/" });

	const features = [
		{
			icon: "⚡",
			title: <Trans>Быстрая разработка</Trans>,
			description: (
				<Trans>Vite обеспечивает мгновенный HMR и быструю сборку</Trans>
			),
		},
		{
			icon: "🎨",
			title: <Trans>Современный UI</Trans>,
			description: (
				<Trans>Tailwind CSS и shadcn/ui для красивых интерфейсов</Trans>
			),
		},
		{
			icon: "🔒",
			title: <Trans>Типобезопасность</Trans>,
			description: <Trans>TypeScript с строгой конфигурацией</Trans>,
		},
		{
			icon: "🧪",
			title: <Trans>Тестирование</Trans>,
			description: <Trans>Vitest и React Testing Library из коробки</Trans>,
		},
		{
			icon: "🚀",
			title: <Trans>Производительность</Trans>,
			description: <Trans>Оптимизированная сборка и code splitting</Trans>,
		},
		{
			icon: "📦",
			title: <Trans>Современный стек</Trans>,
			description: (
				<Trans>React 19, TanStack Router, Zustand, React Query</Trans>
			),
		},
	];

	const techStack = [
		{ name: "React", version: "19.1.1", color: "text-blue-500" },
		{ name: "TypeScript", version: "5.7.2", color: "text-blue-600" },
		{ name: "Vite", version: "7.1.6", color: "text-purple-500" },
		{ name: "Tailwind CSS", version: "4.1.13", color: "text-cyan-500" },
		{ name: "TanStack Router", version: "1.131.48", color: "text-red-500" },
		{ name: "Biome", version: "2.2.4", color: "text-green-500" },
		{ name: "Vitest", version: "3.2.4", color: "text-yellow-500" },
		{ name: "shadcn/ui", version: "✅", color: "text-gray-500" },
	];

	return (
		<MainLayout>
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 md:py-32">
				<div className="container">
					<div className="mx-auto max-w-4xl text-center">
						<div className="mb-8 inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm">
							<span className="mr-2">🎉</span>
							<span className="text-muted-foreground">
								<Trans>Проект инициализирован с последними версиями</Trans>
							</span>
						</div>

						<h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
							Modern React Stack
						</h1>

						<p className="mb-8 text-xl text-muted-foreground md:text-2xl">
							<Trans>
								Полнофункциональный стартовый шаблон для создания современных
								React приложений с лучшими практиками и инструментами
							</Trans>
						</p>

						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link
								to="/$locale/_layout/_authenticated/dashboard"
								params={{ locale }}
							>
								<Button size="lg" className="w-full sm:w-auto">
									<Trans>Начать работу</Trans>
									<span className="ml-2">→</span>
								</Button>
							</Link>
							<Link to="/$locale/_layout/about" params={{ locale }}>
								<Button
									size="lg"
									variant="outline"
									className="w-full sm:w-auto"
								>
									<Trans>Узнать больше</Trans>
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20">
				<div className="container">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
							<Trans>Возможности</Trans>
						</h2>
						<p className="text-lg text-muted-foreground">
							<Trans>
								Все необходимое для быстрой разработки качественных приложений
							</Trans>
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{features.map((feature, index) => (
							<Card key={index} className="p-6">
								<div className="mb-4 text-4xl">{feature.icon}</div>
								<h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
								<p className="text-muted-foreground">{feature.description}</p>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Tech Stack Section */}
			<section className="bg-muted/30 py-20">
				<div className="container">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
							<Trans>Технологический стек</Trans>
						</h2>
						<p className="text-lg text-muted-foreground">
							<Trans>Современные и проверенные инструменты</Trans>
						</p>
					</div>

					<div className="mx-auto max-w-4xl">
						<Card className="p-8">
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
								{techStack.map((tech) => (
									<div
										key={tech.name}
										className="flex flex-col items-center rounded-lg border border-border bg-background p-4 text-center transition-colors hover:bg-accent"
									>
										<div className={`mb-2 text-sm font-semibold ${tech.color}`}>
											{tech.name}
										</div>
										<div className="text-xs text-muted-foreground">
											{tech.version}
										</div>
									</div>
								))}
							</div>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20">
				<div className="container">
					<Card className="bg-primary text-primary-foreground">
						<div className="p-12 text-center">
							<h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
								<Trans>Готовы начать?</Trans>
							</h2>
							<p className="mb-8 text-lg opacity-90">
								<Trans>Создайте свое первое приложение прямо сейчас</Trans>
							</p>
							<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
								<Link to="/$locale/_layout/login" params={{ locale }}>
									<Button
										size="lg"
										variant="secondary"
										className="w-full sm:w-auto"
									>
										<Trans>Войти</Trans>
									</Button>
								</Link>
								<Link to="/$locale/_layout/about" params={{ locale }}>
									<Button
										size="lg"
										variant="outline"
										className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary sm:w-auto"
									>
										<Trans>Документация</Trans>
									</Button>
								</Link>
							</div>
						</div>
					</Card>
				</div>
			</section>
		</MainLayout>
	);
}

export const Route = createFileRoute("/$locale/_layout/")({
	component: HomePage,
});
