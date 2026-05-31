import { useEffect, useRef } from 'react'

interface Props {
  id: string
  content: string
  className: string
  onInput(content: string): void
  onKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void
}

/**
 * The editable text region of a Block (see docs/adr/0003).
 *
 * The content node is *uncontrolled*: React owns the block structure, not the
 * text. We never rewrite the DOM on every render (which fought the caret in the
 * legacy editor). Instead:
 *
 *  - on mount, seed the node's text once;
 *  - reflect an *external* content change (undo, hydration, programmatic edit)
 *    only when the node is not focused — never while the user is typing;
 *  - on input, report the new text upward but do not write it back into the
 *    same node, so the caret never moves.
 */
export default function BlockContent({ id, content, className, onInput, onKeyDown }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Seed once on mount.
  useEffect(() => {
    const el = ref.current
    if (el && el.textContent !== content) el.textContent = content
    // Intentionally mount-only; external syncing is handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reflect external content changes without disturbing an active caret.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const isFocused = document.activeElement === el
    if (!isFocused && el.textContent !== content) {
      el.textContent = content
    }
  }, [content])

  return (
    <div
      ref={ref}
      id={id}
      data-id={id}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="false"
      className={className}
      onInput={(e) => onInput(e.currentTarget.textContent ?? '')}
      onKeyDown={onKeyDown}
    />
  )
}
