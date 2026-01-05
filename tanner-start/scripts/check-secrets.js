#!/usr/bin/env node

/**
 * Скрипт для проверки наличия секретов в коде
 * Предотвращает случайный коммит API ключей, паролей и других секретов
 */

const fs = require('fs')
const path = require('path')

// Паттерны для поиска потенциальных секретов
const SECRET_PATTERNS = [
  // API ключи
  {
    name: 'API Key',
    pattern: /(?:api[_-]?key|apikey)[\s]*[=:]\s*['"]\w{20,}['"]/gi,
    severity: 'high'
  },
  {
    name: 'Secret Key',
    pattern: /(?:secret[_-]?key|secretkey)[\s]*[=:]\s*['"]\w{20,}['"]/gi,
    severity: 'high'
  },
  
  // Токены
  {
    name: 'Access Token',
    pattern: /(?:access[_-]?token|accesstoken)[\s]*[=:]\s*['"]\w{20,}['"]/gi,
    severity: 'high'
  },
  {
    name: 'Bearer Token',
    pattern: /bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,
    severity: 'high'
  },
  {
    name: 'JWT Token',
    pattern: /eyJ[a-zA-Z0-9\-._~+/]+=*/gi,
    severity: 'medium'
  },
  
  // Пароли
  {
    name: 'Password',
    pattern: /(?:password|passwd|pwd)[\s]*[=:]\s*['"]\w{8,}['"]/gi,
    severity: 'high'
  },
  
  // База данных
  {
    name: 'Database URL',
    pattern: /(?:database[_-]?url|db[_-]?url)[\s]*[=:]\s*['"]\w+:\/\/\w+:\w+@[\w.-]+:\d+\/\w+['"]/gi,
    severity: 'high'
  },
  {
    name: 'MongoDB URI',
    pattern: /mongodb(?:\+srv)?:\/\/[^\s'"]+/gi,
    severity: 'high'
  },
  {
    name: 'PostgreSQL URI',
    pattern: /postgres(?:ql)?:\/\/[^\s'"]+/gi,
    severity: 'high'
  },
  
  // AWS
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/gi,
    severity: 'high'
  },
  {
    name: 'AWS Secret Key',
    pattern: /(?:aws[_-]?secret[_-]?access[_-]?key|aws[_-]?secret)[\s]*[=:]\s*['"]\w{40}['"]/gi,
    severity: 'high'
  },
  
  // Google
  {
    name: 'Google API Key',
    pattern: /AIza[0-9A-Za-z\-_]{35}/gi,
    severity: 'high'
  },
  
  // GitHub
  {
    name: 'GitHub Token',
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,255}/gi,
    severity: 'high'
  },
  
  // Slack
  {
    name: 'Slack Token',
    pattern: /xox[baprs]-([0-9a-zA-Z]{10,48})/gi,
    severity: 'medium'
  },
  
  // Общие паттерны
  {
    name: 'Private Key',
    pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
    severity: 'high'
  },
  {
    name: 'Certificate',
    pattern: /-----BEGIN\s+CERTIFICATE-----/gi,
    severity: 'medium'
  },
  
  // Подозрительные строки
  {
    name: 'Suspicious String',
    pattern: /(?:secret|key|token|password|passwd|pwd|auth)[\s]*[=:]\s*['"][a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{16,}['"]/gi,
    severity: 'low'
  }
]

// Файлы и директории для исключения
const EXCLUDED_PATHS = [
  'node_modules/',
  '.git/',
  'dist/',
  'build/',
  'coverage/',
  '.next/',
  '.nuxt/',
  'public/',
  'static/',
  'assets/',
  'scripts/check-secrets.js', // Исключаем сам скрипт
]

// Расширения файлов для проверки
const INCLUDED_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx',
  '.json', '.env', '.env.local', '.env.development', '.env.production',
  '.yml', '.yaml', '.toml', '.ini',
  '.md', '.txt', '.config.js', '.config.ts'
]

/**
 * Проверяет, нужно ли исключить файл из проверки
 */
function shouldExcludeFile(filePath) {
  // Проверяем исключенные пути
  if (EXCLUDED_PATHS.some(excluded => filePath.includes(excluded))) {
    return true
  }
  
  // Проверяем расширение файла
  const extension = path.extname(filePath).toLowerCase()
  if (extension && !INCLUDED_EXTENSIONS.includes(extension)) {
    return true
  }
  
  return false
}

/**
 * Проверяет файл на наличие секретов
 */
function checkFileForSecrets(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { valid: true, reason: 'not_found' }
    }

    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      return { valid: true, reason: 'directory' }
    }

    if (shouldExcludeFile(filePath)) {
      return { valid: true, reason: 'excluded' }
    }

    const content = fs.readFileSync(filePath, 'utf8')
    const findings = []

    // Проверяем каждый паттерн
    for (const { name, pattern, severity } of SECRET_PATTERNS) {
      const matches = content.match(pattern)
      if (matches) {
        // Получаем номера строк для каждого совпадения
        const lines = content.split('\n')
        matches.forEach(match => {
          const lineIndex = lines.findIndex(line => line.includes(match))
          findings.push({
            type: name,
            severity,
            match: match.substring(0, 100), // Ограничиваем длину для безопасности
            line: lineIndex + 1,
          })
        })
      }
    }

    return {
      valid: findings.length === 0,
      findings,
    }
  } catch (error) {
    console.error(`Ошибка при проверке файла ${filePath}:`, error.message)
    return { valid: true, reason: 'error' }
  }
}

/**
 * Получает цвет для вывода в зависимости от серьезности
 */
function getSeverityColor(severity) {
  switch (severity) {
    case 'high': return '\x1b[31m' // Красный
    case 'medium': return '\x1b[33m' // Желтый
    case 'low': return '\x1b[36m' // Голубой
    default: return '\x1b[0m' // Сброс
  }
}

/**
 * Основная функция
 */
function main() {
  const files = process.argv.slice(2)
  
  if (files.length === 0) {
    console.log('✅ Нет файлов для проверки на секреты')
    process.exit(0)
  }

  let hasSecrets = false
  const secretFiles = []

  console.log('🔐 Проверка файлов на наличие секретов...')

  for (const file of files) {
    const result = checkFileForSecrets(file)
    
    if (!result.valid && result.findings) {
      hasSecrets = true
      secretFiles.push({
        file,
        findings: result.findings,
      })
    }
  }

  if (hasSecrets) {
    console.log('\n🚨 ОБНАРУЖЕНЫ ПОТЕНЦИАЛЬНЫЕ СЕКРЕТЫ!')
    console.log('━'.repeat(80))
    
    secretFiles.forEach(({ file, findings }) => {
      console.log(`\n📄 ${file}`)
      
      findings.forEach(({ type, severity, match, line }) => {
        const color = getSeverityColor(severity)
        const reset = '\x1b[0m'
        
        console.log(`   ${color}${severity.toUpperCase()}${reset} - ${type} (строка ${line})`)
        console.log(`   Найдено: ${match.replace(/./g, '*')}`) // Маскируем содержимое
      })
    })

    console.log('\n🛡️  Рекомендации по безопасности:')
    console.log('   • Используйте переменные окружения (.env файлы)')
    console.log('   • Добавьте .env файлы в .gitignore')
    console.log('   • Используйте сервисы управления секретами')
    console.log('   • Никогда не коммитьте реальные API ключи и пароли')
    console.log('   • Используйте заглушки для примеров (EXAMPLE_API_KEY)')
    console.log('')
    console.log('🔧 Если это ложное срабатывание:')
    console.log('   • Добавьте комментарий // nosecret рядом с кодом')
    console.log('   • Используйте переменные окружения даже для тестовых данных')
    console.log('')

    console.log('❌ КОММИТ ЗАБЛОКИРОВАН для защиты от утечки секретов')
    process.exit(1)
  }

  console.log(`✅ Секреты не обнаружены в ${files.length} файлах`)
  process.exit(0)
}

// Запускаем только если скрипт вызван напрямую
if (require.main === module) {
  main()
}

module.exports = {
  checkFileForSecrets,
  SECRET_PATTERNS,
  EXCLUDED_PATHS,
  INCLUDED_EXTENSIONS,
}