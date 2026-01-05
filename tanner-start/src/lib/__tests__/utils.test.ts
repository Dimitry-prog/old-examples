import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("Utils", () => {
	describe("cn (className utility)", () => {
		it("should merge class names correctly", () => {
			expect(cn("foo", "bar")).toBe("foo bar");
		});

		it("should handle conditional classes", () => {
			expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
			expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
		});

		it("should merge Tailwind classes correctly", () => {
			// tailwind-merge должен объединять конфликтующие классы
			expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
		});

		it("should handle undefined and null values", () => {
			expect(cn("foo", undefined, "bar", null)).toBe("foo bar");
		});

		it("should handle arrays of classes", () => {
			expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
		});

		it("should handle objects with boolean values", () => {
			expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
		});

		it("should handle empty input", () => {
			expect(cn()).toBe("");
			expect(cn("")).toBe("");
		});

		it("should handle complex combinations", () => {
			const result = cn(
				"base-class",
				{ "conditional-class": true },
				["array-class-1", "array-class-2"],
				false && "hidden-class",
				"final-class",
			);
			expect(result).toContain("base-class");
			expect(result).toContain("conditional-class");
			expect(result).toContain("array-class-1");
			expect(result).toContain("array-class-2");
			expect(result).toContain("final-class");
			expect(result).not.toContain("hidden-class");
		});
	});
});
