/**
 * Focus a Block's editable region by id and place the caret.
 * Runs after the next paint so the target node exists in the DOM.
 */
export function focusBlock(id: string, caret: 'start' | 'end' = 'end'): void {
  requestAnimationFrame(() => {
    const el = document.getElementById(id)
    if (!el) return
    el.focus()
    const selection = window.getSelection()
    if (!selection) return
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(caret === 'start')
    selection.removeAllRanges()
    selection.addRange(range)
  })
}
