import { useEffect, useRef } from 'react'

interface Props {
  id: string
  content: string
  className: string
  onInput(content: string): void
}

/**
 * The editable text region of a Block.
 *
 * The content region is *uncontrolled*: we seed the DOM node's text on mount
 * and never rewrite it on every render (which would fight the caret). Reading
 * happens on input; writing back into the same node is deliberately avoided.
 * Caret/selection hardening lands in a later slice (#7).
 */
export default function BlockContent({ id, content, className, onInput }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el && el.textContent !== content) {
      el.textContent = content
    }
    // Seed once on mount; intentionally not reacting to `content` changes here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={ref}
      id={id}
      data-id={id}
      contentEditable
      suppressContentEditableWarning
      className={className}
      onInput={(e) => onInput(e.currentTarget.textContent ?? '')}
    />
  )
}
