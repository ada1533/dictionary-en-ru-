import { Database } from './dataBase.mjs'

export class DictionaryService {
  constructor() {
    this.db = new Database()
  }

  async init() {
    await this.db.init()
  }

  async lookup(word) {
    const entry = await this.db.getWord(word.toLowerCase())
    return entry?.definition || null
  }

  async define(word, definition) {
    await this.db.addWord(word.toLowerCase(), definition.trim())
  }
}
