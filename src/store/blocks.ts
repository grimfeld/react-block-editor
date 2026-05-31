import { map } from 'nanostores'
import { type Block, createBlock } from '../domain/block'
import { createId } from '../domain/id'

/**
 * The document state: every Block keyed by its id. Components read from this
 * store directly (via @nanostores/react) rather than receiving Blocks through
 * props, and mutate it only through the intent-named actions below.
 */
export const $blocks = map<Record<string, Block>>({})

/** All Blocks as an array. */
export function allBlocks(): Block[] {
  return Object.values($blocks.get())
}

/** Replace the entire document (used when hydrating from persistence). */
export function setBlocks(blocks: Block[]): void {
  const next: Record<string, Block> = {}
  for (const block of blocks) next[block.id] = block
  $blocks.set(next)
}

/** Set a Block's text content. */
export function setContent(id: string, content: string): void {
  const block = $blocks.get()[id]
  if (!block) return
  $blocks.setKey(id, { ...block, content })
}

/** Seed an empty document with a single Paragraph if it is empty. */
export function seedIfEmpty(): void {
  if (Object.keys($blocks.get()).length > 0) return
  const block = createBlock({ id: createId(), order: 'a0' })
  $blocks.setKey(block.id, block)
}
