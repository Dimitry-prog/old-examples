#!/usr/bin/env node

/**
 * Скрипт для настройки Git hooks с помощью Lefthook
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    })
    return { success: true, output: result }
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout }
  }
}

function checkGitRepository() {
  logInfo('Checking if this is a Git repository...')
  
  const result = execCommand('git rev-parse --git-dir', { silent: true })
  if (!result.success) {
    logError('This is not a Git repository. Please run "git init" first.')
    process.exit(1)
  }
  
  logSuccess('Git repository detected')
}

function checkLefthookInstallation() {
  logInfo('Checking Lefthook installation...')
  
  const result = execCommand('lefthook version', { silent: true })
  if (!result.success) {
    logError('Lefthook is not installed. Please install it first:')
    log('  npm install --save-dev lefthook')
    log('  # or')
    log('  yarn add --dev lefthook')
    process.exit(1)
  }
  
  logSuccess(`Lefthook is installed: ${result.output.trim()}`)
}

function installLefthookHooks() {
  logInfo('Installing Lefthook hooks...')
  
  const result = execCommand('lefthook install')
  if (!result.success) {
    logError('Failed to install Lefthook hooks')
    logError(result.error)
    process.exit(1)
  }
  
  logSuccess('Lefthook hooks installed successfully')
}

function validateLefthookConfig() {
  logInfo('Validating Lefthook configuration...')
  
  const configPath = join(process.cwd(), 'lefthook.yml')
  if (!existsSync(configPath)) {
    logError('lefthook.yml configuration file not found')
    process.exit(1)
  }
  
  // Проверяем синтаксис конфигурации
  const result = execCommand('lefthook dump', { silent: true })
  if (!result.success) {
    logError('Invalid Lefthook configuration:')
    logError(result.error)
    process.exit(1)
  }
  
  logSuccess('Lefthook configuration is valid')
}

function checkRequiredScripts() {
  logInfo('Checking required npm scripts...')
  
  const packageJsonPath = join(process.cwd(), 'package.json')
  if (!existsSync(packageJsonPath)) {
    logError('package.json not found')
    process.exit(1)
  }
  
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const scripts = packageJson.scripts || {}
  
  const requiredScripts = [
    'lint',
    'lint:staged',
    'format:check',
    'type-check',
    'test:ci',
    'test:related',
    'test:coverage:check',
  ]
  
  const missingScripts = requiredScripts.filter(script => !scripts[script])
  
  if (missingScripts.length > 0) {
    logWarning(`Missing required scripts: ${missingScripts.join(', ')}`)
    logInfo('Please add these scripts to your package.json')
  } else {
    logSuccess('All required scripts are present')
  }
}

function createGitIgnoreEntries() {
  logInfo('Updating .gitignore...')
  
  const gitignorePath = join(process.cwd(), '.gitignore')
  let gitignoreContent = ''
  
  if (existsSync(gitignorePath)) {
    gitignoreContent = readFileSync(gitignorePath, 'utf8')
  }
  
  const entriesToAdd = [
    '# Lefthook',
    '.lefthook-local/',
    '.lefthook/',
  ]
  
  let updated = false
  for (const entry of entriesToAdd) {
    if (!gitignoreContent.includes(entry)) {
      gitignoreContent += `\n${entry}`
      updated = true
    }
  }
  
  if (updated) {
    writeFileSync(gitignorePath, gitignoreContent)
    logSuccess('.gitignore updated with Lefthook entries')
  } else {
    logSuccess('.gitignore already contains Lefthook entries')
  }
}

function testHooks() {
  logInfo('Testing hooks configuration...')
  
  // Тестируем pre-commit хук
  const result = execCommand('lefthook run pre-commit --no-tty', { silent: true })
  if (result.success) {
    logSuccess('Pre-commit hook test passed')
  } else {
    logWarning('Pre-commit hook test failed (this might be expected if there are no staged files)')
  }
}

function displayUsageInformation() {
  log('\n' + '='.repeat(60), colors.cyan)
  log('🎉 Lefthook setup completed successfully!', colors.green + colors.bright)
  log('='.repeat(60), colors.cyan)
  
  log('\n📋 Available commands:', colors.bright)
  log('  npm run hooks:install   - Install Lefthook hooks')
  log('  npm run hooks:uninstall - Uninstall Lefthook hooks')
  log('  npm run hooks:run       - Run specific hook manually')
  log('  lefthook run pre-commit - Test pre-commit hooks')
  log('  lefthook run pre-push   - Test pre-push hooks')
  
  log('\n🔧 Hook configuration:', colors.bright)
  log('  Pre-commit: Runs linting, formatting, type checking, and related tests')
  log('  Pre-push:   Runs full test suite, build check, and coverage validation')
  log('  Commit-msg: Validates commit message format using Commitlint')
  
  log('\n💡 Tips:', colors.bright)
  log('  • Use "git commit --no-verify" to skip hooks temporarily')
  log('  • Use "LEFTHOOK=0 git commit" to disable Lefthook completely')
  log('  • Edit lefthook.yml to customize hook behavior')
  log('  • Check .lefthook-local/ for local overrides')
  
  log('\n🚀 Happy coding!', colors.magenta)
}

function main() {
  log('🔧 Setting up Lefthook Git hooks...', colors.cyan + colors.bright)
  log('')
  
  try {
    checkGitRepository()
    checkLefthookInstallation()
    validateLefthookConfig()
    checkRequiredScripts()
    createGitIgnoreEntries()
    installLefthookHooks()
    testHooks()
    displayUsageInformation()
  } catch (error) {
    logError(`Setup failed: ${error.message}`)
    process.exit(1)
  }
}

// Запускаем только если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}