import { useTheme, type Mode, type ColorScheme } from "@/hooks/useTheme";
import { Button } from "./button";

export const ThemeSwitcher = () => {
	const { mode, setMode, colorScheme, setColorScheme } = useTheme();

	const modes: { value: Mode; label: string }[] = [
		{ value: "light", label: "Light" },
		{ value: "dark", label: "Dark" },
	];

	const colorSchemes: { value: ColorScheme; label: string }[] = [
		{ value: "default", label: "Default" },
		{ value: "mono", label: "Mono" },
		{ value: "tangerine", label: "Tangerine" },
	];

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground w-20">Mode:</span>
				<div className="flex gap-2">
					{modes.map((m) => (
						<Button
							key={m.value}
							variant={mode === m.value ? "default" : "outline"}
							size="sm"
							onClick={() => setMode(m.value)}
						>
							{m.label}
						</Button>
					))}
				</div>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground w-20">Theme:</span>
				<div className="flex gap-2">
					{colorSchemes.map((cs) => (
						<Button
							key={cs.value}
							variant={colorScheme === cs.value ? "default" : "outline"}
							size="sm"
							onClick={() => setColorScheme(cs.value)}
						>
							{cs.label}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
};
