import './style.css'
import Task from './task.js'
import Modal from './modal.js'
import {
  loadSidebar,
  createElement,
  addProject,
  addProjectPopup,
  show,
} from './nav.js'

const initialData = [
  {
    id: 1,
    title: 'Find out what it all means',
    dueDate: new Date(),
    priority: 'low',
    isComplete: false,
  },
  {
    id: 2,
    title: 'Buy socks',
    dueDate: new Date(),
    priority: 'high',
    isComplete: false,
  },
]

function init() {
  const root = document.createElement('div')
  root.setAttribute('id', 'root')

  document.body.appendChild(root)

  window.app = new Controller(new Model(), new View())
}

class Model {
  constructor() {
    // localStorage.clear()
    this.tasks = []
    this.projects = []
    this.onTasksChanged = () => {}
    this.onProjectsChanged = () => {}

    if (localStorage.getItem('tasks')) {
      this.tasks = JSON.parse(localStorage.getItem('tasks')) || []
      this.projects = JSON.parse(localStorage.getItem('projects')) || []
    } else {
      initialData.forEach((task) => this.addTask(task))
    }
  }

  _commitTasks(tasks) {
    this.onTasksChanged(tasks)
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }

  _commitProjects(projects) {
    this.onProjectsChanged(projects)
    localStorage.setItem('projects', JSON.stringify(projects))
  }

  bindTasksChanged(callback) {
    this.onTasksChanged = callback
  }

  bindProjectsChanged(callback) {
    this.onProjectsChanged = callback
  }

  addTask(task) {
    const newTask = new Task(
      task.title,
      task.description,
      task.dueDate,
      task.priority,
      task.isComplete,
      task.project
    )
    newTask.id =
      this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id + 1 : 1
    this.tasks.push(newTask)

    this._commitTasks(this.tasks)
  }

  editTask(id, newTitle) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, title: newTitle } : task
    )
    this._commitTasks(this.tasks)
  }

  editDate(id, newDate) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, dueDate: newDate } : task
    )
    this._commitTasks(this.tasks)
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id)
    this._commitTasks(this.tasks)
  }

  toggleTask(id) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, isComplete: !task.isComplete } : task
    )
    this._commitTasks(this.tasks)
  }

  getToday() {
    const todaysTasks = []
    this.tasks.forEach((task) => {
      if (task.dueDate instanceof Date) {
        if (task.dueDate.toDateString() === new Date().toDateString()) {
          todaysTasks.push(task)
        }
      }
    })
    return todaysTasks
  }

  getThisWeek() {
    const thisWeekTasks = []
    this.tasks.forEach((task) => {
      if (task.dueDate instanceof Date) {
        if (
          Date.parse(task.dueDate.toDateString()) >=
            Date.parse(new Date().toDateString()) &&
          Date.parse(task.dueDate) <=
            Date.parse(new Date(new Date().setDate(new Date().getDate() + 7)))
        ) {
          thisWeekTasks.push(task)
        }
      }
    })
    return thisWeekTasks
  }

  addProject(title) {
    this.projects.push(title)

    this._commitProjects(this.projects)
  }

  deleteProject(index) {
    let projectTitle = this.projects[index]
    this.tasks.forEach((task) => {
      if (task.project === projectTitle) {
        this.deleteTask(task.id)
      }
    })
    this.projects.splice(index, 1)

    this._commitTasks(this.tasks)
    this._commitProjects(this.projects)
  }

  getProjectTasks(projectTitle) {
    return this.tasks.filter((task) => task.project === projectTitle)
  }
}

class View {
  constructor() {
    this.app = this.getElement('#root')

    this.header = this.createElement('header')

    const logo = createElement('div', 'logo')
    logo.textContent = 'Todo List'
    const logoIcon = createElement('i', 'material-symbols-outlined')
    logoIcon.textContent = 'check_box'
    logo.append(logoIcon)

    this.header.appendChild(logo)

    this.openNavBtn = createElement('button', 'open-nav-btn')
    this.openNavIcon = createElement('i', 'material-symbols-outlined')
    this.openNavIcon.textContent = 'menu'
    this.openNavBtn.appendChild(this.openNavIcon)
    this.header.appendChild(this.openNavBtn)

    this.main = this.createElement('main', 'main')

    this.title = this.createElement('h1')
    this.title.textContent = 'Inbox'

    this.form = this.createElement('form')

    this.input = this.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = 'Add Task'
    this.input.name = 'task'
    this.input.required = true

    this.submitBtn = this.createElement('button')
    this.submitBtn.textContent = 'Submit'

    this.todoList = this.createElement('ul', 'todo-list')

    this.sidebar = loadSidebar()

    this.addProjectPopup = addProjectPopup()
    this.sidebar.lastChild.lastChild.append(this.addProjectPopup)

    this.form.append(this.input, this.submitBtn)

    this.main.append(this.title, this.form, this.todoList)

    this.app.append(this.header, this.sidebar, this.main)

    this.temporaryTaskTitle
    this._initLocalListeners()
  }

  createElement(tag, className) {
    const element = document.createElement(tag)
    if (className) element.classList.add(className)

    return element
  }

  getElement(selector) {
    const element = document.querySelector(selector)

    return element
  }

  get _projectTitle() {
    return this.title.textContent
  }

  get _taskTitle() {
    return this.input.value
  }

  _resetInput() {
    this.input.value = ''
  }

  displayTasks(tasks) {
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild)
    }

    if (tasks.length === 0) {
      const p = this.createElement('p')
      p.textContent = 'Nothing to do! Add a task?'
      this.todoList.append(p)
    } else {
      tasks.forEach((task) => {
        const li = this.createElement('li')
        li.id = task.id

        const checkbox = this.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = task.isComplete

        const span = this.createElement('span')
        span.contentEditable = true
        span.classList.add('editable')

        if (task.isComplete) {
          const strike = this.createElement('s')
          strike.textContent = task.title
          span.append(strike)
        } else {
          span.textContent = task.title
        }

        const dateContainer = createElement('div', 'date')
        const dueDate = createElement('p', 'due-date')
        if (task.dueDate instanceof Date) {
          dueDate.textContent = task.dueDate.toLocaleDateString()
        } else {
          dueDate.textContent = 'No date'
        }
        const dateInput = createElement('input', 'input-due-date')
        dateInput.type = 'date'

        dateContainer.append(dueDate, dateInput)

        const deleteBtn = this.createElement('button', 'delete')
        deleteBtn.textContent = 'Delete'
        li.append(checkbox, span, dateContainer, deleteBtn)

        this.todoList.append(li)
      })
    }
    this.initHandlers()
  }

  bindAddTask(handler) {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault()

      if (this._taskTitle) {
        this.project
          ? handler({ title: this._taskTitle, project: this.project })
          : handler({ title: this._taskTitle })
        this._resetInput()
      }
    })
  }

  bindDeleteTask(handler) {
    this.todoList.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete')) {
        const id = parseInt(e.target.parentElement.id)

        handler(id)
      }
    })
  }

  bindToggleTask(handler) {
    this.todoList.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const id = parseInt(e.target.parentElement.id)

        handler(id)
      }
    })
  }

  // Update temporary state
  _initLocalListeners() {
    this.todoList.addEventListener('input', (e) => {
      if (e.target.className === 'editable') {
        this._temporaryTaskTitle = e.target.innerText
      }
    })

    this.openNavBtn.addEventListener('click', (e) => {
      this.sidebar.classList.toggle('active')
    })
  }

  // Send the completed value to the model
  bindEditTask(handler) {
    this.todoList.addEventListener('focusout', (e) => {
      if (this._temporaryTaskTitle) {
        const id = parseInt(e.target.parentElement.id)

        handler(id, this._temporaryTaskTitle)
        this._temporaryTaskTitle = ''
      }
    })
  }

  bindEditDate(handler) {
    this.todoList.addEventListener('change', (e) => {
      if (e.target.type === 'date') {
        const id = parseInt(e.target.parentElement.parentElement.id)
        handler(id, new Date(e.target.value + 'T00:00'))
      }
    })
  }

  bindDisplayInbox(handler) {
    const inbox = document.querySelector('#inbox')
    inbox.addEventListener('click', (e) => {
      handler()
    })
  }

  toggleInbox() {
    this.title.textContent = 'Inbox'
    this.project = null
    this.toggleActive(inbox)
  }

  bindDisplayToday(handler) {
    const today = document.querySelector('#today')
    today.addEventListener('click', (e) => {
      this.title.textContent = 'Today'
      this.project = null
      handler()
      this.toggleActive(today)
    })
  }

  bindDisplayThisWeek(handler) {
    const thisWeek = document.querySelector('#this-week')
    thisWeek.addEventListener('click', (e) => {
      this.title.textContent = 'This Week'
      this.project = null
      handler()
      this.toggleActive(thisWeek)
    })
  }

  initHandlers() {
    const newProjectBtn = document.querySelector('.new-project-btn')
    const input = document.getElementById('input-add-project-popup')
    newProjectBtn.addEventListener('click', (e) => {
      show(this.addProjectPopup)
      this.addProjectPopup.firstChild.focus()

      const cancelBtn = document.querySelector('.cancel-project-popup-btn')
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault()
        input.value = ''
        this.addProjectPopup.classList.remove('active')
      })
    })

    const dueDate = document.querySelectorAll('.due-date')
    dueDate.forEach((element) => {
      element.addEventListener('click', (e) => {
        e.target.classList.add('hidden')
        e.target.nextSibling.classList.add('active')
      })
    })
  }

  initProjectPopupHandlers() {
    const cancelBtn = document.querySelector('.cancel-project-popup-btn')
    cancelBtn.addEventListener('click', (e) => {
      this.addProjectPopup.firstChild.value = ''
      // this.addProjectPopup.classList.remove('active')
    })
  }

  bindNewProject(handler) {
    const addForm = this.addProjectPopup.firstChild
    const input = document.getElementById('input-add-project-popup')
    addForm.addEventListener('submit', (e) => {
      e.preventDefault()
      handler(input.value)
      input.value = ''
      this.addProjectPopup.classList.remove('active')
    })
  }

  bindDeleteProject(handler) {
    this.sidebar.addEventListener('click', (e) => {
      if (e.target.parentElement.classList.contains('delete-project-btn')) {
        const id = parseInt(e.target.parentElement.parentElement.id)
        handler(id)
        e.stopImmediatePropagation()
      }
    })
  }

  bindDisplayProject(handler) {
    this.sidebar.addEventListener('click', (e) => {
      if (e.target.parentElement.classList.contains('project-link')) {
        this.title.textContent = e.target.textContent
        const id = parseInt(e.target.parentElement.id)
        handler(id)
        this.toggleActive(e.target.parentElement)
      }
    })
  }

  toggleActive(element) {
    const links = document.querySelectorAll('.nav-link')

    links.forEach((link) => {
      if (link !== this) {
        link.classList.remove('active-link')
      }
    })

    const projectLinks = document.querySelectorAll('.project-link')
    projectLinks.forEach((link) => {
      if (link !== this) {
        link.classList.remove('active-link')
      }
    })
    element.classList.add('active-link')
  }

  displayProjects(projects) {
    const projectsList = document.querySelector('.project-links')
    const newProjectBtn = projectsList.lastChild
    projectsList.innerHTML = ''
    projects.forEach((project, index) => {
      projectsList.append(addProject(project, index))
    })
    projectsList.append(newProjectBtn)
  }

  updateTitle(title) {
    this.title.textContent = title
  }

  displayModal() {
    const modal = new Modal()
    this.app.append(modal.modal)
  }
}

class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view

    this.view.bindAddTask(this.handleAddTask)
    this.view.bindDeleteTask(this.handleDeleteTask)
    this.view.bindToggleTask(this.handleToggleTask)
    this.view.bindEditTask(this.handleEditTask)
    this.view.bindEditDate(this.handleEditDate)

    this.view.bindNewProject(this.handleNewProject)
    this.view.bindDeleteProject(this.handleDeleteProject)
    this.view.bindDisplayProject(this.handleDisplayProject)

    this.view.bindDisplayInbox(this.displayInbox)
    this.view.bindDisplayToday(this.handleDisplayToday)
    this.view.bindDisplayThisWeek(this.handleDisplayThisWeek)

    this.model.bindTasksChanged(this.onTasksChanged)
    this.model.bindProjectsChanged(this.onProjectsChanged)

    //Display initial todos
    this.displayInbox()
    this.onProjectsChanged(this.model.projects)
    this.view.initHandlers()
  }

  displayInbox = () => {
    this.view.displayTasks(this.model.tasks)
    this.view.toggleInbox()
  }

  onTasksChanged = (tasks) => {
    if (this.view.project) {
      const projectTasks = this.model.getProjectTasks(this.view.project)
      this.view.displayTasks(projectTasks)
    } else {
      const currentPage = this.view.getElement('.active-link').id
      switch (currentPage) {
        case 'inbox':
          this.view.displayTasks(tasks)
          this.view.toggleInbox() // Needs to be refactored
          break
        case 'today':
          this.view.displayTasks(this.model.getToday())
          break
        case 'this-week':
          this.view.displayTasks(this.model.getThisWeek())
          break
        default:
          this.view.displayTasks(tasks)
      }
    }
  }

  onProjectsChanged = (projects) => {
    this.view.displayProjects(projects)
    // this.view.bindDeleteProject(this.handleDeleteProject)
    if (!projects.includes(this.view.project)) this.displayInbox()
  }

  handleAddTask = (task) => {
    this.model.addTask(task)
  }

  handleEditTask = (id, newTitle) => {
    this.model.editTask(id, newTitle)
  }

  handleEditDate = (id, newDate) => {
    this.model.editDate(id, newDate)
  }

  handleDeleteTask = (id) => {
    this.model.deleteTask(id)
  }

  handleToggleTask = (id) => {
    this.model.toggleTask(id)
  }

  handleDisplayToday = () => {
    this.view.displayTasks(this.model.getToday())
  }

  handleDisplayThisWeek = () => {
    this.view.displayTasks(this.model.getThisWeek())
  }

  handleNewProject = (title) => {
    if (this.model.projects.includes(title)) {
      alert(`The project "${title}" already exists`)
    } else {
      this.model.addProject(title)
      this.view.displayTasks([])
      this.view.updateTitle(title)
      this.view.project = title
    }
  }

  handleDeleteProject = (index) => {
    this.model.deleteProject(index)
  }

  handleDisplayProject = (index) => {
    const projectTitle = this.model.projects[index]
    const projectTasks = this.model.getProjectTasks(projectTitle)
    this.view.displayTasks(projectTasks)
    this.view.updateTitle(projectTitle)
    this.view.project = projectTitle
  }
}

init()
