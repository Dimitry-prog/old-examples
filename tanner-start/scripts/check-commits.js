#!/usr/bin/env node

/**
 * Скрипт для проверки истории коммитов на соответствие Conventional Commits
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

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    })
    return { success: true, output: result.trim() }
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      output: error.stdout || error.stderr || '',
      code: error.status
    }
  }
}

function getCommitRange() {
  const args = process.argv.slice(2)
  
  if (args.length >= 2) {
    return `${args[0]}..${args[1]}`
  } else if (args.length === 1) {
    return `HEAD~${args[0]}..HEAD`
  } else {
    return 'HEAD~10..HEAD' // По умолчанию последние 10 коммитов
  }
}

function getCommits(range) {
  const result = execCommand(`git log ${range} --pretty=format:"%H|%s|%an|%ad" --date=short`, { silent: true })
  
  if (!result.success) {
    log('❌ Ошибка получения истории коммитов', colors.red)
    return []
  }
  
  if (!result.output) {
    log('ℹ️ Нет коммитов в указанном диапазоне', colors.blue)
    return []
  }
  
  return result.output.split('\n').map(line => {
    const [hash, subject, author, date] = line.split('|')
    return { hash, subject, author, date }
  })
}

function validateCommit(commit) {
  // Пропускаем merge коммиты и другие системные коммиты
  if (commit.subject.startsWith('Merge ') || 
      commit.subject.startsWith('Revert ') ||
      commit.subject === 'Initial commit' ||
      commit.subject.includes('dependabot') ||
      commit.subject.includes('renovate')) {
    return { valid: true, skipped: true, reason: 'System commit' }
  }
  
  const result = execCommand(`echo "${commit.subject}" | npx commitlint`, { silent: true })
  
  return {
    valid: result.success,
    skipped: false,
    error: result.success ? null : result.output,
  }
}

function analyzeCommitTypes(commits) {
  const types = {}
  const validCommits = commits.filter(c => !validateCommit(c).skipped)
  
  validCommits.forEach(commit => {
    const match = commit.subject.match(/^(\w+)(\(.+\))?:/)
    if (match) {
      const type = match[1]
      types[type] = (types[type] || 0) + 1
    } else {
      types['invalid'] = (types['invalid'] || 0) + 1
    }
  })
  
  return types
}

function displayCommitAnalysis(commits) {
  const types = analyzeCommitTypes(commits)
  const validCommits = commits.filter(c => !validateCommit(c).skipped)
  
  log('\n📊 Анализ типов коммитов:', colors.cyan + colors.bright)
  log('='.repeat(40), colors.cyan)
  
  Object.entries(types)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      const percentage = ((count / validCommits.length) * 100).toFixed(1)
      const emoji = getTypeEmoji(type)
      log(`${emoji} ${type.padEnd(12)} ${count.toString().padStart(3)} (${percentage}%)`, colors.reset)
    })
  
  log('')
}

function getTypeEmoji(type) {
  const emojis = {
    feat: '✨',
    fix: '🐛',
    docs: '📚',
    style: '💎',
    refactor: '📦',
    perf: '🚀',
    test: '🚨',
    build: '🛠️',
    ci: '⚙️',
    chore: '♻️',
    revert: '🗑️',
    hotfix: '🔥',
    wip: '🚧',
    invalid: '❌',
  }
  return emojis[type] || '📝'
}

function displayResults(commits, results) {
  const valid = results.filter(r => r.valid).length
  const invalid = results.filter(r => !r.valid && !r.skipped).length
  const skipped = results.filter(r => r.skipped).length
  
  log('\n' + '='.repeat(60), colors.cyan)
  log('📋 Результаты проверки коммитов', colors.cyan + colors.bright)
  log('='.repeat(60), colors.cyan)
  
  log(`Всего коммитов: ${commits.length}`, colors.blue)
  log(`✅ Валидных: ${valid}`, colors.green)
  log(`❌ Невалидных: ${invalid}`, colors.red)
  log(`⏭️ Пропущено: ${skipped}`, colors.yellow)
  
  if (invalid > 0) {
    log('\n❌ Невалидные коммиты:', colors.red + colors.bright)
    commits.forEach((commit, index) => {
      const result = results[index]
      if (!result.valid && !result.skipped) {
        log(`\n🔸 ${commit.hash.substring(0, 8)} - ${commit.author} (${commit.date})`, colors.yellow)
        log(`   ${commit.subject}`, colors.reset)
        if (result.error) {
          log(`   ${result.error}`, colors.red)
        }
      }
    })
  }
  
  // Анализ типов коммитов
  displayCommitAnalysis(commits)
  
  // Рекомендации
  if (invalid > 0) {
    log('\n💡 Рекомендации:', colors.blue + colors.bright)
    log('• Используйте "npm run commit" для создания правильных коммитов', colors.blue)
    log('• Изучите Conventional Commits: https://conventionalcommits.org/', colors.blue)
    log('• Настройте commitlint в вашем редакторе', colors.blue)
    log('• Используйте "git commit --amend" для исправления последнего коммита', colors.blue)
  } else if (valid > 0) {
    log('\n🎉 Отличная работа! Все коммиты соответствуют стандарту.', colors.green + colors.bright)
  }
}

function displayUsage() {
  log('📖 Использование:', colors.cyan + colors.bright)
  log('  npm run commit:check                    # Последние 10 коммитов')
  log('  npm run commit:check 5                  # Последние 5 коммитов')
  log('  npm run commit:check HEAD~5 HEAD        # Диапазон коммитов')
  log('  npm run commit:check main..feature      # Между ветками')
  log('')
}

function main() {
  log('🔍 Проверка истории коммитов на соответствие Conventional Commits', colors.cyan + colors.bright)
  log('')
  
  const range = getCommitRange()
  log(`📅 Проверяем диапазон: ${range}`, colors.blue)
  log('')
  
  const commits = getCommits(range)
  
  if (commits.length === 0) {
    displayUsage()
    return
  }
  
  log(`🔍 Проверяем ${commits.length} коммитов...`, colors.blue)
  
  const results = commits.map(commit => validateCommit(commit))
  
  displayResults(commits, results)
  
  const invalid = results.filter(r => !r.valid && !r.skipped).length
  process.exit(invalid > 0 ? 1 : 0)
}

// Запускаем только если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}