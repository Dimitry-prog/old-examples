import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		css: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.test.{ts,tsx}",
				"**/*.config.{ts,js}",
				"**/routeTree.gen.ts",
			],
		},
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
		},
	},
});
