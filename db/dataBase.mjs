import { open } from 'sqlite'
import sqlite3 from 'sqlite3'

export class Database {
  constructor(dbPath = './dictionary.db') {
    this.dbPath = dbPath
    this.db = null
  }

  async init() {
    this.db = await open({ filename: this.dbPath, driver: sqlite3.Database })
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS words (
        word TEXT PRIMARY KEY,
        definition TEXT NOT NULL
      )
    `)
  }

  async getWord(word) {
    return await this.db.get('SELECT definition FROM words WHERE word = ?', word)
  }

  async addWord(word, definition) {
    await this.db.run(
      'INSERT OR REPLACE INTO words (word, definition) VALUES (?, ?)',
      word,
      definition
    )
  }
}
