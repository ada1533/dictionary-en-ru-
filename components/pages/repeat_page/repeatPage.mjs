export default class RepeatPage {
  constructor() {
    this.loadCSS('./components/pages/repeat_page/repeatPage.css')
    this.words = []
    this.current = null
    this.hintCount = 0
    this.isReverseMode = false
    this.element = this.createRepeatPage()
    this.loadWords()
  }

  loadCSS(href) {
    if (document.querySelector(`link[data-repeat-page][href="${href}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.dataset.repeatPage = 'true'
    document.head.appendChild(link)
  }

  async loadWords() {
    this.setStatus('Загрузка слов...')
    try {
      const res = await fetch('/api/words')
      const data = await res.json()
      this.words = Array.isArray(data.items) ? data.items : []
      if (!this.words.length) {
        this.setStatus('Словарь пуст. Добавьте слова на странице Dictionary.')
        return
      }
      this.nextRound()
    } catch {
      this.setStatus('Не удалось загрузить слова.')
    }
  }

  nextRound() {
    if (!this.words.length) return
    const item = this.words[Math.floor(Math.random() * this.words.length)]
    const englishToRussian = !this.isReverseMode
    this.current = {
      prompt: englishToRussian ? item.word : item.definition,
      answer: englishToRussian ? item.definition : item.word,
      direction: englishToRussian ? 'Переведите на русский' : 'Переведите на английский',
    }
    this.hintCount = 0
    this.wordNode.textContent = this.current.prompt
    this.subtitleNode.textContent = this.current.direction
    this.inputNode.value = ''
    this.inputNode.focus()
    this.setStatus('')
  }

  setStatus(text) {
    this.statusNode.textContent = text
  }

  normalize(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
  }

  getAcceptedAnswers(rawAnswer) {
    return String(rawAnswer || '')
      .split('/')
      .map((part) => this.normalize(part))
      .filter(Boolean)
  }

  checkAnswer() {
    if (!this.current) return
    const userAnswer = this.normalize(this.inputNode.value)
    const acceptedAnswers = this.getAcceptedAnswers(this.current.answer)

    if (!userAnswer) {
      this.setStatus('Введите перевод.')
      return
    }

    if (acceptedAnswers.includes(userAnswer)) {
      this.setStatus('✅ Верно! Новое слово...')
      setTimeout(() => this.nextRound(), 500)
      return
    }

    this.setStatus('🛑 Неверно. Попробуйте еще или возьмите подсказку.')
  }

  showHint() {
    if (!this.current) return
    const answers = this.getAcceptedAnswers(this.current.answer)
    const hintBase = answers[0] || ''
    this.hintCount = Math.min(this.hintCount + 1, hintBase.length)
    const shown = hintBase.slice(0, this.hintCount)
    const hidden = '_'.repeat(Math.max(0, hintBase.length - this.hintCount))
    this.setStatus(`Подсказка: ${shown}${hidden}`)
  }

  createRepeatPage() {
    const root = document.createElement('section')
    root.className = 'repeat-page backround-color'

    const card = document.createElement('div')
    card.className = 'repeat-card page-card'

    const title = document.createElement('h1')
    title.className = 'page-title'
    title.textContent = 'Повторение слов'

    this.subtitleNode = document.createElement('p')
    this.subtitleNode.className = 'repeat-subtitle'
    this.subtitleNode.textContent = 'Переведите слово'

    this.wordNode = document.createElement('p')
    this.wordNode.className = 'repeat-word'
    this.wordNode.textContent = '...'

    this.inputNode = document.createElement('input')
    this.inputNode.className = 'repeat-input'
    this.inputNode.placeholder = 'Введите перевод'

    const modeControl = document.createElement('label')
    modeControl.className = 'repeat-mode'
    this.reverseCheckbox = document.createElement('input')
    this.reverseCheckbox.type = 'checkbox'
    this.reverseCheckbox.className = 'repeat-mode-checkbox'
    const modeText = document.createElement('span')
    modeText.textContent = 'Reverse (русский -> английский)'
    modeControl.append(this.reverseCheckbox, modeText)

    const controls = document.createElement('div')
    controls.className = 'repeat-controls'

    const checkButton = document.createElement('button')
    checkButton.className = 'repeat-btn primary'
    checkButton.textContent = 'Проверить'

    const hintButton = document.createElement('button')
    hintButton.className = 'repeat-btn'
    hintButton.textContent = 'Подсказка'

    const nextButton = document.createElement('button')
    nextButton.className = 'repeat-btn'
    nextButton.textContent = 'Другое слово'

    this.statusNode = document.createElement('p')
    this.statusNode.className = 'repeat-status'

    checkButton.addEventListener('click', () => this.checkAnswer())
    hintButton.addEventListener('click', () => this.showHint())
    nextButton.addEventListener('click', () => this.nextRound())
    this.inputNode.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') this.checkAnswer()
    })
    this.reverseCheckbox.addEventListener('change', () => {
      this.isReverseMode = this.reverseCheckbox.checked
      this.nextRound()
    })

    controls.append(checkButton, hintButton, nextButton)
    card.append(
      title,
      this.subtitleNode,
      this.wordNode,
      this.inputNode,
      modeControl,
      controls,
      this.statusNode
    )
    root.appendChild(card)
    return root
  }

  getElement() {
    return this.element
  }
}
