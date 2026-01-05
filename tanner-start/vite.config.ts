import { lingui } from "@lingui/vite-plugin";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		TanStackRouterVite(),
		react({
			// Включаем React 19 возможности
			jsxRuntime: "automatic",
			jsxImportSource: "react",
			// Включаем Fast Refresh для лучшего DX
			fastRefresh: true,
			// Babel плагины для Lingui макросов
			babel: {
				plugins: ["macros"],
			},
		}),
		lingui(),
	],

	// Алиасы путей (синхронизированы с tsconfig.json)
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@/components": resolve(__dirname, "./src/components"),
			"@/hooks": resolve(__dirname, "./src/hooks"),
			"@/lib": resolve(__dirname, "./src/lib"),
			"@/stores": resolve(__dirname, "./src/stores"),
			"@/types": resolve(__dirname, "./src/types"),
			"@/styles": resolve(__dirname, "./src/styles"),
			"@/pages": resolve(__dirname, "./src/pages"),
		},
	},

	// Переменные окружения
	define: {
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version || "0.1.0"),
	},

	// Настройки сервера разработки
	server: {
		port: 3000,
		host: true,
		open: true,
		cors: true,
		// Прокси для API запросов (если нужно)
		proxy: {
			"/api": {
				target: process.env.VITE_API_URL || "http://localhost:8000",
				changeOrigin: true,
				secure: false,
			},
		},
	},

	// Настройки предварительного просмотра
	preview: {
		port: 3000,
		host: true,
		cors: true,
	},

	// Оптимизации сборки
	build: {
		target: "esnext",
		outDir: "dist",
		assetsDir: "assets",
		sourcemap: "hidden", // Source maps только для production debugging
		minify: "esbuild",
		cssCodeSplit: true, // Разделение CSS по чанкам

		// Настройки Rollup
		rollupOptions: {
			output: {
				// Разделение чанков для лучшего кеширования
				manualChunks: (id) => {
					// Vendor чанк для React
					if (
						id.includes("node_modules/react") ||
						id.includes("node_modules/react-dom")
					) {
						return "vendor-react";
					}

					// Router чанк
					if (id.includes("@tanstack/react-router")) {
						return "vendor-router";
					}

					// Query чанк
					if (id.includes("@tanstack/react-query")) {
						return "vendor-query";
					}

					// UI библиотеки
					if (
						id.includes("lucide-react") ||
						id.includes("class-variance-authority") ||
						id.includes("clsx") ||
						id.includes("tailwind-merge")
					) {
						return "vendor-ui";
					}

					// Forms
					if (
						id.includes("react-hook-form") ||
						id.includes("@hookform/resolvers") ||
						id.includes("zod")
					) {
						return "vendor-forms";
					}

					// State management
					if (id.includes("zustand")) {
						return "vendor-state";
					}

					// HTTP
					if (id.includes("ky")) {
						return "vendor-http";
					}

					// Radix UI компоненты
					if (id.includes("@radix-ui")) {
						return "vendor-radix";
					}

					// Lingui i18n
					if (id.includes("@lingui")) {
						return "vendor-i18n";
					}

					// Остальные node_modules
					if (id.includes("node_modules")) {
						return "vendor-misc";
					}
				},
				// Именование чанков
				chunkFileNames: "assets/js/[name]-[hash].js",
				entryFileNames: "assets/js/[name]-[hash].js",
				assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
			},
		},

		// Настройки для больших приложений
		chunkSizeWarningLimit: 1000,

		// Оптимизация для production
		reportCompressedSize: false, // Ускоряет сборку
		cssMinify: true,
	},

	// Оптимизация зависимостей
	optimizeDeps: {
		include: [
			"react",
			"react-dom",
			"react-dom/client",
			"@tanstack/react-router",
			"@tanstack/react-query",
			"zustand",
			"react-hook-form",
			"zod",
			"ky",
			"lucide-react",
			"clsx",
			"tailwind-merge",
			"@lingui/core",
			"@lingui/react",
		],
		exclude: ["@biomejs/biome"],
	},

	// CSS настройки
	css: {
		devSourcemap: true,
		preprocessorOptions: {
			scss: {
				additionalData: `@import "@/styles/variables.scss";`,
			},
		},
	},

	// Настройки для тестирования
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		css: true,
	},
});
