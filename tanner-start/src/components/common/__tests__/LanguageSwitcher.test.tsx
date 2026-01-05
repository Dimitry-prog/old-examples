import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "../LanguageSwitcher";

// Mock TanStack Router hooks
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mockNavigate,
	useParams: () => mockUseParams(),
}));

describe("LanguageSwitcher", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseParams.mockReturnValue({ locale: "ru" });
		Object.defineProperty(window, "location", {
			value: { pathname: "/ru/dashboard" },
			writable: true,
		});
	});

	it("should render select with current locale", () => {
		render(<LanguageSwitcher />);

		const select = screen.getByRole("combobox");
		expect(select).toBeInTheDocument();
		expect(select).toHaveValue("ru");
	});

	it("should display all available locales", () => {
		render(<LanguageSwitcher />);

		const options = screen.getAllByRole("option");
		expect(options).toHaveLength(2);
		expect(options[0]).toHaveValue("ru");
		expect(options[0]).toHaveTextContent("Русский");
		expect(options[1]).toHaveValue("en");
		expect(options[1]).toHaveTextContent("English");
	});

	it("should call navigate when locale is changed", () => {
		render(<LanguageSwitcher />);

		const select = screen.getByRole("combobox");
		fireEvent.change(select, { target: { value: "en" } });

		expect(mockNavigate).toHaveBeenCalledWith({
			to: "/$locale/dashboard",
			params: { locale: "en" },
		});
	});

	it("should preserve current path when switching locale", () => {
		mockUseParams.mockReturnValue({ locale: "ru" });
		Object.defineProperty(window, "location", {
			value: { pathname: "/ru/profile/settings" },
			writable: true,
		});

		render(<LanguageSwitcher />);

		const select = screen.getByRole("combobox");
		fireEvent.change(select, { target: { value: "en" } });

		expect(mockNavigate).toHaveBeenCalledWith({
			to: "/$locale/profile/settings",
			params: { locale: "en" },
		});
	});

	it("should handle root path correctly", () => {
		mockUseParams.mockReturnValue({ locale: "ru" });
		Object.defineProperty(window, "location", {
			value: { pathname: "/ru" },
			writable: true,
		});

		render(<LanguageSwitcher />);

		const select = screen.getByRole("combobox");
		fireEvent.change(select, { target: { value: "en" } });

		expect(mockNavigate).toHaveBeenCalledWith({
			to: "/$locale/",
			params: { locale: "en" },
		});
	});

	it("should switch from en to ru", () => {
		mockUseParams.mockReturnValue({ locale: "en" });
		Object.defineProperty(window, "location", {
			value: { pathname: "/en/about" },
			writable: true,
		});

		render(<LanguageSwitcher />);

		const select = screen.getByRole("combobox");
		expect(select).toHaveValue("en");

		fireEvent.change(select, { target: { value: "ru" } });

		expect(mockNavigate).toHaveBeenCalledWith({
			to: "/$locale/about",
			params: { locale: "ru" },
		});
	});
});
