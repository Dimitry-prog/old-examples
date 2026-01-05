import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { useNavigate, useParams } from "@tanstack/react-router";

export function LanguageSwitcher() {
	const navigate = useNavigate();
	const params = useParams({ from: "/$locale/_layout" });
	const locale = params.locale as Locale;

	const handleLocaleChange = (newLocale: Locale) => {
		// Сохраняем текущий путь без локали
		const currentPath = window.location.pathname.replace(`/${locale}`, "");

		// Навигация на тот же путь с новой локалью
		const targetPath = `/$locale${currentPath || "/"}`;
		navigate({
			to: targetPath,
			params: { locale: newLocale } as Record<string, string>,
		});
	};

	return (
		<select
			value={locale}
			onChange={(e) => handleLocaleChange(e.target.value as Locale)}
			className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
		>
			{LOCALES.map((loc) => (
				<option key={loc} value={loc}>
					{LOCALE_LABELS[loc]}
				</option>
			))}
		</select>
	);
}
