#!/usr/bin/env node

/**
 * Скрипт для проверки состояния Git hooks
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function execCommand(command) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    return { success: true, output: result.trim() }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

function checkGitHooksDirectory() {
  const hooksDir = join(process.cwd(), '.git', 'hooks')
  
  if (!existsSync(hooksDir)) {
    log('❌ Git hooks directory not found', colors.red)
    return false
  }
  
  log('✅ Git hooks directory exists', colors.green)
  return true
}

function checkLefthookInstallation() {
  const result = execCommand('lefthook version')
  
  if (!result.success) {
    log('❌ Lefthook not installed', colors.red)
    return false
  }
  
  log(`✅ Lefthook installed: ${result.output}`, colors.green)
  return true
}

function checkLefthookHooks() {
  const hooks = ['pre-commit', 'pre-push', 'commit-msg', 'post-commit', 'post-checkout', 'post-merge']
  const installedHooks = []
  const missingHooks = []
  
  for (const hook of hooks) {
    const hookPath = join(process.cwd(), '.git', 'hooks', hook)
    
    if (existsSync(hookPath)) {
      const content = readFileSync(hookPath, 'utf8')
      if (content.includes('lefthook')) {
        installedHooks.push(hook)
      } else {
        log(`⚠️  Hook ${hook} exists but not managed by Lefthook`, colors.yellow)
      }
    } else {
      missingHooks.push(hook)
    }
  }
  
  if (installedHooks.length > 0) {
    log(`✅ Lefthook hooks installed: ${installedHooks.join(', ')}`, colors.green)
  }
  
  if (missingHooks.length > 0) {
    log(`❌ Missing hooks: ${missingHooks.join(', ')}`, colors.red)
  }
  
  return installedHooks.length > 0
}

function checkLefthookConfig() {
  const configPath = join(process.cwd(), 'lefthook.yml')
  
  if (!existsSync(configPath)) {
    log('❌ lefthook.yml configuration not found', colors.red)
    return false
  }
  
  // Проверяем валидность конфигурации
  const result = execCommand('lefthook dump')
  
  if (!result.success) {
    log('❌ Invalid Lefthook configuration', colors.red)
    log(result.error, colors.red)
    return false
  }
  
  log('✅ Lefthook configuration is valid', colors.green)
  return true
}

function checkRequiredScripts() {
  const packageJsonPath = join(process.cwd(), 'package.json')
  
  if (!existsSync(packageJsonPath)) {
    log('❌ package.json not found', colors.red)
    return false
  }
  
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const scripts = packageJson.scripts || {}
  
  const requiredScripts = [
    'lint',
    'lint:staged',
    'format:check',
    'type-check',
    'test:ci',
  ]
  
  const missingScripts = requiredScripts.filter(script => !scripts[script])
  
  if (missingScripts.length > 0) {
    log(`❌ Missing required scripts: ${missingScripts.join(', ')}`, colors.red)
    return false
  }
  
  log('✅ All required scripts are present', colors.green)
  return true
}

function testHooks() {
  log('\n🧪 Testing hooks...', colors.cyan)
  
  // Тест pre-commit
  log('Testing pre-commit hook...', colors.blue)
  const preCommitResult = execCommand('lefthook run pre-commit --no-tty')
  
  if (preCommitResult.success) {
    log('✅ Pre-commit hook works', colors.green)
  } else {
    log('⚠️  Pre-commit hook test failed (might be expected)', colors.yellow)
  }
  
  // Тест pre-push
  log('Testing pre-push hook...', colors.blue)
  const prePushResult = execCommand('lefthook run pre-push --no-tty')
  
  if (prePushResult.success) {
    log('✅ Pre-push hook works', colors.green)
  } else {
    log('⚠️  Pre-push hook test failed (might be expected)', colors.yellow)
  }
}

function displaySummary(checks) {
  const passed = checks.filter(check => check.passed).length
  const total = checks.length
  
  log('\n' + '='.repeat(50), colors.cyan)
  log(`📊 Summary: ${passed}/${total} checks passed`, colors.bright)
  log('='.repeat(50), colors.cyan)
  
  checks.forEach(check => {
    const icon = check.passed ? '✅' : '❌'
    const color = check.passed ? colors.green : colors.red
    log(`${icon} ${check.name}`, color)
  })
  
  if (passed === total) {
    log('\n🎉 All checks passed! Lefthook is properly configured.', colors.green + colors.bright)
  } else {
    log('\n⚠️  Some checks failed. Please fix the issues above.', colors.yellow + colors.bright)
    log('Run "npm run hooks:setup" to fix common issues.', colors.blue)
  }
}

function main() {
  log('🔍 Checking Lefthook Git hooks status...', colors.cyan + colors.bright)
  log('')
  
  const checks = [
    { name: 'Git hooks directory', passed: checkGitHooksDirectory() },
    { name: 'Lefthook installation', passed: checkLefthookInstallation() },
    { name: 'Lefthook configuration', passed: checkLefthookConfig() },
    { name: 'Required npm scripts', passed: checkRequiredScripts() },
    { name: 'Lefthook hooks', passed: checkLefthookHooks() },
  ]
  
  testHooks()
  displaySummary(checks)
  
  const allPassed = checks.every(check => check.passed)
  process.exit(allPassed ? 0 : 1)
}

// Запускаем только если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}