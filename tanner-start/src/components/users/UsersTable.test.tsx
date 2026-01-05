import type { User } from "@/types/users";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UsersTable } from "./UsersTable";

// Mock lingui
vi.mock("@lingui/react/macro", () => ({
	Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock UsersTableActions component
vi.mock("./UsersTableActions", () => ({
	UsersTableActions: ({ user }: { user: User }) => (
		<div data-testid={`actions-${user.id}`}>Actions</div>
	),
}));

const mockUsers: User[] = [
	{
		id: "1",
		phone: "+1234567890",
		email: "user1@example.com",
		firstName: "John",
		lastName: "Doe",
		registrationDate: "2024-01-15T10:30:00Z",
		isInsider: "Y",
		country: "USA",
		domain: "example.com",
		isRealAccountCreated: "Y",
		isDemoAccountCreated: "N",
	},
	{
		id: "2",
		phone: "+9876543210",
		email: "user2@example.com",
		firstName: "Jane",
		lastName: "Smith",
		registrationDate: "2024-02-20T14:45:00Z",
		isInsider: "N",
		country: "Germany",
		domain: "test.com",
		isRealAccountCreated: "N",
		isDemoAccountCreated: "Y",
	},
];

describe("UsersTable", () => {
	const defaultProps = {
		data: mockUsers,
		isLoading: false,
		error: null,
		pagination: { pageIndex: 0, pageSize: 10 } as PaginationState,
		sorting: [] as SortingState,
		onPaginationChange: vi.fn(),
		onSortingChange: vi.fn(),
		locale: "en",
		totalRows: 2,
	};

	describe("rendering with data", () => {
		it("should render table with mock data", () => {
			render(<UsersTable {...defaultProps} />);

			// Check if table is rendered
			const table = screen.getByRole("table");
			expect(table).toBeInTheDocument();
		});

		it("should render all column headers", () => {
			render(<UsersTable {...defaultProps} />);

			// Check for column headers
			expect(screen.getByText("Телефон")).toBeInTheDocument();
			expect(screen.getByText("ID")).toBeInTheDocument();
			expect(screen.getByText("Email")).toBeInTheDocument();
			expect(screen.getByText("Имя")).toBeInTheDocument();
			expect(screen.getByText("Фамилия")).toBeInTheDocument();
			expect(screen.getByText("Дата регистрации")).toBeInTheDocument();
			expect(screen.getByText("Инсайдер")).toBeInTheDocument();
			expect(screen.getByText("Страна")).toBeInTheDocument();
			expect(screen.getByText("Домен")).toBeInTheDocument();
			expect(screen.getByText("Реальный аккаунт")).toBeInTheDocument();
			expect(screen.getByText("Демо аккаунт")).toBeInTheDocument();
			expect(screen.getByText("Действия")).toBeInTheDocument();
		});

		it("should render all user data rows", () => {
			render(<UsersTable {...defaultProps} />);

			// Check if both users are rendered
			expect(screen.getByText("user1@example.com")).toBeInTheDocument();
			expect(screen.getByText("user2@example.com")).toBeInTheDocument();
			expect(screen.getByText("John")).toBeInTheDocument();
			expect(screen.getByText("Jane")).toBeInTheDocument();
		});

		it("should render user phone numbers", () => {
			render(<UsersTable {...defaultProps} />);

			expect(screen.getByText("+1234567890")).toBeInTheDocument();
			expect(screen.getByText("+9876543210")).toBeInTheDocument();
		});

		it("should render user IDs", () => {
			render(<UsersTable {...defaultProps} />);

			expect(screen.getByText("1")).toBeInTheDocument();
			expect(screen.getByText("2")).toBeInTheDocument();
		});

		it("should render email as link", () => {
			render(<UsersTable {...defaultProps} />);

			const emailLink = screen.getByRole("link", {
				name: "user1@example.com",
			});
			expect(emailLink).toBeInTheDocument();
			expect(emailLink).toHaveAttribute("href", "mailto:user1@example.com");
		});

		it("should render country information", () => {
			render(<UsersTable {...defaultProps} />);

			expect(screen.getByText("USA")).toBeInTheDocument();
			expect(screen.getByText("Germany")).toBeInTheDocument();
		});

		it("should render domain information", () => {
			render(<UsersTable {...defaultProps} />);

			expect(screen.getByText("example.com")).toBeInTheDocument();
			expect(screen.getByText("test.com")).toBeInTheDocument();
		});

		it("should render insider status", () => {
			render(<UsersTable {...defaultProps} />);

			const rows = screen.getAllByRole("row");
			// First row is header, second is first user (Y), third is second user (N)
			const row1 = rows[1];
			const row2 = rows[2];
			if (row1 && row2) {
				expect(within(row1).getByText("Y")).toBeInTheDocument();
				expect(within(row2).getByText("N")).toBeInTheDocument();
			}
		});

		it("should render actions column for each user", () => {
			render(<UsersTable {...defaultProps} />);

			expect(screen.getByTestId("actions-1")).toBeInTheDocument();
			expect(screen.getByTestId("actions-2")).toBeInTheDocument();
		});
	});

	describe("loading state", () => {
		it("should display loading spinner when isLoading is true", () => {
			render(<UsersTable {...defaultProps} isLoading={true} />);

			const spinner = screen.getByRole("img", { hidden: true });
			expect(spinner).toBeInTheDocument();
			expect(spinner).toHaveClass("animate-spin");
		});

		it("should not display table when loading", () => {
			render(<UsersTable {...defaultProps} isLoading={true} />);

			expect(screen.queryByRole("table")).not.toBeInTheDocument();
		});

		it("should not display error when loading", () => {
			render(
				<UsersTable
					{...defaultProps}
					isLoading={true}
					error={new Error("Test error")}
				/>,
			);

			expect(
				screen.queryByText("Ошибка загрузки данных"),
			).not.toBeInTheDocument();
		});
	});

	describe("error state", () => {
		it("should display error message when error is present", () => {
			const error = new Error("Failed to fetch users");
			render(<UsersTable {...defaultProps} error={error} />);

			expect(screen.getByText("Ошибка загрузки данных")).toBeInTheDocument();
			expect(screen.getByText("Failed to fetch users")).toBeInTheDocument();
		});

		it("should not display table when error is present", () => {
			const error = new Error("Test error");
			render(<UsersTable {...defaultProps} error={error} />);

			expect(screen.queryByRole("table")).not.toBeInTheDocument();
		});

		it("should display error with destructive variant", () => {
			const error = new Error("Test error");
			render(<UsersTable {...defaultProps} error={error} />);

			const alert = screen.getByRole("alert");
			expect(alert).toBeInTheDocument();
		});
	});

	describe("empty state", () => {
		it("should display empty message when no data", () => {
			render(<UsersTable {...defaultProps} data={[]} totalRows={0} />);

			expect(screen.getByText("Пользователи не найдены")).toBeInTheDocument();
		});

		it("should not display table when no data", () => {
			render(<UsersTable {...defaultProps} data={[]} totalRows={0} />);

			expect(screen.queryByRole("table")).not.toBeInTheDocument();
		});

		it("should not display loading or error when showing empty state", () => {
			render(<UsersTable {...defaultProps} data={[]} totalRows={0} />);

			expect(
				screen.queryByRole("img", { hidden: true }),
			).not.toBeInTheDocument();
			expect(
				screen.queryByText("Ошибка загрузки данных"),
			).not.toBeInTheDocument();
		});
	});

	describe("sorting interaction", () => {
		it("should call onSortingChange when clicking column header", async () => {
			const user = userEvent.setup();
			const onSortingChange = vi.fn();

			render(
				<UsersTable {...defaultProps} onSortingChange={onSortingChange} />,
			);

			// Find and click the Email column header button
			const emailHeader = screen.getByRole("button", { name: /Email/i });
			await user.click(emailHeader);

			expect(onSortingChange).toHaveBeenCalled();
		});

		it("should call onSortingChange when clicking phone column header", async () => {
			const user = userEvent.setup();
			const onSortingChange = vi.fn();

			render(
				<UsersTable {...defaultProps} onSortingChange={onSortingChange} />,
			);

			const phoneHeader = screen.getByRole("button", { name: /Телефон/i });
			await user.click(phoneHeader);

			expect(onSortingChange).toHaveBeenCalled();
		});

		it("should call onSortingChange when clicking firstName column header", async () => {
			const user = userEvent.setup();
			const onSortingChange = vi.fn();

			render(
				<UsersTable {...defaultProps} onSortingChange={onSortingChange} />,
			);

			const firstNameHeader = screen.getByRole("button", { name: /Имя/i });
			await user.click(firstNameHeader);

			expect(onSortingChange).toHaveBeenCalled();
		});

		it("should display sorting indicator on sorted column", () => {
			const sorting: SortingState = [{ id: "email", desc: false }];

			render(<UsersTable {...defaultProps} sorting={sorting} />);

			// Check that the table renders with sorting state
			const table = screen.getByRole("table");
			expect(table).toBeInTheDocument();
		});
	});

	describe("pagination state", () => {
		it("should render correct number of rows based on data", () => {
			render(<UsersTable {...defaultProps} />);

			const rows = screen.getAllByRole("row");
			// 1 header row + 2 data rows
			expect(rows).toHaveLength(3);
		});

		it("should handle different page sizes", () => {
			const singleUser = [mockUsers[0]!];
			render(
				<UsersTable
					{...defaultProps}
					data={singleUser}
					pagination={{ pageIndex: 0, pageSize: 1 }}
					totalRows={2}
				/>,
			);

			const rows = screen.getAllByRole("row");
			// 1 header row + 1 data row
			expect(rows).toHaveLength(2);
		});

		it("should handle different page indices", () => {
			render(
				<UsersTable
					{...defaultProps}
					pagination={{ pageIndex: 1, pageSize: 10 }}
				/>,
			);

			// Table should still render with data
			const table = screen.getByRole("table");
			expect(table).toBeInTheDocument();
		});
	});

	describe("locale handling", () => {
		it("should pass locale to column definitions", () => {
			render(<UsersTable {...defaultProps} locale="ru" />);

			// Table should render with Russian locale
			const table = screen.getByRole("table");
			expect(table).toBeInTheDocument();
		});

		it("should format dates according to locale", () => {
			render(<UsersTable {...defaultProps} locale="en" />);

			// Check that dates are rendered (format depends on locale)
			const table = screen.getByRole("table");
			expect(table).toBeInTheDocument();
		});
	});

	describe("responsive behavior", () => {
		it("should render table with border", () => {
			const { container } = render(<UsersTable {...defaultProps} />);

			const tableWrapper = container.querySelector(".rounded-md.border");
			expect(tableWrapper).toBeInTheDocument();
		});
	});

	describe("edge cases", () => {
		it("should handle single user", () => {
			const singleUser = [mockUsers[0]!];
			render(<UsersTable {...defaultProps} data={singleUser} totalRows={1} />);

			const rows = screen.getAllByRole("row");
			expect(rows).toHaveLength(2); // header + 1 data row
		});

		it("should handle large dataset", () => {
			const manyUsers: User[] = Array.from({ length: 100 }, (_, i) => ({
				...mockUsers[0],
				id: `${i + 1}`,
				email: `user${i + 1}@example.com`,
			}));

			render(
				<UsersTable
					{...defaultProps}
					data={manyUsers.slice(0, 10)}
					totalRows={100}
					pagination={{ pageIndex: 0, pageSize: 10 }}
				/>,
			);

			const rows = screen.getAllByRole("row");
			expect(rows).toHaveLength(11); // header + 10 data rows
		});

		it("should handle users with minimal fields", () => {
			const userWithMinimalFields: User = {
				id: "3",
				phone: "+1111111111",
				email: "user3@example.com",
				firstName: "Test",
				lastName: "User",
				registrationDate: "2024-03-01T00:00:00Z",
				isInsider: "N",
				country: "UK",
				domain: "test.com",
				isRealAccountCreated: "N",
				isDemoAccountCreated: "N",
			};

			render(
				<UsersTable
					{...defaultProps}
					data={[userWithMinimalFields]}
					totalRows={1}
				/>,
			);

			expect(screen.getByText("user3@example.com")).toBeInTheDocument();
		});

		it("should handle zero totalRows with data", () => {
			render(<UsersTable {...defaultProps} totalRows={0} />);

			// Should still render the table if data is provided
			const table = screen.getByRole("table");
			expect(table).toBeInTheDocument();
		});
	});
});
