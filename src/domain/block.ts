/**
 * Domain model for the block editor.
 *
 * A document is a tree of Blocks. We store the tree as a flat collection
 * (see docs/adr/0001) where each Block names its parent and carries a
 * fractional-index `order` giving its position among its siblings.
 */

export type BlockKind = 'paragraph' | 'heading1' | 'heading2' | 'heading3'

export type Highlight = 'default' | 'yellow' | 'red' | 'green'

export interface Block {
  id: string
  kind: BlockKind
  content: string
  highlight: Highlight
  /** The parent Block's id, or `null` for a top-level Block at the document root. */
  parentId: string | null
  /** Fractional index ordering this Block among its siblings. */
  order: string
}

export const ROOT: null = null

export function createBlock(partial: Partial<Block> & Pick<Block, 'id' | 'order'>): Block {
  return {
    kind: 'paragraph',
    content: '',
    highlight: 'default',
    parentId: ROOT,
    ...partial,
  }
}

/** Blocks whose parent is `parentId`, sorted by their fractional `order`. */
export function childrenOf(blocks: Block[], parentId: string | null): Block[] {
  return blocks
    .filter((b) => b.parentId === parentId)
    .sort((a, b) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0))
}

/** The siblings of `block` (Blocks sharing its parent), sorted by order, including itself. */
export function siblingsOf(blocks: Block[], block: Block): Block[] {
  return childrenOf(blocks, block.parentId)
}

/** Top-level Blocks (at the document root), sorted by order. */
export function rootBlocks(blocks: Block[]): Block[] {
  return childrenOf(blocks, ROOT)
}
