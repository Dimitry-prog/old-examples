export type User = {
	id: string;
	phone: string;
	email: string;
	firstName: string;
	lastName: string;
	registrationDate: string; // ISO 8601 format
	isInsider: "Y" | "N";
	country: string;
	domain: string;
	isRealAccountCreated: "Y" | "N";
	isDemoAccountCreated: "Y" | "N";
};

export type UsersListResponse = {
	data: User[];
	total: number;
	page: number;
	pageSize: number;
};

export type UsersListParams = {
	page: number;
	pageSize: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	filters?: Record<string, string>;
};
