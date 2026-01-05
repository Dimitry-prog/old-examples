import { describe, expect, it } from "vitest";
import {
	filterFormSchema,
	usersSearchSchema,
	type FilterFormValues,
	type UsersSearchParams,
} from "./usersSchema";

describe("usersSearchSchema", () => {
	describe("valid inputs", () => {
		it("should validate valid search parameters with all fields", () => {
			const input = {
				page: 2,
				pageSize: 20,
				sortBy: "email",
				sortOrder: "asc" as const,
				phone: "+1234567890",
				id: "123",
				email: "test@example.com",
				firstName: "John",
				lastName: "Doe",
				registrationDateFrom: "2024-01-01",
				registrationDateTo: "2024-12-31",
				isInsider: "Y" as const,
				country: "USA",
				domain: "example.com",
				isRealAccountCreated: "Y" as const,
				isDemoAccountCreated: "N" as const,
			};

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(input);
			}
		});

		it("should validate minimal valid search parameters", () => {
			const input = {};

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.page).toBe(1);
				expect(result.data.pageSize).toBe(10);
			}
		});

		it("should validate with only pagination parameters", () => {
			const input = {
				page: 5,
				pageSize: 50,
			};

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.page).toBe(5);
				expect(result.data.pageSize).toBe(50);
			}
		});

		it("should validate with sorting parameters", () => {
			const input = {
				sortBy: "firstName",
				sortOrder: "desc" as const,
			};

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.sortBy).toBe("firstName");
				expect(result.data.sortOrder).toBe("desc");
			}
		});

		it("should validate with filter parameters", () => {
			const input = {
				email: "user@test.com",
				country: "Germany",
				isInsider: "N" as const,
			};

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.email).toBe("user@test.com");
				expect(result.data.country).toBe("Germany");
				expect(result.data.isInsider).toBe("N");
			}
		});
	});

	describe("default values", () => {
		it("should use default value for page when not provided", () => {
			const input = {};

			const result = usersSearchSchema.parse(input);
			expect(result.page).toBe(1);
		});

		it("should use default value for pageSize when not provided", () => {
			const input = {};

			const result = usersSearchSchema.parse(input);
			expect(result.pageSize).toBe(10);
		});

		it("should not have default values for optional fields", () => {
			const input = {};

			const result = usersSearchSchema.parse(input);
			expect(result.sortBy).toBeUndefined();
			expect(result.sortOrder).toBeUndefined();
			expect(result.phone).toBeUndefined();
			expect(result.email).toBeUndefined();
		});
	});

	describe("invalid inputs", () => {
		it("should reject negative page number", () => {
			const input = { page: -1 };

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject zero page number", () => {
			const input = { page: 0 };

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject non-integer page number", () => {
			const input = { page: 1.5 };

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject negative pageSize", () => {
			const input = { pageSize: -10 };

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject zero pageSize", () => {
			const input = { pageSize: 0 };

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject invalid sortOrder value", () => {
			const input = { sortOrder: "invalid" };

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject invalid isInsider value", () => {
			const input = { isInsider: "X" };

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject invalid isRealAccountCreated value", () => {
			const input = { isRealAccountCreated: "Maybe" };

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject invalid isDemoAccountCreated value", () => {
			const input = { isDemoAccountCreated: "1" };

			const result = usersSearchSchema.safeParse(input);
			expect(result.success).toBe(false);
		});
	});

	describe("type inference", () => {
		it("should infer correct TypeScript type", () => {
			const parsed: UsersSearchParams = usersSearchSchema.parse({});
			expect(parsed.page).toBe(1);
			expect(parsed.pageSize).toBe(10);
		});
	});
});

describe("filterFormSchema", () => {
	describe("valid inputs", () => {
		it("should validate valid filter form with all fields", () => {
			const input = {
				phone: "+1234567890",
				id: "123",
				email: "test@example.com",
				firstName: "John",
				lastName: "Doe",
				registrationDateFrom: "2024-01-01",
				registrationDateTo: "2024-12-31",
				isInsider: "Y" as const,
				country: "USA",
				domain: "example.com",
				isRealAccountCreated: "Y" as const,
				isDemoAccountCreated: "N" as const,
			};

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(input);
			}
		});

		it("should validate empty filter form", () => {
			const input = {};

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		it("should validate with empty string for email", () => {
			const input = { email: "" };

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.email).toBe("");
			}
		});

		it("should validate with valid email", () => {
			const input = { email: "user@domain.com" };

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.email).toBe("user@domain.com");
			}
		});

		it("should validate with empty string for enum fields", () => {
			const input = {
				isInsider: "" as const,
				isRealAccountCreated: "" as const,
				isDemoAccountCreated: "" as const,
			};

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(true);
		});
	});

	describe("invalid inputs", () => {
		it("should reject invalid email format", () => {
			const input = { email: "not-an-email" };

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject invalid email format with missing domain", () => {
			const input = { email: "user@" };

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject invalid email format with missing @", () => {
			const input = { email: "userdomain.com" };

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject invalid isInsider value", () => {
			const input = { isInsider: "X" };

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject invalid isRealAccountCreated value", () => {
			const input = { isRealAccountCreated: "true" };

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(false);
		});

		it("should reject invalid isDemoAccountCreated value", () => {
			const input = { isDemoAccountCreated: "false" };

			const result = filterFormSchema.safeParse(input);
			expect(result.success).toBe(false);
		});
	});

	describe("type inference", () => {
		it("should infer correct TypeScript type", () => {
			const parsed: FilterFormValues = filterFormSchema.parse({});
			expect(parsed).toBeDefined();
		});
	});
});
