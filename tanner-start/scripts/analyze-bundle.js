#!/usr/bin/env node

/**
 * Скрипт для анализа размера bundle после сборки
 * Показывает размеры файлов и предупреждения о больших чанках
 */

import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(__dirname, "..", "dist");

// Цветовые коды для консоли
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

// Форматирование размера файла
function formatSize(bytes) {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}

// Получение цвета для размера файла
function getSizeColor(bytes) {
	const kb = bytes / 1024;
	if (kb > 500) return colors.red;
	if (kb > 250) return colors.yellow;
	return colors.green;
}

// Рекурсивное чтение директории
async function getFiles(dir, fileList = []) {
	const files = await readdir(dir);

	for (const file of files) {
		const filePath = join(dir, file);
		const fileStat = await stat(filePath);

		if (fileStat.isDirectory()) {
			await getFiles(filePath, fileList);
		} else {
			fileList.push({
				path: filePath.replace(distDir, ""),
				size: fileStat.size,
			});
		}
	}

	return fileList;
}

// Группировка файлов по типу
function groupFilesByType(files) {
	const groups = {
		js: [],
		css: [],
		html: [],
		assets: [],
	};

	for (const file of files) {
		if (file.path.endsWith(".js")) {
			groups.js.push(file);
		} else if (file.path.endsWith(".css")) {
			groups.css.push(file);
		} else if (file.path.endsWith(".html")) {
			groups.html.push(file);
		} else {
			groups.assets.push(file);
		}
	}

	return groups;
}

// Основная функция
async function analyzeBuild() {
	console.log(
		`\n${colors.bright}${colors.cyan}📦 Bundle Analysis${colors.reset}\n`,
	);

	try {
		const files = await getFiles(distDir);
		const groups = groupFilesByType(files);

		// Анализ JavaScript файлов
		if (groups.js.length > 0) {
			console.log(`${colors.bright}JavaScript Files:${colors.reset}`);
			const sortedJs = groups.js.sort((a, b) => b.size - a.size);
			let totalJsSize = 0;

			for (const file of sortedJs) {
				totalJsSize += file.size;
				const color = getSizeColor(file.size);
				console.log(
					`  ${color}${formatSize(file.size).padEnd(12)}${colors.reset} ${file.path}`,
				);
			}

			console.log(
				`  ${colors.bright}Total JS: ${formatSize(totalJsSize)}${colors.reset}\n`,
			);
		}

		// Анализ CSS файлов
		if (groups.css.length > 0) {
			console.log(`${colors.bright}CSS Files:${colors.reset}`);
			const sortedCss = groups.css.sort((a, b) => b.size - a.size);
			let totalCssSize = 0;

			for (const file of sortedCss) {
				totalCssSize += file.size;
				const color = getSizeColor(file.size);
				console.log(
					`  ${color}${formatSize(file.size).padEnd(12)}${colors.reset} ${file.path}`,
				);
			}

			console.log(
				`  ${colors.bright}Total CSS: ${formatSize(totalCssSize)}${colors.reset}\n`,
			);
		}

		// Анализ HTML файлов
		if (groups.html.length > 0) {
			console.log(`${colors.bright}HTML Files:${colors.reset}`);
			let totalHtmlSize = 0;

			for (const file of groups.html) {
				totalHtmlSize += file.size;
				console.log(
					`  ${colors.green}${formatSize(file.size).padEnd(12)}${colors.reset} ${file.path}`,
				);
			}

			console.log(
				`  ${colors.bright}Total HTML: ${formatSize(totalHtmlSize)}${colors.reset}\n`,
			);
		}

		// Анализ ассетов
		if (groups.assets.length > 0) {
			console.log(`${colors.bright}Assets:${colors.reset}`);
			const sortedAssets = groups.assets.sort((a, b) => b.size - a.size);
			let totalAssetsSize = 0;

			for (const file of sortedAssets.slice(0, 10)) {
				totalAssetsSize += file.size;
				console.log(
					`  ${colors.blue}${formatSize(file.size).padEnd(12)}${colors.reset} ${file.path}`,
				);
			}

			if (sortedAssets.length > 10) {
				console.log(
					`  ${colors.cyan}... and ${sortedAssets.length - 10} more files${colors.reset}`,
				);
			}

			for (const file of sortedAssets.slice(10)) {
				totalAssetsSize += file.size;
			}

			console.log(
				`  ${colors.bright}Total Assets: ${formatSize(totalAssetsSize)}${colors.reset}\n`,
			);
		}

		// Общий размер
		const totalSize = files.reduce((sum, file) => sum + file.size, 0);
		console.log(
			`${colors.bright}${colors.green}Total Build Size: ${formatSize(totalSize)}${colors.reset}\n`,
		);

		// Предупреждения
		const largeFiles = files.filter((f) => f.size > 500 * 1024);
		if (largeFiles.length > 0) {
			console.log(
				`${colors.yellow}⚠️  Warning: Found ${largeFiles.length} file(s) larger than 500KB:${colors.reset}`,
			);
			for (const file of largeFiles) {
				console.log(
					`  ${colors.red}${formatSize(file.size).padEnd(12)}${colors.reset} ${file.path}`,
				);
			}
			console.log();
		}

		// Рекомендации
		console.log(
			`${colors.bright}${colors.cyan}💡 Recommendations:${colors.reset}`,
		);
		console.log(`  • Keep JavaScript chunks under 250KB for optimal loading`);
		console.log(`  • Use lazy loading for routes and heavy components`);
		console.log(`  • Consider code splitting for large dependencies`);
		console.log(`  • Compress assets (images, fonts) before deployment`);
		console.log();
	} catch (error) {
		console.error(
			`${colors.red}Error analyzing build:${colors.reset}`,
			error.message,
		);
		process.exit(1);
	}
}

analyzeBuild();
