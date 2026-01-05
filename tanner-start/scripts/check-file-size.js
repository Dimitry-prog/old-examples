#!/usr/bin/env node

/**
 * Скрипт для проверки размера файлов
 * Предупреждает о слишком больших файлах, которые могут замедлить разработку
 */

const fs = require('fs')
const path = require('path')

// Максимальные размеры файлов в байтах
const MAX_SIZES = {
  '.js': 50 * 1024,    // 50KB для JS файлов
  '.jsx': 50 * 1024,   // 50KB для JSX файлов
  '.ts': 50 * 1024,    // 50KB для TS файлов
  '.tsx': 50 * 1024,   // 50KB для TSX файлов
  '.css': 30 * 1024,   // 30KB для CSS файлов
  '.scss': 30 * 1024,  // 30KB для SCSS файлов
  '.json': 100 * 1024, // 100KB для JSON файлов
}

// Исключения - файлы, которые могут быть большими
const EXCEPTIONS = [
  'package-lock.json',
  'bun.lockb',
  'yarn.lock',
  'routeTree.gen.ts',
  'dist/',
  'build/',
  'coverage/',
  'node_modules/',
  '.git/',
]

/**
 * Проверяет, является ли файл исключением
 */
function isException(filePath) {
  return EXCEPTIONS.some(exception => 
    filePath.includes(exception) || 
    path.basename(filePath) === exception
  )
}

/**
 * Форматирует размер файла для отображения
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Проверяет размер файла
 */
function checkFileSize(filePath) {
  try {
    // Пропускаем исключения
    if (isException(filePath)) {
      return { valid: true, reason: 'exception' }
    }

    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      return { valid: true, reason: 'not_found' }
    }

    const stats = fs.statSync(filePath)
    
    // Пропускаем директории
    if (stats.isDirectory()) {
      return { valid: true, reason: 'directory' }
    }

    const fileSize = stats.size
    const extension = path.extname(filePath).toLowerCase()
    const maxSize = MAX_SIZES[extension]

    // Если нет ограничения для этого типа файла, пропускаем
    if (!maxSize) {
      return { valid: true, reason: 'no_limit' }
    }

    const isValid = fileSize <= maxSize

    return {
      valid: isValid,
      fileSize,
      maxSize,
      formattedSize: formatFileSize(fileSize),
      formattedMaxSize: formatFileSize(maxSize),
      extension,
    }
  } catch (error) {
    console.error(`Ошибка при проверке файла ${filePath}:`, error.message)
    return { valid: true, reason: 'error' }
  }
}

/**
 * Основная функция
 */
function main() {
  const files = process.argv.slice(2)
  
  if (files.length === 0) {
    console.log('✅ Нет файлов для проверки размера')
    process.exit(0)
  }

  let hasLargeFiles = false
  const largeFiles = []

  console.log('🔍 Проверка размера файлов...')

  for (const file of files) {
    const result = checkFileSize(file)
    
    if (!result.valid) {
      hasLargeFiles = true
      largeFiles.push({
        file,
        ...result,
      })
    }
  }

  if (hasLargeFiles) {
    console.log('\n⚠️  Обнаружены большие файлы:')
    console.log('━'.repeat(80))
    
    largeFiles.forEach(({ file, formattedSize, formattedMaxSize, extension }) => {
      console.log(`📄 ${file}`)
      console.log(`   Размер: ${formattedSize} (максимум: ${formattedMaxSize})`)
      console.log(`   Тип: ${extension}`)
      console.log('')
    })

    console.log('💡 Рекомендации:')
    console.log('   • Разделите большие файлы на более мелкие модули')
    console.log('   • Вынесите константы и типы в отдельные файлы')
    console.log('   • Используйте динамические импорты для больших компонентов')
    console.log('   • Рассмотрите возможность code splitting')
    console.log('')

    // Не блокируем коммит, только предупреждаем
    console.log('⚠️  Коммит будет продолжен, но рекомендуется оптимизировать файлы')
    process.exit(0)
  }

  console.log(`✅ Все файлы (${files.length}) имеют приемлемый размер`)
  process.exit(0)
}

// Запускаем только если скрипт вызван напрямую
if (require.main === module) {
  main()
}

module.exports = {
  checkFileSize,
  formatFileSize,
  MAX_SIZES,
  EXCEPTIONS,
}