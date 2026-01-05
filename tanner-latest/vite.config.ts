import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig(() => {
	const targetHost = process.env.VITE_TARGET_HOST;
	return {
		plugins: [
			tanstackRouter({
				target: "react",
				autoCodeSplitting: true,
				generatedRouteTree: "./src/shared/libs/router/routeTree.gen.ts",
				routesDirectory: "./src/routes",
			}),
			viteReact({
				babel: {
					plugins: ["babel-plugin-react-compiler"],
				},
			}),
			tailwindcss(),
		],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
				"@shared": fileURLToPath(new URL("./src/shared", import.meta.url)),
			},
		},
		server: {
			port: 5001,
			open: true,
			proxy: {
				"/api": {
					target: targetHost,
					changeOrigin: true,
					secure: false,
				},
			},
		},
	};
});
