import DictionaryPage from './components/pages/dictionary_page/dictionaryPage.mjs'
import HomePage from './components/pages/home_page/homePage.mjs'
import RepeatPage from './components/pages/repeat_page/repeatPage.mjs'
import NavbarElement from './components/ui/navbar/navbar.mjs'

let contentContainer

function show(pageFactory) {
  contentContainer.innerHTML = ''
  contentContainer.appendChild(pageFactory())
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')
  app.innerHTML = ''

  const nav = new NavbarElement()
  contentContainer = document.createElement('div')
  contentContainer.id = 'page-content'

  app.appendChild(nav.getElement())
  app.appendChild(contentContainer)

  const pages = {
    home: () => new HomePage().getElement(),
    dictionary: () => new DictionaryPage().getElement(),
    repeat: () => new RepeatPage().getElement(),
  }
  nav.bindNavigation({
    onHomeClick: () => show(pages.home),
    onDictionaryClick: () => show(pages.dictionary),
    onRepeatClick: () => show(pages.repeat),
  })

  show(pages.home)
})
