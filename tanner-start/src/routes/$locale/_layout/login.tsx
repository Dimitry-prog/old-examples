import { LoginForm, QuickLoginButtons } from "@/components/auth/LoginForm";
import { GuestGuard } from "@/components/guards/RouteGuard";
import { CenteredLayout } from "@/components/layouts";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { createFileRoute, useParams } from "@tanstack/react-router";

function LoginPage() {
	const { i18n } = useLingui();
	const { locale } = useParams({ from: "/$locale/_layout/login" });

	return (
		<GuestGuard redirectPath={`/${locale}/dashboard`}>
			<CenteredLayout
				title={t(i18n)`Добро пожаловать`}
				subtitle={t(i18n)`Войдите в свой аккаунт для продолжения`}
				showBackLink={true}
				backLinkTo={`/${locale}`}
				backLinkText={t(i18n)`На главную`}
			>
				<div className="space-y-6">
					<LoginForm />
					<QuickLoginButtons />
				</div>
			</CenteredLayout>
		</GuestGuard>
	);
}

export const Route = createFileRoute("/$locale/_layout/login")({
	component: LoginPage,
});
