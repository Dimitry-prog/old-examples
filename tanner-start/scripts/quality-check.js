#!/usr/bin/env node

/**
 * Скрипт для комплексной проверки качества кода
 * Выполняется перед push для обеспечения высокого качества кода
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Конфигурация проверок
const QUALITY_CHECKS = {
  // Критические проверки (блокируют push)
  critical: [
    {
      name: 'TypeScript проверка типов',
      command: 'bun run type-check',
      description: 'Проверка корректности типов TypeScript',
    },
    {
      name: 'Линтинг кода',
      command: 'bun run lint',
      description: 'Проверка соблюдения стандартов кода',
    },
    {
      name: 'Сборка проекта',
      command: 'bun run build',
      description: 'Проверка успешности сборки',
    },
  ],
  
  // Важные проверки (предупреждения)
  important: [
    {
      name: 'Тесты',
      command: 'bun run test --run --reporter=verbose',
      description: 'Запуск всех тестов',
    },
    {
      name: 'Покрытие кода',
      command: 'bun run test --coverage --run',
      description: 'Проверка покрытия кода тестами',
    },
  ],
  
  // Дополнительные проверки (информационные)
  optional: [
    {
      name: 'Анализ размера бандла',
      command: 'node scripts/analyze-bundle.js',
      description: 'Анализ размера собранного бандла',
      optional: true,
    },
    {
      name: 'Проверка зависимостей',
      command: 'node scripts/check-dependencies.js',
      description: 'Проверка актуальности зависимостей',
      optional: true,
    },
  ],
}

// Пороговые значения для метрик
const THRESHOLDS = {
  testCoverage: 70, // Минимальное покрытие тестами в %
  buildTime: 60000, // Максимальное время сборки в мс
  bundleSize: 1024 * 1024, // Максимальный размер бандла в байтах (1MB)
}

/**
 * Выполняет команду и возвращает результат
 */
function executeCommand(command, options = {}) {
  try {
    const startTime = Date.now()
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    })
    const duration = Date.now() - startTime
    
    return {
      success: true,
      output,
      duration,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || error.stderr || '',
      duration: 0,
    }
  }
}

/**
 * Форматирует время выполнения
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

/**
 * Получает статус на основе результата
 */
function getStatusIcon(success) {
  return success ? '✅' : '❌'
}

/**
 * Выполняет группу проверок
 */
async function runChecks(checks, groupName, isCritical = false) {
  console.log(`\n📋 ${groupName}`)
  console.log('━'.repeat(50))
  
  const results = []
  let allPassed = true
  
  for (const check of checks) {
    console.log(`\n🔍 ${check.name}`)
    console.log(`   ${check.description}`)
    
    if (check.optional && !fs.existsSync('scripts/' + check.command.split(' ').pop())) {
      console.log('   ⏭️  Пропущено (опциональная проверка)')
      continue
    }
    
    const result = executeCommand(check.command, { silent: false })
    const status = getStatusIcon(result.success)
    const duration = formatDuration(result.duration)
    
    console.log(`   ${status} ${result.success ? 'Пройдено' : 'Не пройдено'} (${duration})`)
    
    if (!result.success) {
      allPassed = false
      if (isCritical) {
        console.log(`   ❌ Критическая ошибка: ${result.error}`)
      }
    }
    
    results.push({
      ...check,
      ...result,
    })
  }
  
  return { results, allPassed }
}

/**
 * Анализирует результаты покрытия тестами
 */
function analyzeCoverage() {
  try {
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json')
    if (!fs.existsSync(coveragePath)) {
      return { coverage: 0, warning: 'Файл покрытия не найден' }
    }
    
    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
    const totalCoverage = coverageData.total
    
    if (totalCoverage && totalCoverage.lines) {
      const coverage = totalCoverage.lines.pct
      return {
        coverage,
        warning: coverage < THRESHOLDS.testCoverage ? 
          `Покрытие ${coverage}% ниже порога ${THRESHOLDS.testCoverage}%` : null
      }
    }
  } catch (error) {
    return { coverage: 0, warning: 'Ошибка чтения данных покрытия' }
  }
  
  return { coverage: 0, warning: 'Данные покрытия недоступны' }
}

/**
 * Генерирует отчет о качестве
 */
function generateQualityReport(criticalResults, importantResults, optionalResults) {
  console.log('\n📊 ОТЧЕТ О КАЧЕСТВЕ КОДА')
  console.log('━'.repeat(80))
  
  // Анализ покрытия
  const { coverage, warning } = analyzeCoverage()
  console.log(`\n📈 Метрики качества:`)
  console.log(`   Покрытие тестами: ${coverage}%`)
  if (warning) {
    console.log(`   ⚠️  ${warning}`)
  }
  
  // Подсчет результатов
  const allResults = [...criticalResults.results, ...importantResults.results, ...optionalResults.results]
  const passed = allResults.filter(r => r.success).length
  const failed = allResults.filter(r => !r.success).length
  const total = allResults.length
  
  console.log(`\n📋 Результаты проверок:`)
  console.log(`   Всего проверок: ${total}`)
  console.log(`   Пройдено: ${passed} ✅`)
  console.log(`   Не пройдено: ${failed} ❌`)
  console.log(`   Успешность: ${Math.round((passed / total) * 100)}%`)
  
  // Время выполнения
  const totalDuration = allResults.reduce((sum, r) => sum + r.duration, 0)
  console.log(`   Общее время: ${formatDuration(totalDuration)}`)
  
  return {
    passed,
    failed,
    total,
    coverage,
    totalDuration,
    criticalPassed: criticalResults.allPassed,
    importantPassed: importantResults.allPassed,
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 ЗАПУСК ПРОВЕРКИ КАЧЕСТВА КОДА')
  console.log('━'.repeat(80))
  console.log('Выполняется комплексная проверка перед push...')
  
  try {
    // Выполняем критические проверки
    const criticalResults = await runChecks(
      QUALITY_CHECKS.critical, 
      'КРИТИЧЕСКИЕ ПРОВЕРКИ', 
      true
    )
    
    // Если критические проверки не прошли, останавливаемся
    if (!criticalResults.allPassed) {
      console.log('\n🚨 КРИТИЧЕСКИЕ ПРОВЕРКИ НЕ ПРОЙДЕНЫ!')
      console.log('Push заблокирован. Исправьте ошибки и попробуйте снова.')
      process.exit(1)
    }
    
    // Выполняем важные проверки
    const importantResults = await runChecks(
      QUALITY_CHECKS.important, 
      'ВАЖНЫЕ ПРОВЕРКИ'
    )
    
    // Выполняем дополнительные проверки
    const optionalResults = await runChecks(
      QUALITY_CHECKS.optional, 
      'ДОПОЛНИТЕЛЬНЫЕ ПРОВЕРКИ'
    )
    
    // Генерируем отчет
    const report = generateQualityReport(criticalResults, importantResults, optionalResults)
    
    // Определяем результат
    if (report.criticalPassed) {
      console.log('\n🎉 ВСЕ КРИТИЧЕСКИЕ ПРОВЕРКИ ПРОЙДЕНЫ!')
      
      if (!report.importantPassed) {
        console.log('⚠️  Некоторые важные проверки не пройдены, но push разрешен.')
        console.log('Рекомендуется исправить предупреждения в ближайшее время.')
      }
      
      console.log('\n✅ Push разрешен')
      process.exit(0)
    } else {
      console.log('\n❌ Push заблокирован из-за критических ошибок')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n💥 Неожиданная ошибка при проверке качества:')
    console.error(error.message)
    console.log('\n❌ Push заблокирован из-за ошибки проверки')
    process.exit(1)
  }
}

// Запускаем только если скрипт вызван напрямую
if (require.main === module) {
  main()
}

module.exports = {
  executeCommand,
  runChecks,
  analyzeCoverage,
  generateQualityReport,
  QUALITY_CHECKS,
  THRESHOLDS,
}