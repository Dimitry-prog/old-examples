import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
	locales: ["ru", "en"],
	sourceLocale: "ru",
	catalogs: [
		{
			path: "src/locales/{locale}/messages",
			include: ["src"],
			exclude: [
				"**/node_modules/**",
				"**/*.test.ts",
				"**/*.test.tsx",
				"**/forms/ZodFormExamples.tsx",
				"**/auth/LoginForm.tsx",
			],
		},
	],
	format: "po",
	compileNamespace: "es",
	fallbackLocales: {
		default: "ru",
	},
};

export default config;
