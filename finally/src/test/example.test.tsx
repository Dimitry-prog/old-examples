import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

// Простой компонент для примера
function Counter() {
	const [count, setCount] = React.useState(0);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}

describe("Example React Component Test", () => {
	it("renders and increments counter", async () => {
		const user = userEvent.setup();
		render(<Counter />);

		expect(screen.getByText("Count: 0")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /increment/i }));

		expect(screen.getByText("Count: 1")).toBeInTheDocument();
	});
});
