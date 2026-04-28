export default class NavbarElement {
  constructor() {
    this.loadCSS('./components/ui/navbar/navbar.css')
    this.element = this.createNavbar()
  }

  loadCSS(href) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }

  createNavbar() {
    const navContainer = document.createElement('nav')
    navContainer.className = 'nav'
    navContainer.setAttribute('aria-label', 'Навигация')

    const brand = document.createElement('div')
    brand.className = 'nav-brand'
    brand.textContent = 'Dictionary'

    const buttonsContainer = document.createElement('div')
    buttonsContainer.className = 'nav-buttons'

    this.homeButton = document.createElement('button')
    this.homeButton.className = 'nav-button'
    this.homeButton.textContent = 'Home'

    this.dictionaryButton = document.createElement('button')
    this.dictionaryButton.className = 'nav-button'
    this.dictionaryButton.textContent = 'Dictionary'

    this.repeatButton = document.createElement('button')
    this.repeatButton.className = 'nav-button'
    this.repeatButton.textContent = 'Repeat'

    buttonsContainer.append(this.homeButton, this.dictionaryButton, this.repeatButton)

    navContainer.append(brand, buttonsContainer)
    return navContainer
  }

  bindNavigation({ onHomeClick, onDictionaryClick, onRepeatClick }) {
    this.homeButton.addEventListener('click', onHomeClick)
    this.dictionaryButton.addEventListener('click', onDictionaryClick)
    this.repeatButton.addEventListener('click', onRepeatClick)
  }

  getElement() {
    return this.element
  }
}
