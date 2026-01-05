import { useEffect, useState } from "react";

export type Mode = "light" | "dark";
export type ColorScheme = "default" | "mono" | "tangerine";

type ThemeConfig = {
	mode: Mode;
	colorScheme: ColorScheme;
};

const MODE_STORAGE_KEY = "app-mode";
const COLOR_SCHEME_STORAGE_KEY = "app-color-scheme";

export const useTheme = () => {
	const [mode, setModeState] = useState<Mode>(() => {
		const stored = localStorage.getItem(MODE_STORAGE_KEY);
		return (stored as Mode) || "light";
	});

	const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
		const stored = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
		return (stored as ColorScheme) || "default";
	});

	useEffect(() => {
		const root = document.documentElement;

		// Remove all mode classes
		root.classList.remove("light", "dark");

		// Add current mode class
		if (mode === "dark") {
			root.classList.add("dark");
		}

		// Save to localStorage
		localStorage.setItem(MODE_STORAGE_KEY, mode);
	}, [mode]);

	useEffect(() => {
		const root = document.documentElement;

		// Remove all color scheme classes
		root.classList.remove("theme-default", "theme-mono", "theme-tangerine");

		// Add current color scheme class
		if (colorScheme !== "default") {
			root.classList.add(`theme-${colorScheme}`);
		}

		// Save to localStorage
		localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme);
	}, [colorScheme]);

	const setMode = (newMode: Mode) => {
		setModeState(newMode);
	};

	const setColorScheme = (newScheme: ColorScheme) => {
		setColorSchemeState(newScheme);
	};

	return { mode, setMode, colorScheme, setColorScheme };
};
