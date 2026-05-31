import { map } from 'nanostores'
import { type Block, childrenOf, createBlock } from '../domain/block'
import { createId } from '../domain/id'
import { between, firstKey } from '../domain/order'

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

/** Clear a Block's content without removing it. */
export function emptyBlock(id: string): void {
  setContent(id, '')
}

/**
 * Insert a new empty Paragraph as the next sibling of `id` (same parent,
 * positioned directly after it in Order). Returns the new Block's id so the
 * caller can move focus to it.
 */
export function insertSiblingAfter(id: string): string | null {
  const current = $blocks.get()[id]
  if (!current) return null

  const siblings = childrenOf(allBlocks(), current.parentId)
  const index = siblings.findIndex((b) => b.id === id)
  const next = siblings[index + 1] ?? null
  const order = between(current.order, next ? next.order : null)

  const block = createBlock({ id: createId(), parentId: current.parentId, order })
  $blocks.setKey(block.id, block)
  return block.id
}

/**
 * Delete a Block and promote its children into its place: each child is
 * reparented to the deleted Block's parent at the deleted Block's Order slot,
 * preserving the no-orphan invariant (see CONTEXT.md).
 */
export function deleteAndPromote(id: string): void {
  const target = $blocks.get()[id]
  if (!target) return

  const children = childrenOf(allBlocks(), id)
  const siblings = childrenOf(allBlocks(), target.parentId)
  const index = siblings.findIndex((b) => b.id === id)
  const next = siblings[index + 1] ?? null

  const all = { ...$blocks.get() }
  delete all[id]

  // Spread the promoted children across the gap the deleted Block leaves
  // (between its previous Order and its next sibling's Order).
  let low: string = target.order
  const high: string | null = next ? next.order : null
  for (const child of children) {
    const order = between(low, high)
    all[child.id] = { ...child, parentId: target.parentId, order }
    low = order
  }

  $blocks.set(all)
}

/** Seed an empty document with a single Paragraph if it is empty. */
export function seedIfEmpty(): void {
  if (Object.keys($blocks.get()).length > 0) return
  const block = createBlock({ id: createId(), order: firstKey() })
  $blocks.setKey(block.id, block)
}
