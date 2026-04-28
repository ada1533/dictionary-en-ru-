export default class HomePage {
  constructor() {
    this.element = this.createHomePage()
  }

  createHomePage() {
    const div = document.createElement('div')
    const card = document.createElement('section')
    const h1 = document.createElement('h1')
    const subtitle = document.createElement('p')
    const actions = document.createElement('div')
    const hint1 = document.createElement('p')
    const hint2 = document.createElement('p')

    div.className = 'home_page_cont backround-color'
    card.className = 'page-card'
    h1.className = 'page-title'
    subtitle.className = 'page-subtitle'
    actions.className = 'home_page_actions'
    hint1.className = 'home_page_hint'
    hint2.className = 'home_page_hint'

    h1.textContent = 'Добро пожаловать в словарь'
    subtitle.textContent =
      'Ищите слова, создавайте новые записи и редактируйте определения в одном месте.'
    hint1.textContent = '• Перейдите в раздел Dictionary для работы.'
    hint2.textContent = '• Используйте "Показать все", чтобы увидеть весь словарь.'

    actions.append(hint1, hint2)
    card.append(h1, subtitle, actions)
    div.appendChild(card)
    return div
  }

  getElement() {
    return this.element
  }
}
