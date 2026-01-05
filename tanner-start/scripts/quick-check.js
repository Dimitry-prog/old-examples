#!/usr/bin/env node

/**
 * Скрипт для быстрой проверки качества кода
 * Выполняет только самые важные проверки
 */

import { execSync } from 'child_process'

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

function logStep(step, total, message) {
  log(`[${step}/${total}] ${message}`, colors.cyan + colors.bright)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function execCommand(command, options = {}) {
  try {
    const startTime = Date.now()
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    })
    const duration = Date.now() - startTime
    return { success: true, output: result, duration }
  } catch (error) {
    const duration = Date.now() - (options.startTime || Date.now())
    return { 
      success: false, 
      error: error.message, 
      output: error.stdout || error.stderr,
      duration
    }
  }
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const quickChecks = [
  {
    name: 'Lint',
    command: 'npm run lint',
    description: 'Checking code style',
  },
  {
    name: 'Types',
    command: 'npm run type-check',
    description: 'Checking TypeScript types',
  },
  {
    name: 'Format',
    command: 'npm run format:check',
    description: 'Checking code formatting',
  },
  {
    name: 'Tests',
    command: 'npm run test:ci',
    description: 'Running tests',
  },
]

function runQuickCheck(check, index) {
  const stepNum = index + 1
  logStep(stepNum, quickChecks.length, check.description)
  
  const result = execCommand(check.command)
  
  if (result.success) {
    logSuccess(`${check.name} passed (${formatDuration(result.duration)})`)
    return { ...check, passed: true, duration: result.duration }
  } else {
    logError(`${check.name} failed (${formatDuration(result.duration)})`)
    return { ...check, passed: false, duration: result.duration, error: result.error }
  }
}

function main() {
  const startTime = Date.now()
  
  log('⚡ Running quick quality checks...', colors.cyan + colors.bright)
  log('')
  
  try {
    const results = quickChecks.map((check, index) => {
      const result = runQuickCheck(check, index)
      log('') // Пустая строка между проверками
      return result
    })
    
    const totalDuration = results.reduce((sum, result) => sum + (result.duration || 0), 0)
    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    
    log('='.repeat(50), colors.cyan)
    log(`📊 Quick Check Results: ${passed}/${results.length} passed`, colors.bright)
    log(`⏱️  Total time: ${formatDuration(totalDuration)}`, colors.blue)
    log('='.repeat(50), colors.cyan)
    
    if (failed === 0) {
      log('🎉 All quick checks passed!', colors.green + colors.bright)
      log('💡 Run "npm run hooks:run pre-push" for full checks', colors.blue)
    } else {
      log(`❌ ${failed} check(s) failed`, colors.red + colors.bright)
      log('🔧 Fix the issues above before committing', colors.yellow)
    }
    
    process.exit(failed === 0 ? 0 : 1)
    
  } catch (error) {
    logError(`Quick checks failed: ${error.message}`)
    process.exit(1)
  }
}

// Запускаем только если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}