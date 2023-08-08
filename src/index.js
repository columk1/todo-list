import './style.css'
import Task from './task.js'

const initialData = [
  { id: 1, title: 'Buy milk', priority: 'low', isComplete: false },
  { id: 2, title: 'Buy eggs', priority: 'high', isComplete: false },
]

function init() {
  const root = document.createElement('div')
  root.setAttribute('id', 'root')

  document.body.appendChild(root)
}

class Model {
  constructor() {
    this.tasks = []
    initialData.forEach((task) => this.addTask(task))
  }

  // addtask(title) {
  //   const task = {
  //     id: this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id + 1 : 1,
  //     title: title,
  //     isComplete: false,
  //   }

  //   this.tasks.push(task)
  // }

  addTask(task) {
    const newTask = new Task(
      task.title,
      task.description,
      task.dueDate,
      task.priority
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
  constructor() {}
}

class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
  }
}

window.app = new Controller(new Model(), new View())
console.log(app)

// init()
