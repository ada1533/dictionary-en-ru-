export default class DictionaryPage {
  constructor() {
    this.loadCSS('./components/pages/dictionary_page/dictionaryPage.css')
    this.element = this.createDictionaryPage()
  }

  loadCSS(href) {
    if (document.querySelector(`link[data-dictionary-page][href="${href}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.dataset.dictionaryPage = 'true'
    document.head.appendChild(link)
  }

  createDictionaryPage() {
    const div = document.createElement('div')
    const panel = document.createElement('section')
    const h1 = document.createElement('h1')
    const subtitle = document.createElement('p')
    const inputs = document.createElement('div')
    const wordInput = document.createElement('input')
    const definitionInput = document.createElement('input')
    const controls = document.createElement('div')
    const findButton = document.createElement('button')
    const addButton = document.createElement('button')
    const updateButton = document.createElement('button')
    const deleteButton = document.createElement('button')
    const listButton = document.createElement('button')
    const result = document.createElement('pre')

    div.className = 'dictionary_page backround-color'
    panel.className = 'dictionary-panel page-card'
    h1.className = 'page-title'
    subtitle.className = 'page-subtitle'
    subtitle.textContent = 'Чтобы удалить слово, укажите в первой строке(en).'
    inputs.className = 'dictionary-inputs'

    h1.textContent = 'Словарь'
    wordInput.className = 'dictionary-input'
    wordInput.placeholder = 'Слово (searth/add/delete)'
    wordInput.id = 'dict-word-input'
    definitionInput.className = 'dictionary-input'
    definitionInput.placeholder = 'Определение (add/update)'
    definitionInput.id = 'dict-definition-input'
    controls.className = 'dictionary-controls'
    findButton.className = 'dictionary-button primary'
    addButton.className = 'dictionary-button'
    updateButton.className = 'dictionary-button'
    deleteButton.className = 'dictionary-button danger'
    listButton.className = 'dictionary-button'
    findButton.textContent = 'Найти'
    addButton.textContent = 'Добавить'
    updateButton.textContent = 'Обновить'
    deleteButton.textContent = 'Удалить'
    listButton.textContent = 'Показать все'
    result.id = 'dict-result'
    result.className = 'dictionary-result'
    result.textContent = 'Подсказка: введите слово и выберите действие.'

    const callApi = async (url, options = {}) => {
      try {
        const res = await fetch(url, options)
        const data = await res.json()
        if (res.ok) {
          return data
        }
        throw new Error(data.error || 'Ошибка запроса')
      } catch (err) {
        result.textContent = `🛑 ${err.message || 'Ошибка подключения к серверу'}`
        return null
      }
    }

    findButton.addEventListener('click', async () => {
      const word = wordInput.value.trim()
      if (!word) {
        result.textContent = '🛑 Введите слово'
        return
      }
      const data = await callApi(`/api/word?w=${encodeURIComponent(word)}`)
      if (data) {
        result.textContent = `${data.word}: ${data.definition}`
      }
    })

    addButton.addEventListener('click', async () => {
      const word = wordInput.value.trim()
      const definition = definitionInput.value.trim()
      if (!word || !definition) {
        result.textContent = '🛑 Введите слово и определение'
        return
      }
      const data = await callApi('/api/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, definition }),
      })
      if (data) {
        wordInput.value = ''
        definitionInput.value = ''
        result.textContent = `✅ Добавлено: ${data.word}: ${data.definition}`
      }
    })

    updateButton.addEventListener('click', async () => {
      const word = wordInput.value.trim()
      const definition = definitionInput.value.trim()
      if (!word || !definition) {
        result.textContent = '🛑 Введите слово и определение'
        return
      }
      const data = await callApi('/api/word', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, definition }),
      })
      if (data) {
        wordInput.value = ''
        definitionInput.value = ''
        result.textContent = `✅ Обновлено: ${data.word}: ${data.definition}`
      }
    })

    deleteButton.addEventListener('click', async () => {
      const word = wordInput.value.trim()
      if (!word) {
        result.textContent = '🛑 Введите слово'
        return
      }
      const data = await callApi(`/api/word?w=${encodeURIComponent(word)}`, {
        method: 'DELETE',
      })
      if (data) {
        wordInput.value = ''
        result.textContent = `✅ Удалено: ${data.word}`
      }
    })

    listButton.addEventListener('click', async () => {
      const data = await callApi('/api/words')
      if (!data) return
      if (!data.items.length) {
        result.textContent = 'Словарь пуст'
      } else {
        result.textContent = data.items
          .map((item, index) => `${index + 1}. ${item.word}: ${item.definition}`)
          .join('\n')
      }
    })
    wordInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') findButton.click()
    })
    definitionInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') updateButton.click()
    })

    controls.append(findButton, addButton, updateButton, deleteButton, listButton)
    inputs.append(wordInput, definitionInput)
    panel.append(h1, subtitle, inputs, controls, result)
    div.append(panel)
    return div
  }

  getElement() {
    return this.element
  }
}
