import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
	decrement,
	increment,
	incrementByAmount,
	reset,
	setText,
} from "../../store/slices/exampleSlice";

export function ReduxExample() {
	const dispatch = useAppDispatch();
	const { value, text } = useAppSelector((state) => state.example);

	return (
		<div className="p-6 space-y-4 max-w-md mx-auto">
			<h2 className="text-2xl font-bold">Redux Toolkit Example</h2>

			<div className="space-y-2">
				<p className="text-lg">
					Counter: <span className="font-bold">{value}</span>
				</p>

				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => dispatch(increment())}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						+1
					</button>
					<button
						type="button"
						onClick={() => dispatch(decrement())}
						className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
					>
						-1
					</button>
					<button
						type="button"
						onClick={() => dispatch(incrementByAmount(5))}
						className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
					>
						+5
					</button>
					<button
						type="button"
						onClick={() => dispatch(reset())}
						className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
					>
						Reset
					</button>
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-lg">
					Text: <span className="font-bold">{text || "(empty)"}</span>
				</p>
				<input
					type="text"
					value={text}
					onChange={(e) => dispatch(setText(e.target.value))}
					placeholder="Enter text..."
					className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
		</div>
	);
}
