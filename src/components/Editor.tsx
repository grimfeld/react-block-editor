import { useStore } from '@nanostores/react'
import { $blocks } from '../store/blocks'
import { childrenOf } from '../domain/block'
import Block from './Block'

interface Props {
  /** Render the children of this parent; `null` renders the document root. */
  parentId: string | null
}

/**
 * Renders one level of the document: the Blocks under `parentId`, in order.
 */
export default function Editor({ parentId }: Props) {
  const blocks = useStore($blocks)
  const level = childrenOf(Object.values(blocks), parentId)

  return (
    <div className="Editor">
      {level.map((block) => (
        <Block key={block.id} id={block.id} />
      ))}
    </div>
  )
}
