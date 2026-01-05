#!/usr/bin/env node

/**
 * Скрипт для принудительного использования только pnpm
 * Блокирует установку пакетов через npm, yarn или bun
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Проверяем, что используется pnpm
const userAgent = process.env.npm_config_user_agent || "";
const execPath = process.env.npm_execpath || "";

if (!userAgent.includes("pnpm") && !execPath.includes("pnpm")) {
	const packageManager = userAgent.split(" ")[0]?.split("/")[0] || "unknown";

	console.error(`
❌ Этот проект использует только pnpm как пакетный менеджер.

Текущий менеджер: ${packageManager}
Требуется: pnpm

Пожалуйста, установите pnpm и используйте его:
  npm install -g pnpm
  pnpm install

Или используйте npx:
  npx pnpm install
`);

	process.exit(1);
}

// Удаляем lock файлы других менеджеров если они есть
const lockFiles = ["package-lock.json", "yarn.lock", "bun.lockb"];

lockFiles.forEach((file) => {
	if (fs.existsSync(file)) {
		console.log(`🧹 Удаляем ${file}...`);
		fs.unlinkSync(file);
	}
});

// Удаляем node_modules других менеджеров
const nodeModulesPath = path.join(process.cwd(), "node_modules");
if (fs.existsSync(nodeModulesPath)) {
	const packageLockExists = fs.existsSync("package-lock.json");
	const yarnLockExists = fs.existsSync("yarn.lock");
	const bunLockExists = fs.existsSync("bun.lockb");

	if (packageLockExists || yarnLockExists || bunLockExists) {
		console.log("🧹 Очищаем node_modules от других пакетных менеджеров...");
		fs.rmSync(nodeModulesPath, { recursive: true, force: true });
	}
}

console.log("✅ Проверка пакетного менеджера пройдена. Используется pnpm.");
