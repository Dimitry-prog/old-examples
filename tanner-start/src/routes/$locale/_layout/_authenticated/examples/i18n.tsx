import { I18nExample } from "@/components/examples/I18nExample";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/$locale/_layout/_authenticated/examples/i18n",
)({
	component: I18nExamplePage,
});

function I18nExamplePage() {
	return <I18nExample />;
}
