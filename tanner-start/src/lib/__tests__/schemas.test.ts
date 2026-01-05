import { describe, expect, it } from "vitest";
import {
	emailSchema,
	loginSchema,
	nameSchema,
	passwordSchema,
	registerSchema,
	userSchema,
} from "../schemas";

describe("Validation Schemas", () => {
	describe("emailSchema", () => {
		it("should validate correct email addresses", () => {
			expect(emailSchema.safeParse("test@example.com").success).toBe(true);
			expect(emailSchema.safeParse("user.name+tag@example.co.uk").success).toBe(
				true,
			);
		});

		it("should reject invalid email addresses", () => {
			expect(emailSchema.safeParse("").success).toBe(false);
			expect(emailSchema.safeParse("invalid").success).toBe(false);
			expect(emailSchema.safeParse("invalid@").success).toBe(false);
			expect(emailSchema.safeParse("@example.com").success).toBe(false);
		});
	});

	describe("passwordSchema", () => {
		it("should validate strong passwords", () => {
			expect(passwordSchema.safeParse("Password123").success).toBe(true);
			expect(passwordSchema.safeParse("MyP@ssw0rd").success).toBe(true);
		});

		it("should reject weak passwords", () => {
			// Too short
			expect(passwordSchema.safeParse("Pass1").success).toBe(false);

			// No uppercase
			expect(passwordSchema.safeParse("password123").success).toBe(false);

			// No lowercase
			expect(passwordSchema.safeParse("PASSWORD123").success).toBe(false);

			// No numbers
			expect(passwordSchema.safeParse("Password").success).toBe(false);
		});
	});

	describe("nameSchema", () => {
		it("should validate correct names", () => {
			expect(nameSchema.safeParse("John Doe").success).toBe(true);
			expect(nameSchema.safeParse("Иван Иванов").success).toBe(true);
		});

		it("should reject invalid names", () => {
			// Too short
			expect(nameSchema.safeParse("A").success).toBe(false);

			// Contains numbers
			expect(nameSchema.safeParse("John123").success).toBe(false);

			// Contains special characters
			expect(nameSchema.safeParse("John@Doe").success).toBe(false);
		});
	});

	describe("loginSchema", () => {
		it("should validate correct login credentials", () => {
			const validLogin = {
				email: "test@example.com",
				password: "anypassword",
			};
			expect(loginSchema.safeParse(validLogin).success).toBe(true);
		});

		it("should reject invalid login credentials", () => {
			const invalidEmail = {
				email: "invalid-email",
				password: "password",
			};
			expect(loginSchema.safeParse(invalidEmail).success).toBe(false);

			const missingPassword = {
				email: "test@example.com",
				password: "",
			};
			expect(loginSchema.safeParse(missingPassword).success).toBe(false);
		});
	});

	describe("registerSchema", () => {
		it("should validate correct registration data", () => {
			const validRegistration = {
				email: "test@example.com",
				password: "Password123",
				name: "John Doe",
				confirmPassword: "Password123",
			};
			expect(registerSchema.safeParse(validRegistration).success).toBe(true);
		});

		it("should reject mismatched passwords", () => {
			const mismatchedPasswords = {
				email: "test@example.com",
				password: "Password123",
				name: "John Doe",
				confirmPassword: "DifferentPassword123",
			};
			expect(registerSchema.safeParse(mismatchedPasswords).success).toBe(false);
		});

		it("should reject weak passwords", () => {
			const weakPassword = {
				email: "test@example.com",
				password: "weak",
				name: "John Doe",
				confirmPassword: "weak",
			};
			expect(registerSchema.safeParse(weakPassword).success).toBe(false);
		});
	});

	describe("userSchema", () => {
		it("should validate complete user object", () => {
			const validUser = {
				id: "123",
				email: "test@example.com",
				name: "John Doe",
				role: "user",
				accessToken: "token123",
				refreshToken: "refresh123",
			};
			expect(userSchema.safeParse(validUser).success).toBe(true);
		});

		it("should accept optional avatar", () => {
			const userWithAvatar = {
				id: "123",
				email: "test@example.com",
				name: "John Doe",
				avatar: "https://example.com/avatar.jpg",
				role: "user",
				accessToken: "token123",
				refreshToken: "refresh123",
			};
			expect(userSchema.safeParse(userWithAvatar).success).toBe(true);
		});

		it("should reject invalid role", () => {
			const invalidRole = {
				id: "123",
				email: "test@example.com",
				name: "John Doe",
				role: "invalid-role",
				accessToken: "token123",
				refreshToken: "refresh123",
			};
			expect(userSchema.safeParse(invalidRole).success).toBe(false);
		});
	});
});
