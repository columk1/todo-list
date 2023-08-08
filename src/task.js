export default class Task {
  constructor(
    title,
    description,
    dueDate = 'No date',
    priority,
    isComplete = false
  ) {
    this.title = title
    this.description = description
    this.dueDate = dueDate
    this.priority = priority
    this.isComplete = isComplete
  }

  setTitle(name) {
    this.name = name
  }

  getTitle() {
    return this.name
  }

  setDescription(description) {
    this.description = description
  }

  getDescription() {
    return this.description
  }

  setDate(dueDate) {
    this.dueDate = dueDate
  }

  getDate() {
    return this.dueDate
  }

  getDateFormatted() {
    const day = this.dueDate.split('/')[0]
    const month = this.dueDate.split('/')[1]
    const year = this.dueDate.split('/')[2]
    return `${month}/${day}/${year}`
  }
}
