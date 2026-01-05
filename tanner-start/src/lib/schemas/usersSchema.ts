import { z } from "zod";

// Zod схема для search параметров URL
export const usersSearchSchema = z.object({
	page: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().default(10),
	sortBy: z.string().optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
	// Фильтры
	phone: z.string().optional(),
	id: z.string().optional(),
	email: z.string().optional(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	registrationDateFrom: z.string().optional(),
	registrationDateTo: z.string().optional(),
	isInsider: z.enum(["Y", "N", ""]).optional(),
	country: z.string().optional(),
	domain: z.string().optional(),
	isRealAccountCreated: z.enum(["Y", "N", ""]).optional(),
	isDemoAccountCreated: z.enum(["Y", "N", ""]).optional(),
});

export type UsersSearchParams = z.infer<typeof usersSearchSchema>;

// Zod схема для формы фильтров
export const filterFormSchema = z.object({
	phone: z.string().optional(),
	id: z.string().optional(),
	email: z.string().email().optional().or(z.literal("")),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	registrationDateFrom: z.string().optional(),
	registrationDateTo: z.string().optional(),
	isInsider: z.enum(["Y", "N", ""]).optional(),
	country: z.string().optional(),
	domain: z.string().optional(),
	isRealAccountCreated: z.enum(["Y", "N", ""]).optional(),
	isDemoAccountCreated: z.enum(["Y", "N", ""]).optional(),
});

export type FilterFormValues = z.infer<typeof filterFormSchema>;
