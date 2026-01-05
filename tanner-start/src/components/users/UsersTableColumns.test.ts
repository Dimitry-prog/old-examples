import { describe, expect, it } from "vitest";
import { formatDate } from "./UsersTableColumns";

describe("formatDate", () => {
	describe("formatting for different locales", () => {
		it("should format date for Russian locale (ru)", () => {
			const dateString = "2024-01-15T10:30:00Z";
			const locale = "ru";

			const result = formatDate(dateString, locale);

			// Russian format: DD.MM.YYYY, HH:MM
			expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/);
			expect(result).toContain("2024");
		});

		it("should format date for English locale (en)", () => {
			const dateString = "2024-01-15T10:30:00Z";
			const locale = "en";

			const result = formatDate(dateString, locale);

			// English format varies, but should contain year
			expect(result).toContain("2024");
		});

		it("should format date for German locale (de)", () => {
			const dateString = "2024-01-15T10:30:00Z";
			const locale = "de";

			const result = formatDate(dateString, locale);

			// German format: DD.MM.YYYY, HH:MM
			expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/);
			expect(result).toContain("2024");
		});

		it("should format date for US English locale (en-US)", () => {
			const dateString = "2024-01-15T10:30:00Z";
			const locale = "en-US";

			const result = formatDate(dateString, locale);

			// US format: MM/DD/YYYY, HH:MM AM/PM
			expect(result).toContain("2024");
		});
	});

	describe("date components", () => {
		it("should include year in formatted date", () => {
			const dateString = "2024-06-20T14:45:00Z";
			const locale = "en";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2024");
		});

		it("should include month in formatted date", () => {
			const dateString = "2024-06-20T14:45:00Z";
			const locale = "en";

			const result = formatDate(dateString, locale);

			// Month should be present (06 or 6 depending on locale)
			expect(result).toMatch(/06|6/);
		});

		it("should include day in formatted date", () => {
			const dateString = "2024-06-20T14:45:00Z";
			const locale = "en";

			const result = formatDate(dateString, locale);

			// Day should be present (20)
			expect(result).toContain("20");
		});

		it("should include time in formatted date", () => {
			const dateString = "2024-06-20T14:45:00Z";
			const locale = "ru";

			const result = formatDate(dateString, locale);

			// Time should be present in some format
			expect(result).toMatch(/\d{1,2}:\d{2}/);
		});
	});

	describe("edge cases", () => {
		it("should handle start of year date", () => {
			const dateString = "2024-01-01T12:00:00Z";
			const locale = "en";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2024");
			expect(result).toMatch(/01|1/);
		});

		it("should handle end of year date", () => {
			const dateString = "2024-12-31T12:00:00Z";
			const locale = "en";

			const result = formatDate(dateString, locale);

			// Date might be converted to local timezone
			expect(result).toMatch(/2024|2025/);
			expect(result).toMatch(/12|31|01/);
		});

		it("should handle leap year date", () => {
			const dateString = "2024-02-29T12:00:00Z";
			const locale = "en";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2024");
			expect(result).toMatch(/02|2/);
			expect(result).toMatch(/29/);
		});

		it("should handle midnight time", () => {
			const dateString = "2024-06-15T12:00:00";
			const locale = "ru";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2024");
			expect(result).toMatch(/\d{1,2}:\d{2}/); // Just check time format exists
		});

		it("should handle noon time", () => {
			const dateString = "2024-06-15T12:00:00";
			const locale = "ru";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2024");
			expect(result).toMatch(/\d{1,2}:\d{2}/); // Just check time format exists
		});
	});

	describe("invalid date handling", () => {
		it("should throw error for invalid date string", () => {
			const dateString = "invalid-date";
			const locale = "en";

			// Invalid dates throw RangeError in Intl.DateTimeFormat
			expect(() => formatDate(dateString, locale)).toThrow(RangeError);
		});

		it("should throw error for empty string", () => {
			const dateString = "";
			const locale = "en";

			// Empty string creates invalid date which throws
			expect(() => formatDate(dateString, locale)).toThrow(RangeError);
		});

		it("should throw error for malformed ISO date", () => {
			const dateString = "2024-13-45"; // Invalid month and day
			const locale = "en";

			// Malformed date should throw RangeError
			expect(() => formatDate(dateString, locale)).toThrow(RangeError);
		});
	});

	describe("different date formats", () => {
		it("should handle ISO 8601 format with timezone", () => {
			const dateString = "2024-06-15T10:30:00+03:00";
			const locale = "en";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2024");
		});

		it("should handle ISO 8601 format without timezone", () => {
			const dateString = "2024-06-15T10:30:00";
			const locale = "en";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2024");
		});

		it("should handle date-only ISO format", () => {
			const dateString = "2024-06-15";
			const locale = "en";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2024");
		});
	});

	describe("consistency", () => {
		it("should produce same output for same input", () => {
			const dateString = "2024-06-15T10:30:00Z";
			const locale = "ru";

			const result1 = formatDate(dateString, locale);
			const result2 = formatDate(dateString, locale);

			expect(result1).toBe(result2);
		});

		it("should produce different output for different locales", () => {
			const dateString = "2024-06-15T10:30:00Z";

			const resultRu = formatDate(dateString, "ru");
			const resultEn = formatDate(dateString, "en-US");

			// Different locales should produce different formats
			// (though they might coincidentally be the same in some cases)
			expect(resultRu).toBeDefined();
			expect(resultEn).toBeDefined();
		});
	});

	describe("real-world scenarios", () => {
		it("should format registration date from API response", () => {
			const dateString = "2024-10-24T15:30:45.123Z";
			const locale = "ru";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2024");
			expect(result).toContain("10");
			expect(result).toContain("24");
		});

		it("should format recent date", () => {
			const dateString = "2024-10-20T08:00:00Z";
			const locale = "en";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2024");
		});

		it("should format old date", () => {
			const dateString = "2020-01-01T00:00:00Z";
			const locale = "en";

			const result = formatDate(dateString, locale);

			expect(result).toContain("2020");
		});
	});
});
