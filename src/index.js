import './style.css'
import Task from './task.js'
import Modal from './modal.js'

const initialData = [
  { id: 1, title: 'Buy milk', priority: 'low', isComplete: true },
  { id: 2, title: 'Buy eggs', priority: 'high', isComplete: true },
]

function init() {
  const root = document.createElement('div')
  root.setAttribute('id', 'root')

  document.body.appendChild(root)

  window.app = new Controller(new Model(), new View())
}

class Model {
  constructor() {
    this.tasks = []
    initialData.forEach((task) => this.addTask(task))
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

  get _taskText() {
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

        const deleteBtn = this.createElement('button', 'delete')
        deleteBtn.textContent = 'Delete'
        li.append(checkbox, span, deleteBtn)

        this.todoList.append(li)
      })
    }
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
  }
}

init()

console.log(app)
