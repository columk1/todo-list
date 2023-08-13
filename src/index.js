import './style.css'
import Task from './task.js'
import Project from './project.js'
import Modal from './modal.js'
import {
  loadSidebar,
  createElement,
  addProject,
  addProjectPopup,
  show,
} from './nav.js'
// import 'material-symbols'

const initialData = [
  {
    id: 1,
    title: 'Buy milk',
    dueDate: new Date(),
    priority: 'low',
    isComplete: false,
  },
  {
    id: 2,
    title: 'Buy eggs',
    dueDate: new Date(),
    priority: 'high',
    isComplete: false,
    project: 'Shopping',
  },
]

function init() {
  const root = document.createElement('div')
  root.setAttribute('id', 'root')

  document.body.appendChild(root)

  window.app = new Controller(new Model(), new View())
}

// Move this.onToDoListChanged to the Model, not the project class.

class Model {
  constructor() {
    this.tasks = []
    this.projects = []
    this.onTasksChanged = () => {}
    this.onProjectsChanged = () => {}

    initialData.forEach((task) => this.addTask(task))
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

    this.onTasksChanged(this.tasks)
  }

  editTask(id, newTitle) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, title: newTitle } : task
    )
    this.onTasksChanged(this.tasks)
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id)
    this.onTasksChanged(this.tasks)
  }

  toggleTask(id) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, isComplete: !task.isComplete } : task
    )
    this.onTasksChanged(this.tasks)
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
          task.dueDate.toDateString() >= new Date().toDateString() &&
          task.dueDate.toDateString() <=
            new Date(
              new Date().setDate(new Date().getDate() + 7)
            ).toDateString()
        ) {
          thisWeekTasks.push(task)
        }
      }
    })
    return thisWeekTasks
  }

  addProject(title) {
    this.projects.push(title)

    this.onProjectsChanged(this.projects)
  }

  deleteProject(index) {
    let projectTitle = this.projects[index]
    this.tasks.forEach((task) => {
      if (task.project === projectTitle) {
        this.deleteTask(task.id)
      }
    })
    this.projects.splice(index, 1)

    this.onProjectsChanged(this.projects)
  }

  getProjectTasks(projectTitle) {
    return this.tasks.filter((task) => task.project === projectTitle)
  }

  // addProject(title) {
  //   const newProject = new Project(title)

  //   newProject.id =
  //     this.projects.length > 0 ? this.projects[this.projects.length - 1].id + 1 : 1
  //   this.projects.push(newProject)
  // }
}

class View {
  constructor() {
    this.app = this.getElement('#root')

    this.header = this.createElement('header')
    this.header.textContent = 'HEADER'

    this.main = this.createElement('main', 'main')

    this.title = this.createElement('h1')
    this.title.textContent = 'Inbox'

    this.form = this.createElement('form')

    this.input = this.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = 'Add Task'
    this.input.name = 'task'

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

  displayProject(project, tasks) {
    // this.title.textContent = project
    this.displayTasks(tasks)
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

        const deleteBtn = this.createElement('button', 'delete')
        deleteBtn.textContent = 'Delete'
        li.append(checkbox, span, deleteBtn)

        this.todoList.append(li)
      })
    }
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
  }

  initProjectPopupHandlers() {
    const cancelBtn = document.querySelector('.cancel-project-popup-btn')
    cancelBtn.addEventListener('click', (e) => {
      console.log(this.addProjectPopup.firstChild)
      this.addProjectPopup.firstChild.value = ''
      // this.addProjectPopup.classList.remove('active')
    })
  }

  bindNewProject(handler) {
    const addForm = this.addProjectPopup.firstChild
    const input = document.getElementById('input-add-project-popup')
    addForm.addEventListener('submit', (e) => {
      console.log('Add clicked')
      e.preventDefault()
      handler(input.value)
      input.value = ''
      this.addProjectPopup.classList.remove('active')
    })
  }

  bindDeleteProject(handler) {
    this.sidebar.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-project-btn')) {
        const id = parseInt(e.target.parentElement.id)
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
      }
    })
  }

  // bindDisplayProject(handler) {
  //   const buttons = document.getElementsByClassName('project-btn')
  // }

  toggleActive(element) {
    const links = document.querySelectorAll('.nav-link')

    links.forEach((link) => {
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
      projectsList.prepend(addProject(project, index))
    })
    projectsList.append(newProjectBtn)
    // projects.some((project) => {
    //   console.log('project.some running')
    //   if (project !== this.project) {
    //     console.log('if statement true')
    //     this.displayInbox()
    //   }
    // })
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
    this.view.initHandlers()
  }

  displayInbox = () => {
    this.view.displayTasks(this.model.tasks)
    this.view.toggleInbox()
  }

  onTasksChanged = (tasks) => {
    if (this.view.project) {
      console.log(this.view.project)
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
    console.log(this.view.project)
    if (!projects.includes(this.view.project)) this.displayInbox()
  }

  handleAddTask = (task) => {
    this.model.addTask(task)
  }

  handleEditTask = (id, newTitle) => {
    this.model.editTask(id, newTitle)
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
    this.model.addProject(title)
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

console.log(app)
