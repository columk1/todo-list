import 'material-symbols'
import Logo from './assets/box.svg'

function createElement(tag, className) {
  const element = document.createElement(tag)
  if (className) element.classList.add(className)

  return element
}

export default function loadSidebar() {
  const sidebar = createElement('div', 'sidebar')

  const logo = createElement('div', 'logo')
  const logoImg = new Image()
  logoImg.src = Logo
  logoImg.height = '40px'
  logo.appendChild(logoImg)
  logo.textContent = 'To Do List App'

  const nav = createElement('nav', 'sidebar-nav')
  const navLinks = document.createElement('ul')
  const inbox = document.createElement('li')
  const inboxLink = document.createElement('a')
  inboxLink.textContent = 'Inbox'
  const inboxIcon = createElement('span', 'material-symbols-outlined')
  inboxIcon.textContent = 'face'
  inbox.append(inboxIcon, inboxLink)

  const today = document.createElement('li')
  const todayLink = document.createElement('a')
  todayLink.textContent = 'Today'
  const todayIcon = createElement('span', 'material-symbols-outlined')
  todayIcon.textContent = 'task'
  today.append(todayIcon, todayLink)

  const thisWeek = document.createElement('li')
  const thisWeekLink = document.createElement('a')
  thisWeekLink.textContent = 'This Week'
  const thisWeekIcon = createElement('span', 'material-symbols-outlined')
  thisWeekIcon.textContent = 'task'
  thisWeek.append(thisWeekIcon, thisWeekLink)

  navLinks.append(inbox, today, thisWeek)
  nav.appendChild(navLinks)

  sidebar.appendChild(nav)

  return sidebar
}
