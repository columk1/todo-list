import './style.css'
import Task from './task.js'
import Modal from './modal.js'
import loadSidebar from './nav.js'
// import 'material-symbols'

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
    this.tasks = []
    this.onTasksChanged = () => {}

    initialData.forEach((task) => this.addTask(task))
  }

  bindTasksChanged(callback) {
    this.onTasksChanged = callback
  }

  addTask(task) {
    const newTask = new Task(
      task.title,
      task.description,
      task.dueDate || new Date(),
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
    this.projects.forEach((project) =>
      project.tasks.forEach((task) => {
        if (task.dueDate.toDateString() === new Date().toDateString()) {
          todaysTasks.push(task)
        }
      })
    )
    return todaysTasks
  }
}

class View {
  constructor() {
    this.app = this.getElement('#root')

    this.header = this.createElement('header')
    this.header.textContent = 'HEADER'

    this.main = this.createElement('main', 'main')

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

    this.main.append(this.title, this.form, this.todoList)

    this.app.append(this.header, loadSidebar(), this.main)

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

  // displayProject(task) {
  //   this.title.textContent = task.project
  //   this.displayTasks(tasks)
  // }

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
        handler({ title: this._taskTitle })
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

    this.model.bindTasksChanged(this.onTasksChanged)

    //Display initial todos
    this.onTasksChanged(this.model.tasks)
  }

  onTasksChanged = (tasks) => {
    this.view.displayTasks(tasks)
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
}

init()

console.log(app)
