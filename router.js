const fs = require('fs').promises
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const { open } = require('sqlite')

const ROOT_DIR = __dirname

let db

async function initDatabase() {
  if (db) return db

  db = await open({
    filename: path.join(ROOT_DIR, 'dictionary.db'),
    driver: sqlite3.Database,
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      word TEXT PRIMARY KEY,
      definition TEXT NOT NULL
    )
  `)

  const count = await db.get('SELECT COUNT(*) AS cnt FROM words')
  if (count.cnt === 0) {
    await db.run('INSERT INTO words (word, definition) VALUES (?, ?)', 'hello', 'привет')
    await db.run('INSERT INTO words (word, definition) VALUES (?, ?)', 'world', 'мир')
    await db.run('INSERT INTO words (word, definition) VALUES (?, ?)', 'cat', 'кошка')
    console.log('✅ Добавлены примеры слов в dictionary.db')
  }

  return db
}

initDatabase().catch((err) => {
  console.error('❌ Не удалось инициализировать базу данных:', err)
})

function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html'
  if (filePath.endsWith('.js')) return 'application/javascript'
  if (filePath.endsWith('.mjs')) return 'application/javascript'
  if (filePath.endsWith('.css')) return 'text/css'
  if (filePath.endsWith('.json')) return 'application/json'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  return 'text/plain'
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

function normalizeWord(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function normalizeDefinition(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({})
        return
      }
      const raw = Buffer.concat(chunks).toString('utf8')
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('INVALID_JSON'))
      }
    })
    req.on('error', reject)
  })
}

const handlers = {
  'GET /api/words': async (req, res) => {
    try {
      const db = await initDatabase()
      const rows = await db.all('SELECT word, definition FROM words ORDER BY word ASC')
      return sendJson(res, 200, { items: rows })
    } catch (err) {
      console.error('Ошибка при получении списка слов:', err)
      return sendJson(res, 500, { error: 'Ошибка базы данных' })
    }
  },

  'GET /api/word': async (req, res) => {
    const { url } = req
    const wordParam = new URL(url, 'http://dummy').searchParams.get('w')

    if (!wordParam) {
      return sendJson(res, 400, { error: 'Параметр ?w= обязателен' })
    }

    try {
      const query = wordParam.trim()
      const word = normalizeWord(wordParam)
      const db = await initDatabase()
      const row = await db.get(
        `
          SELECT word, definition
          FROM words
          WHERE word = ?
             OR definition = ?
             OR definition LIKE ?
          ORDER BY
            CASE
              WHEN word = ? THEN 0
              WHEN definition = ? THEN 1
              ELSE 2
            END,
            word ASC
          LIMIT 1
        `,
        word,
        query,
        `%${query}%`,
        word,
        query
      )

      if (row) {
        return sendJson(res, 200, { word: row.word, definition: row.definition })
      } else {
        return sendJson(res, 404, { error: 'Слово не найдено' })
      }
    } catch (err) {
      console.error('Ошибка при поиске слова:', err)
      return sendJson(res, 500, { error: 'Ошибка базы данных' })
    }
  },

  'POST /api/word': async (req, res) => {
    try {
      const body = await readJsonBody(req)
      const word = normalizeWord(body.word)
      const definition = normalizeDefinition(body.definition)

      if (!word || !definition) {
        return sendJson(res, 400, { error: 'Нужны поля word и definition' })
      }

      const db = await initDatabase()
      const existing = await db.get('SELECT word FROM words WHERE word = ?', word)
      if (existing) {
        return sendJson(res, 409, { error: 'Слово уже существует' })
      }

      await db.run('INSERT INTO words (word, definition) VALUES (?, ?)', word, definition)
      return sendJson(res, 201, { word, definition })
    } catch (err) {
      if (err.message === 'INVALID_JSON') {
        return sendJson(res, 400, { error: 'Некорректный JSON' })
      }
      console.error('Ошибка при добавлении слова:', err)
      return sendJson(res, 500, { error: 'Ошибка базы данных' })
    }
  },

  'PUT /api/word': async (req, res) => {
    try {
      const body = await readJsonBody(req)
      const word = normalizeWord(body.word)
      const definition = normalizeDefinition(body.definition)

      if (!word || !definition) {
        return sendJson(res, 400, { error: 'Нужны поля word и definition' })
      }

      const db = await initDatabase()
      const result = await db.run(
        'UPDATE words SET definition = ? WHERE word = ?',
        definition,
        word
      )
      if (!result.changes) {
        return sendJson(res, 404, { error: 'Слово не найдено' })
      }

      return sendJson(res, 200, { word, definition })
    } catch (err) {
      if (err.message === 'INVALID_JSON') {
        return sendJson(res, 400, { error: 'Некорректный JSON' })
      }
      console.error('Ошибка при обновлении слова:', err)
      return sendJson(res, 500, { error: 'Ошибка базы данных' })
    }
  },

  'DELETE /api/word': async (req, res) => {
    try {
      const { url } = req
      const wordParam = new URL(url, 'http://dummy').searchParams.get('w')
      const word = normalizeWord(wordParam)

      if (!word) {
        return sendJson(res, 400, { error: 'Параметр ?w= обязателен' })
      }

      const db = await initDatabase()
      const result = await db.run('DELETE FROM words WHERE word = ?', word)
      if (!result.changes) {
        return sendJson(res, 404, { error: 'Слово не найдено' })
      }

      return sendJson(res, 200, { success: true, word })
    } catch (err) {
      console.error('Ошибка при удалении слова:', err)
      return sendJson(res, 500, { error: 'Ошибка базы данных' })
    }
  },

  notFound: async (req, res) => {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('404 — Файл не найден')
  },
}

async function route(req, res) {
  const { method, url } = req
  const pathname = url.split('?')[0]

  const routeKey = `${method} ${pathname}`
  if (handlers[routeKey]) {
    try {
      return await handlers[routeKey](req, res)
    } catch (err) {
      return handleError(res, err)
    }
  }

  try {
    if (url.includes('..') || url.includes('~') || url.startsWith('/.')) {
      throw new Error('Запрещённый путь')
    }

    const normalizedPath = pathname === '/' ? '/index.html' : pathname
    const relativePath = normalizedPath.replace(/^\/+/, '')
    const filePath = path.join(ROOT_DIR, relativePath)
    const stats = await fs.stat(filePath)

    if (stats.isFile()) {
      const content = await fs.readFile(filePath)
      const contentType = getContentType(filePath)
      res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` })
      res.end(content)
      return
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Ошибка при чтении файла:', err)
    }
  }

  handlers.notFound(req, res)
}

function handleError(res, err) {
  console.error('Ошибка:', err)
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
  }
  res.end('Внутренняя ошибка сервера')
}

module.exports = route
