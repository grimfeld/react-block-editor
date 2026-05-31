import { useStore } from '@nanostores/react'
import { childrenOf } from '../domain/block'
import {
  $blocks,
  deleteAndPromote,
  insertSiblingAfter,
  setContent,
} from '../store/blocks'
import { focusBlock } from './focus'
import BlockContent from './BlockContent'

interface Props {
  id: string
}

/**
 * A single Block. Reads its own state from the store by id (no prop-drilling),
 * renders its editable content, and owns the keyboard behaviour for creating
 * and deleting Blocks.
 */
export default function Block({ id }: Props) {
  const blocks = useStore($blocks)
  const block = blocks[id]
  if (!block) return null

  const className = ['Block-content', block.kind, block.highlight].join(' ')

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!block) return
    const text = e.currentTarget.textContent ?? ''
    const isEmpty = text.trim() === ''

    if (e.key === 'Enter' && !e.shiftKey) {
      // Enter on a non-empty Block inserts a sibling after it and focuses it.
      e.preventDefault()
      if (isEmpty) return
      const newId = insertSiblingAfter(block.id)
      if (newId) focusBlock(newId, 'start')
      return
    }

    if (e.key === 'Backspace' && isEmpty) {
      // Backspace on an empty Block deletes it and focuses the previous sibling.
      e.preventDefault()
      const siblings = childrenOf(Object.values($blocks.get()), block.parentId)
      if (siblings.length <= 1) return // keep the last Block in the document
      const index = siblings.findIndex((b) => b.id === block.id)
      const previous = siblings[index - 1] ?? null
      deleteAndPromote(block.id)
      if (previous) focusBlock(previous.id, 'end')
    }
  }

  return (
    <div className="Block-main">
      <div className="Block-wrapper">
        <div className="Block-dot" />
        <BlockContent
          id={block.id}
          content={block.content}
          className={className}
          onInput={(content) => setContent(block.id, content)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}
