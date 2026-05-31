import { useStore } from '@nanostores/react'
import { $blocks, setContent } from '../store/blocks'
import BlockContent from './BlockContent'

interface Props {
  id: string
}

/**
 * A single Block. Reads its own state from the store by id (no prop-drilling)
 * and renders its editable content styled by kind and highlight.
 */
export default function Block({ id }: Props) {
  const blocks = useStore($blocks)
  const block = blocks[id]
  if (!block) return null

  const className = ['Block-content', block.kind, block.highlight].join(' ')

  return (
    <div className="Block-main">
      <div className="Block-wrapper">
        <div className="Block-dot" />
        <BlockContent
          id={block.id}
          content={block.content}
          className={className}
          onInput={(content) => setContent(block.id, content)}
        />
      </div>
    </div>
  )
}
