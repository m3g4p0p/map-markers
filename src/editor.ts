import 'pell/dist/pell.min.css'
import { init } from 'pell'

export function initEditor (target: HTMLTextAreaElement) {
  const editor = init({
    element: document.getElementById('editor'),
    onChange: html => {
      target.value = html
      target.dispatchEvent(new Event('input', { bubbles: true }))
    },
    actions: ['heading1', 'heading2', 'bold', 'italic', 'paragraph', 'olist', 'link', 'image', 'line']
  })

  target.form.addEventListener('reset', () => {
    editor.content.innerHTML = ''
  })

  return {
    get value () {
      return editor.content.innerHTML
    },

    set value (value) {
      target.value = editor.content.innerHTML = value
    }
  }
}
