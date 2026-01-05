#!/usr/bin/env node

/**
 * Интерактивный помощник для создания коммитов в соответствии с Conventional Commits
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { createInterface } from 'readline'

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

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

const commitTypes = [
  { value: 'feat', name: '✨ feat:     Новая функциональность', emoji: '✨' },
  { value: 'fix', name: '🐛 fix:      Исправление бага', emoji: '🐛' },
  { value: 'docs', name: '📚 docs:     Изменения в документации', emoji: '📚' },
  { value: 'style', name: '💎 style:    Форматирование, отсутствующие точки с запятой и т.д.', emoji: '💎' },
  { value: 'refactor', name: '📦 refactor: Рефакторинг кода', emoji: '📦' },
  { value: 'perf', name: '🚀 perf:     Улучшение производительности', emoji: '🚀' },
  { value: 'test', name: '🚨 test:     Добавление или изменение тестов', emoji: '🚨' },
  { value: 'build', name: '🛠️ build:    Изменения в системе сборки или зависимостях', emoji: '🛠️' },
  { value: 'ci', name: '⚙️ ci:       Изменения в CI конфигурации', emoji: '⚙️' },
  { value: 'chore', name: '♻️ chore:    Другие изменения', emoji: '♻️' },
  { value: 'revert', name: '🗑️ revert:   Откат предыдущего коммита', emoji: '🗑️' },
  { value: 'hotfix', name: '🔥 hotfix:   Критические исправления', emoji: '🔥' },
  { value: 'wip', name: '🚧 wip:      Work in progress', emoji: '🚧' },
]

const scopes = [
  'components', 'ui', 'forms', 'layout', 'auth',
  'api', 'hooks', 'utils', 'lib', 'types', 'contexts', 'providers',
  'pages', 'routes', 'router',
  'styles', 'assets', 'icons',
  'config', 'build', 'deps', 'env',
  'tests', 'e2e', 'mocks',
  'docs', 'readme', 'changelog',
  'ci', 'cd', 'scripts',
  'lint', 'format', 'hooks',
  'security', 'perf', 'a11y', 'i18n',
]

function validateCommitMessage(message) {
  try {
    execSync(`echo "${message}" | npx commitlint`, { stdio: 'pipe' })
    return { valid: true }
  } catch (error) {
    return { 
      valid: false, 
      error: error.stdout?.toString() || error.stderr?.toString() || error.message 
    }
  }
}

function showGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' })
    if (!status.trim()) {
      log('❌ Нет изменений для коммита', colors.red)
      return false
    }
    
    log('📋 Изменения для коммита:', colors.cyan + colors.bright)
    const lines = status.trim().split('\n')
    lines.forEach(line => {
      const status = line.substring(0, 2)
      const file = line.substring(3)
      let statusIcon = '📝'
      
      if (status.includes('A')) statusIcon = '➕'
      else if (status.includes('M')) statusIcon = '📝'
      else if (status.includes('D')) statusIcon = '➖'
      else if (status.includes('R')) statusIcon = '🔄'
      else if (status.includes('??')) statusIcon = '❓'
      
      log(`  ${statusIcon} ${file}`, colors.reset)
    })
    log('')
    return true
  } catch (error) {
    log('❌ Ошибка получения статуса Git', colors.red)
    return false
  }
}

async function selectType() {
  log('🎯 Выберите тип коммита:', colors.cyan + colors.bright)
  commitTypes.forEach((type, index) => {
    log(`  ${index + 1}. ${type.name}`, colors.reset)
  })
  log('')
  
  while (true) {
    const answer = await question('Введите номер типа (1-' + commitTypes.length + '): ')
    const index = parseInt(answer) - 1
    
    if (index >= 0 && index < commitTypes.length) {
      return commitTypes[index]
    }
    
    log('❌ Неверный номер. Попробуйте еще раз.', colors.red)
  }
}

async function selectScope() {
  log('🎯 Выберите область изменений (scope):', colors.cyan + colors.bright)
  log('  0. Пропустить (без scope)', colors.yellow)
  
  scopes.forEach((scope, index) => {
    log(`  ${index + 1}. ${scope}`, colors.reset)
  })
  log('')
  
  while (true) {
    const answer = await question(`Введите номер области (0-${scopes.length}) или введите свою: `)
    
    if (answer === '0') {
      return null
    }
    
    const index = parseInt(answer) - 1
    if (index >= 0 && index < scopes.length) {
      return scopes[index]
    }
    
    // Если не число, считаем что пользователь ввел кастомный scope
    if (isNaN(parseInt(answer)) && answer.trim()) {
      return answer.trim().toLowerCase()
    }
    
    log('❌ Неверный ввод. Попробуйте еще раз.', colors.red)
  }
}

async function getSubject() {
  log('📝 Введите краткое описание изменений:', colors.cyan + colors.bright)
  log('   • Используйте повелительное наклонение ("add", а не "added")', colors.yellow)
  log('   • Не ставьте точку в конце', colors.yellow)
  log('   • Максимум 80 символов', colors.yellow)
  log('')
  
  while (true) {
    const subject = await question('Описание: ')
    
    if (!subject.trim()) {
      log('❌ Описание не может быть пустым', colors.red)
      continue
    }
    
    if (subject.length > 80) {
      log('❌ Описание слишком длинное (максимум 80 символов)', colors.red)
      continue
    }
    
    if (subject.endsWith('.')) {
      log('❌ Не ставьте точку в конце описания', colors.red)
      continue
    }
    
    return subject.trim()
  }
}

async function getBody() {
  log('📄 Введите подробное описание (необязательно):', colors.cyan + colors.bright)
  log('   • Объясните что и почему, а не как', colors.yellow)
  log('   • Оставьте пустым, чтобы пропустить', colors.yellow)
  log('')
  
  const body = await question('Подробное описание: ')
  return body.trim() || null
}

async function getBreakingChanges() {
  log('💥 Есть ли критические изменения (breaking changes)?', colors.cyan + colors.bright)
  const hasBreaking = await question('y/N: ')
  
  if (hasBreaking.toLowerCase() === 'y' || hasBreaking.toLowerCase() === 'yes') {
    log('📝 Опишите критические изменения:', colors.yellow)
    const breaking = await question('Breaking changes: ')
    return breaking.trim() || null
  }
  
  return null
}

async function getIssues() {
  log('🔗 Ссылки на issues (необязательно):', colors.cyan + colors.bright)
  log('   • Например: "fixes #123" или "closes #456"', colors.yellow)
  log('   • Оставьте пустым, чтобы пропустить', colors.yellow)
  log('')
  
  const issues = await question('Issues: ')
  return issues.trim() || null
}

function buildCommitMessage(data) {
  let message = data.type.value
  
  if (data.scope) {
    message += `(${data.scope})`
  }
  
  message += `: ${data.subject}`
  
  if (data.body) {
    message += `\n\n${data.body}`
  }
  
  if (data.breaking) {
    message += `\n\nBREAKING CHANGE: ${data.breaking}`
  }
  
  if (data.issues) {
    message += `\n\n${data.issues}`
  }
  
  return message
}

function previewCommit(message) {
  log('\n' + '='.repeat(60), colors.cyan)
  log('📋 Предварительный просмотр коммита:', colors.cyan + colors.bright)
  log('='.repeat(60), colors.cyan)
  log('')
  
  const lines = message.split('\n')
  lines.forEach((line, index) => {
    if (index === 0) {
      // Заголовок
      log(line, colors.green + colors.bright)
    } else if (line.startsWith('BREAKING CHANGE:')) {
      // Breaking changes
      log(line, colors.red + colors.bright)
    } else if (line.match(/^(fixes?|closes?|resolves?)\s+#\d+/i)) {
      // Issue references
      log(line, colors.blue)
    } else {
      // Обычный текст
      log(line, colors.reset)
    }
  })
  
  log('')
  log('='.repeat(60), colors.cyan)
}

async function confirmCommit() {
  const answer = await question('✅ Создать коммит? (Y/n): ')
  return answer.toLowerCase() !== 'n' && answer.toLowerCase() !== 'no'
}

function createCommit(message) {
  try {
    // Экранируем сообщение для безопасности
    const escapedMessage = message.replace(/"/g, '\\"')
    execSync(`git commit -m "${escapedMessage}"`, { stdio: 'inherit' })
    log('\n🎉 Коммит успешно создан!', colors.green + colors.bright)
    return true
  } catch (error) {
    log('\n❌ Ошибка создания коммита:', colors.red)
    log(error.message, colors.red)
    return false
  }
}

async function main() {
  log('🚀 Интерактивный помощник для создания коммитов', colors.cyan + colors.bright)
  log('   Следует стандарту Conventional Commits', colors.cyan)
  log('')
  
  // Проверяем статус Git
  if (!showGitStatus()) {
    process.exit(1)
  }
  
  try {
    // Собираем данные для коммита
    const commitData = {
      type: await selectType(),
      scope: await selectScope(),
      subject: await getSubject(),
      body: await getBody(),
      breaking: await getBreakingChanges(),
      issues: await getIssues(),
    }
    
    // Строим сообщение коммита
    const message = buildCommitMessage(commitData)
    
    // Валидируем сообщение
    const validation = validateCommitMessage(message)
    if (!validation.valid) {
      log('\n❌ Сообщение коммита не прошло валидацию:', colors.red)
      log(validation.error, colors.red)
      process.exit(1)
    }
    
    // Показываем предварительный просмотр
    previewCommit(message)
    
    // Подтверждаем создание коммита
    if (await confirmCommit()) {
      if (createCommit(message)) {
        log('\n💡 Советы:', colors.blue)
        log('• Используйте "git push" для отправки изменений', colors.blue)
        log('• Проверьте статус с помощью "git status"', colors.blue)
        log('• Просмотрите историю с помощью "git log --oneline"', colors.blue)
      }
    } else {
      log('\n❌ Создание коммита отменено', colors.yellow)
    }
    
  } catch (error) {
    log(`\n❌ Ошибка: ${error.message}`, colors.red)
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Обработка сигналов для graceful shutdown
process.on('SIGINT', () => {
  log('\n\n👋 До свидания!', colors.yellow)
  rl.close()
  process.exit(0)
})

// Запускаем только если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}