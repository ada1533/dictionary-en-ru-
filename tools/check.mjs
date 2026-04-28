import { request } from 'node:http'

function requestJson(path, method = 'GET', payload) {
  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : null
    const req = request(
      {
        hostname: 'localhost',
        port: 8888,
        path,
        method,
        headers: body
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body),
            }
          : undefined,
      },
      (res) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8')
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(text) })
          } catch {
            reject(new Error(`Invalid JSON response: ${text}`))
          }
        })
      }
    )

    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

async function main() {
  const known = await requestJson('/api/word?w=hello')
  if (known.statusCode !== 200 || known.body.definition !== 'привет') {
    throw new Error('Health check failed for known word "hello"')
  }

  const knownByRussian = await requestJson(`/api/word?w=${encodeURIComponent('привет')}`)
  if (knownByRussian.statusCode !== 200 || knownByRussian.body.word !== 'hello') {
    throw new Error('Reverse lookup by Russian definition failed')
  }

  const toCreate = await requestJson('/api/word', 'POST', {
    word: 'check_word',
    definition: 'first definition',
  })
  if (toCreate.statusCode !== 201) {
    throw new Error('Create check failed')
  }

  const toUpdate = await requestJson('/api/word', 'PUT', {
    word: 'check_word',
    definition: 'updated definition',
  })
  if (toUpdate.statusCode !== 200 || toUpdate.body.definition !== 'updated definition') {
    throw new Error('Update check failed')
  }

  const afterUpdate = await requestJson('/api/word?w=check_word')
  if (afterUpdate.statusCode !== 200 || afterUpdate.body.definition !== 'updated definition') {
    throw new Error('Read-after-update check failed')
  }

  const toDelete = await requestJson('/api/word?w=check_word', 'DELETE')
  if (toDelete.statusCode !== 200 || !toDelete.body.success) {
    throw new Error('Delete check failed')
  }

  const unknown = await requestJson('/api/word?w=missing_word')
  if (unknown.statusCode !== 404 || unknown.body.error !== 'Слово не найдено') {
    throw new Error('Health check failed for unknown word')
  }

  console.log('Check passed: CRUD API works as expected.')
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
