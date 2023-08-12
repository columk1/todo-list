import './style.css'
import Task from './task.js'
import Modal from './modal.js'

const initialData = [
  { id: 1, title: 'Buy milk', priority: 'low', isComplete: false },
  { id: 2, title: 'Buy eggs', priority: 'high', isComplete: false },
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
    this.projects = []
    const inbox = new Project('Inbox')
    initialData.forEach((task) => inbox.addTask(task))

    this.projects.push(inbox)

    this.onProjectsChanged = () => {}
  }

  addProject(project) {
    this.projects.push(project)
    this.onProjectsChanged(this.projects)
  }

  bindProjectsChanged(callback) {
    this.onProjectsChanged = callback
  }

  addTask(projectTitle, task) {
    const project = this.projects.find(
      (project) => project.title === projectTitle
    )
    project.addTask(task)
    this.onProjectsChanged(project)
  }

  editTask(projectTitle, taskId, newTitle) {
    const project = this.projects.find(
      (project) => project.title === projectTitle
    )
    project.editTask(taskId, newTitle)
    this.onProjectsChanged(project)
  }

  deleteTask(projectTitle, taskId) {
    const project = this.projects.find(
      (project) => project.title === projectTitle
    )
    project.deleteTask(taskId)
    this.onProjectsChanged(project)
  }

  toggleTask(projectTitle, taskId) {
    const project = this.projects.find(
      (project) => project.title === projectTitle
    )
    project.toggleTask(taskId)
    this.onProjectsChanged(project)
  }
}

class Project {
  constructor(title) {
    this.title = title
    this.tasks = []
  }

  addTask(task) {
    const newTask = new Task(
      task.title,
      task.description,
      task.dueDate,
      task.priority,
      task.isComplete
    )
    newTask.id =
      this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id + 1 : 1
    this.tasks.push(newTask)
  }

  editTask(id, newTitle) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, title: newTitle } : task
    )
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id)
  }

  toggleTask(id) {
    this.tasks = this.tasks.map((task) =>
      task.id === id ? { ...task, isComplete: !task.isComplete } : task
    )
  }
}

class View {
  constructor() {
    this.app = this.getElement('#root')

    this.title = this.createElement('h1')
    this.title.textContent = 'Todo List'

    this.form = this.createElement('form')

    this.input = this.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = 'Add Task'
    this.input.name = 'task'

    this.submitBtn = this.createElement('button')
    this.submitBtn.textContent = 'Submit'

    this.todoList = this.createElement('ul', 'todo-list')

    this.form.append(this.input, this.submitBtn)

    this.app.append(this.title, this.form, this.todoList)

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

  displayProject(project) {
    this.title.textContent = project.title
    this.displayTasks(project.tasks)
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
        handler(this._projectTitle, { title: this._taskTitle })
        this._resetInput()
      }
    })
  }

  bindDeleteTask(handler) {
    this.todoList.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete')) {
        const id = parseInt(e.target.parentElement.id)

        handler(this._projectTitle, id)
      }
    })
  }

  bindToggleTask(handler) {
    this.todoList.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const id = parseInt(e.target.parentElement.id)

        handler(this._projectTitle, id)
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

        handler(this._projectTitle, id, this._temporaryTaskTitle)
        this._temporaryTaskTitle = ''
      }
    })
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

    this.model.bindProjectsChanged(this.onProjectsChanged)

    //Display initial todos
    this.onProjectsChanged(this.model.projects[0])
  }

  onProjectsChanged = (project) => {
    this.view.displayProject(project)
  }

  handleAddTask = (projectTitle, task) => {
    this.model.addTask(projectTitle, task)
  }

  handleEditTask = (projectTitle, id, newTitle) => {
    this.model.editTask(projectTitle, id, newTitle)
  }

  handleDeleteTask = (projectTitle, id) => {
    this.model.deleteTask(projectTitle, id)
  }

  handleToggleTask = (projectTitle, id) => {
    this.model.toggleTask(projectTitle, id)
  }
}

init()

console.log(app)
