import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Пример store для демонстрации
 * Показывает основные возможности Zustand
 */

type CounterState = {
	count: number;
	history: number[];
	lastUpdated: Date | null;
};

type CounterActions = {
	increment: () => void;
	decrement: () => void;
	incrementBy: (amount: number) => void;
	reset: () => void;
	undo: () => void;
	clearHistory: () => void;
};

export type CounterStore = CounterState & CounterActions;

const initialState: CounterState = {
	count: 0,
	history: [],
	lastUpdated: null,
};

export const useCounterStore = create<CounterStore>()(
	devtools(
		(set, get) => ({
			...initialState,

			increment: () => {
				set(
					(state) => ({
						count: state.count + 1,
						history: [...state.history, state.count],
						lastUpdated: new Date(),
					}),
					false,
					"counter/increment",
				);
			},

			decrement: () => {
				set(
					(state) => ({
						count: state.count - 1,
						history: [...state.history, state.count],
						lastUpdated: new Date(),
					}),
					false,
					"counter/decrement",
				);
			},

			incrementBy: (amount: number) => {
				set(
					(state) => ({
						count: state.count + amount,
						history: [...state.history, state.count],
						lastUpdated: new Date(),
					}),
					false,
					"counter/incrementBy",
				);
			},

			reset: () => {
				set(
					{
						count: 0,
						history: [],
						lastUpdated: new Date(),
					},
					false,
					"counter/reset",
				);
			},

			undo: () => {
				const state = get();
				if (state.history.length > 0) {
					const previousValue = state.history[
						state.history.length - 1
					] as number;
					set(
						{
							count: previousValue,
							history: state.history.slice(0, -1),
							lastUpdated: new Date(),
						},
						false,
						"counter/undo",
					);
				}
			},

			clearHistory: () => {
				set(
					{
						history: [],
						lastUpdated: new Date(),
					},
					false,
					"counter/clearHistory",
				);
			},
		}),
		{
			name: "counter-store",
		},
	),
);
