import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	filterFormSchema,
	type FilterFormValues,
} from "@/lib/schemas/usersSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

type UsersTableFiltersProps = {
	locale: string;
	initialValues?: Partial<FilterFormValues>;
};

export function UsersTableFilters({
	locale,
	initialValues,
}: UsersTableFiltersProps) {
	const { t } = useLingui();
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FilterFormValues>({
		resolver: zodResolver(filterFormSchema),
		defaultValues: initialValues || {},
	});

	const onSubmit = (data: FilterFormValues) => {
		// Update URL with filter parameters
		const searchParams: Record<string, string> = {};

		Object.entries(data).forEach(([key, value]) => {
			if (value) {
				searchParams[key] = value;
			}
		});

		navigate({
			to: "/$locale/users/table",
			params: { locale },
			search: (prev) => ({ ...prev, ...searchParams, page: 1 }),
		});
	};

	const handleReset = () => {
		reset();
		navigate({
			to: "/$locale/users/table",
			params: { locale },
			search: { page: 1, pageSize: 10 },
		});
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-4 p-4 border rounded-md"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* Phone */}
				<div>
					<label htmlFor="phone" className="block text-sm font-medium mb-1">
						<Trans>Телефон</Trans>
					</label>
					<Input
						id="phone"
						{...register("phone")}
						placeholder={t`Введите телефон`}
					/>
					{errors.phone && (
						<p className="text-sm text-destructive mt-1">
							{errors.phone.message}
						</p>
					)}
				</div>

				{/* ID */}
				<div>
					<label htmlFor="id" className="block text-sm font-medium mb-1">
						<Trans>ID</Trans>
					</label>
					<Input id="id" {...register("id")} placeholder={t`Введите ID`} />
					{errors.id && (
						<p className="text-sm text-destructive mt-1">{errors.id.message}</p>
					)}
				</div>

				{/* Email */}
				<div>
					<label htmlFor="email" className="block text-sm font-medium mb-1">
						<Trans>Email</Trans>
					</label>
					<Input
						id="email"
						{...register("email")}
						type="email"
						placeholder={t`Введите email`}
					/>
					{errors.email && (
						<p className="text-sm text-destructive mt-1">
							{errors.email.message}
						</p>
					)}
				</div>

				{/* First Name */}
				<div>
					<label htmlFor="firstName" className="block text-sm font-medium mb-1">
						<Trans>Имя</Trans>
					</label>
					<Input
						id="firstName"
						{...register("firstName")}
						placeholder={t`Введите имя`}
					/>
					{errors.firstName && (
						<p className="text-sm text-destructive mt-1">
							{errors.firstName.message}
						</p>
					)}
				</div>

				{/* Last Name */}
				<div>
					<label htmlFor="lastName" className="block text-sm font-medium mb-1">
						<Trans>Фамилия</Trans>
					</label>
					<Input
						id="lastName"
						{...register("lastName")}
						placeholder={t`Введите фамилию`}
					/>
					{errors.lastName && (
						<p className="text-sm text-destructive mt-1">
							{errors.lastName.message}
						</p>
					)}
				</div>

				{/* Registration Date From */}
				<div>
					<label
						htmlFor="registrationDateFrom"
						className="block text-sm font-medium mb-1"
					>
						<Trans>Дата регистрации (от)</Trans>
					</label>
					<Input
						id="registrationDateFrom"
						{...register("registrationDateFrom")}
						type="date"
					/>
					{errors.registrationDateFrom && (
						<p className="text-sm text-destructive mt-1">
							{errors.registrationDateFrom.message}
						</p>
					)}
				</div>

				{/* Registration Date To */}
				<div>
					<label
						htmlFor="registrationDateTo"
						className="block text-sm font-medium mb-1"
					>
						<Trans>Дата регистрации (до)</Trans>
					</label>
					<Input
						id="registrationDateTo"
						{...register("registrationDateTo")}
						type="date"
					/>
					{errors.registrationDateTo && (
						<p className="text-sm text-destructive mt-1">
							{errors.registrationDateTo.message}
						</p>
					)}
				</div>

				{/* Is Insider */}
				<div>
					<label htmlFor="isInsider" className="block text-sm font-medium mb-1">
						<Trans>Инсайдер</Trans>
					</label>
					<select
						id="isInsider"
						{...register("isInsider")}
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					>
						<option value="">
							<Trans>Все</Trans>
						</option>
						<option value="Y">
							<Trans>Да</Trans>
						</option>
						<option value="N">
							<Trans>Нет</Trans>
						</option>
					</select>
					{errors.isInsider && (
						<p className="text-sm text-destructive mt-1">
							{errors.isInsider.message}
						</p>
					)}
				</div>

				{/* Country */}
				<div>
					<label htmlFor="country" className="block text-sm font-medium mb-1">
						<Trans>Страна</Trans>
					</label>
					<Input
						id="country"
						{...register("country")}
						placeholder={t`Введите страну`}
					/>
					{errors.country && (
						<p className="text-sm text-destructive mt-1">
							{errors.country.message}
						</p>
					)}
				</div>

				{/* Domain */}
				<div>
					<label htmlFor="domain" className="block text-sm font-medium mb-1">
						<Trans>Домен</Trans>
					</label>
					<Input
						id="domain"
						{...register("domain")}
						placeholder={t`Введите домен`}
					/>
					{errors.domain && (
						<p className="text-sm text-destructive mt-1">
							{errors.domain.message}
						</p>
					)}
				</div>

				{/* Is Real Account Created */}
				<div>
					<label
						htmlFor="isRealAccountCreated"
						className="block text-sm font-medium mb-1"
					>
						<Trans>Реальный аккаунт</Trans>
					</label>
					<select
						id="isRealAccountCreated"
						{...register("isRealAccountCreated")}
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					>
						<option value="">
							<Trans>Все</Trans>
						</option>
						<option value="Y">
							<Trans>Да</Trans>
						</option>
						<option value="N">
							<Trans>Нет</Trans>
						</option>
					</select>
					{errors.isRealAccountCreated && (
						<p className="text-sm text-destructive mt-1">
							{errors.isRealAccountCreated.message}
						</p>
					)}
				</div>

				{/* Is Demo Account Created */}
				<div>
					<label
						htmlFor="isDemoAccountCreated"
						className="block text-sm font-medium mb-1"
					>
						<Trans>Демо аккаунт</Trans>
					</label>
					<select
						id="isDemoAccountCreated"
						{...register("isDemoAccountCreated")}
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					>
						<option value="">
							<Trans>Все</Trans>
						</option>
						<option value="Y">
							<Trans>Да</Trans>
						</option>
						<option value="N">
							<Trans>Нет</Trans>
						</option>
					</select>
					{errors.isDemoAccountCreated && (
						<p className="text-sm text-destructive mt-1">
							{errors.isDemoAccountCreated.message}
						</p>
					)}
				</div>
			</div>

			<div className="flex gap-2">
				<Button type="submit">
					<Trans>Применить фильтры</Trans>
				</Button>
				<Button type="button" variant="outline" onClick={handleReset}>
					<Trans>Сбросить</Trans>
				</Button>
			</div>
		</form>
	);
}
