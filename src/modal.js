export default class Modal {
  constructor() {
    this.modal = document.createElement('div')
    this.modal.classList.add('modal')
    this.modal.innerText = 'This is the glorious text-content!'
  }
}
