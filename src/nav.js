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
  const inbox = createElement('li', 'nav-link')
  inbox.classList.add('active-link')
  inbox.setAttribute('id', 'inbox')
  const inboxLink = document.createElement('a')
  const inboxIcon = createElement('i', 'material-symbols-outlined')
  inboxIcon.textContent = 'inbox'
  inboxLink.append(inboxIcon)
  inboxLink.append('Inbox')
  inbox.append(inboxLink)

  const today = createElement('li', 'nav-link')
  today.setAttribute('id', 'today')
  const todayLink = document.createElement('a')
  const todayIcon = createElement('i', 'material-symbols-outlined')
  todayIcon.textContent = 'today'
  todayLink.append(todayIcon)
  todayLink.append('Today')
  today.append(todayLink)

  const thisWeek = createElement('li', 'nav-link')
  thisWeek.setAttribute('id', 'this-week')
  const thisWeekLink = document.createElement('a')
  const thisWeekIcon = createElement('i', 'material-symbols-outlined')
  thisWeekIcon.textContent = 'calendar_month'
  thisWeekLink.append(thisWeekIcon)
  thisWeekLink.append('This Week')
  thisWeek.append(thisWeekLink)

  navLinks.append(inbox, today, thisWeek)
  nav.appendChild(navLinks)

  const projects = createElement('section', 'projects')

  const projectsHeader = createElement('h4')
  projectsHeader.textContent = 'Projects'

  projects.appendChild(projectsHeader)

  const projectLinks = createElement('ul', 'project-links')

  const newProject = createElement('li', 'new-project-btn')
  const projectLink1 = createElement('a')
  const projectIcon = createElement('i', 'material-symbols-outlined')
  projectIcon.textContent = 'create_new_folder'
  projectLink1.append(projectIcon)
  projectLink1.append('Add Project')

  newProject.appendChild(projectLink1)

  projectLinks.append(newProject)

  projects.appendChild(projectLinks)

  nav.appendChild(projects)

  sidebar.appendChild(nav)

  return sidebar
}

function addProject(title, id) {
  const project = createElement('li', 'project-link')
  const link = createElement('a')
  const icon = createElement('i', 'material-symbols-outlined')
  icon.textContent = 'folder'
  link.append(icon)
  link.append(title)

  const deleteBtn = createElement('button', 'delete-project-btn')
  deleteBtn.textContent = 'X'

  project.append(link, deleteBtn)

  project.id = id

  return project
}

export { createElement, loadSidebar, addProject }
