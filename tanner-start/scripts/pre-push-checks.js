#!/usr/bin/env node

/**
 * Скрипт для выполнения проверок качества кода перед push
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
  magenta: '\x1b[35m',
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

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
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
      duration,
      code: error.status
    }
  }
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

const checks = [
  {
    name: 'Lint Check',
    command: 'npm run lint',
    description: 'Checking code style and potential issues',
    required: true,
  },
  {
    name: 'Format Check',
    command: 'npm run format:check',
    description: 'Checking code formatting',
    required: true,
  },
  {
    name: 'Type Check',
    command: 'npm run type-check',
    description: 'Checking TypeScript types',
    required: true,
  },
  {
    name: 'Unit Tests',
    command: 'npm run test:unit',
    description: 'Running unit tests',
    required: true,
  },
  {
    name: 'Integration Tests',
    command: 'npm run test:integration',
    description: 'Running integration tests',
    required: false,
  },
  {
    name: 'Coverage Check',
    command: 'npm run test:coverage:check',
    description: 'Checking test coverage',
    required: false,
  },
  {
    name: 'Build Check',
    command: 'npm run build',
    description: 'Building for production',
    required: true,
  },
  {
    name: 'Bundle Analysis',
    command: 'npm run build:analyze',
    description: 'Analyzing bundle size',
    required: false,
  },
  {
    name: 'Security Audit',
    command: 'npm audit --audit-level=high',
    description: 'Checking for security vulnerabilities',
    required: false,
  },
  {
    name: 'Duplicate Check',
    command: 'npm run check:duplicates',
    description: 'Checking for code duplication',
    required: false,
  },
]

function checkGitStatus() {
  logStep(0, checks.length, 'Checking Git status')
  
  // Проверяем, есть ли uncommitted changes
  const statusResult = execCommand('git status --porcelain', { silent: true })
  if (statusResult.success && statusResult.output.trim()) {
    logWarning('You have uncommitted changes:')
    console.log(statusResult.output)
    
    const answer = process.env.CI ? 'y' : 'y' // В CI всегда продолжаем
    if (answer.toLowerCase() !== 'y') {
      logError('Aborting push due to uncommitted changes')
      process.exit(1)
    }
  }
  
  // Проверяем текущую ветку
  const branchResult = execCommand('git branch --show-current', { silent: true })
  if (branchResult.success) {
    const branch = branchResult.output.trim()
    log(`Current branch: ${branch}`, colors.blue)
    
    // Предупреждаем о push в main/master
    if (['main', 'master'].includes(branch)) {
      logWarning(`You are pushing to ${branch} branch`)
    }
  }
  
  logSuccess('Git status check completed')
}

function runCheck(check, index) {
  const stepNum = index + 1
  logStep(stepNum, checks.length, check.description)
  
  const startTime = Date.now()
  const result = execCommand(check.command, { startTime })
  
  if (result.success) {
    logSuccess(`${check.name} passed (${formatDuration(result.duration)})`)
    return { ...check, passed: true, duration: result.duration }
  } else {
    const message = `${check.name} failed (${formatDuration(result.duration)})`
    
    if (check.required) {
      logError(message)
      if (result.output) {
        console.log(result.output)
      }
    } else {
      logWarning(`${message} (optional)`)
    }
    
    return { ...check, passed: false, duration: result.duration, error: result.error }
  }
}

function displaySummary(results) {
  const totalDuration = results.reduce((sum, result) => sum + (result.duration || 0), 0)
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const requiredFailed = results.filter(r => !r.passed && r.required).length
  
  log('\n' + '='.repeat(60), colors.cyan)
  log('📊 Pre-push Checks Summary', colors.cyan + colors.bright)
  log('='.repeat(60), colors.cyan)
  
  log(`Total time: ${formatDuration(totalDuration)}`, colors.blue)
  log(`Checks passed: ${passed}/${results.length}`, colors.green)
  
  if (failed > 0) {
    log(`Checks failed: ${failed}/${results.length}`, colors.red)
  }
  
  log('\nDetailed results:', colors.bright)
  results.forEach(result => {
    const icon = result.passed ? '✅' : (result.required ? '❌' : '⚠️')
    const color = result.passed ? colors.green : (result.required ? colors.red : colors.yellow)
    const duration = result.duration ? ` (${formatDuration(result.duration)})` : ''
    const required = result.required ? '' : ' (optional)'
    
    log(`${icon} ${result.name}${duration}${required}`, color)
  })
  
  if (requiredFailed > 0) {
    log('\n❌ Push blocked due to failed required checks', colors.red + colors.bright)
    log('Please fix the issues above and try again.', colors.red)
    return false
  } else if (failed > 0) {
    log('\n⚠️  Some optional checks failed, but push can continue', colors.yellow + colors.bright)
    log('Consider fixing these issues in a follow-up commit.', colors.yellow)
  } else {
    log('\n🎉 All checks passed! Ready to push.', colors.green + colors.bright)
  }
  
  return true
}

function displayTips() {
  log('\n💡 Tips:', colors.bright)
  log('• Use "git push --no-verify" to skip these checks temporarily')
  log('• Use "LEFTHOOK=0 git push" to disable all hooks')
  log('• Run "npm run hooks:check" to verify hook configuration')
  log('• Run individual checks: npm run lint, npm run test, etc.')
}

function main() {
  const startTime = Date.now()
  
  log('🚀 Running pre-push quality checks...', colors.cyan + colors.bright)
  log('')
  
  try {
    // Проверяем Git статус
    checkGitStatus()
    log('')
    
    // Выполняем все проверки
    const results = checks.map((check, index) => {
      const result = runCheck(check, index)
      log('') // Пустая строка между проверками
      return result
    })
    
    // Показываем сводку
    const canPush = displaySummary(results)
    
    // Показываем советы
    displayTips()
    
    const totalTime = Date.now() - startTime
    log(`\nTotal execution time: ${formatDuration(totalTime)}`, colors.blue)
    
    process.exit(canPush ? 0 : 1)
    
  } catch (error) {
    logError(`Pre-push checks failed: ${error.message}`)
    process.exit(1)
  }
}

// Обработка сигналов для graceful shutdown
process.on('SIGINT', () => {
  log('\n⚠️  Pre-push checks interrupted by user', colors.yellow)
  process.exit(1)
})

process.on('SIGTERM', () => {
  log('\n⚠️  Pre-push checks terminated', colors.yellow)
  process.exit(1)
})

// Запускаем только если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}