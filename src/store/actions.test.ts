import { beforeEach, describe, expect, it } from 'vitest'
import {
  $blocks,
  allBlocks,
  deleteAndPromote,
  insertSiblingAfter,
  seedIfEmpty,
} from './blocks'
import { childrenOf, rootBlocks, type Block } from '../domain/block'

function block(partial: Partial<Block> & Pick<Block, 'id' | 'order'>): Block {
  return {
    kind: 'paragraph',
    content: '',
    highlight: 'default',
    parentId: null,
    ...partial,
  }
}

/** Every Block's parent is null or an existing Block — the no-orphan invariant. */
function assertNoOrphans() {
  const ids = new Set(allBlocks().map((b) => b.id))
  for (const b of allBlocks()) {
    if (b.parentId !== null) expect(ids.has(b.parentId)).toBe(true)
  }
}

describe('insertSiblingAfter', () => {
  beforeEach(() => $blocks.set({}))

  it('inserts directly after the current Block in order', () => {
    seedIfEmpty()
    const first = allBlocks()[0]
    const newId = insertSiblingAfter(first.id)!
    const order = rootBlocks(allBlocks()).map((b) => b.id)
    expect(order).toEqual([first.id, newId])
  })

  it('inserts between the current Block and its next sibling', () => {
    $blocks.set({})
    const a = block({ id: 'a', order: 'a' })
    const c = block({ id: 'c', order: 'c' })
    $blocks.set({ a, c })
    const mid = insertSiblingAfter('a')!
    const order = rootBlocks(allBlocks()).map((b) => b.id)
    expect(order).toEqual(['a', mid, 'c'])
  })

  it('the inserted Block is an empty paragraph sharing the parent', () => {
    const parent = block({ id: 'p', order: 'a' })
    const child = block({ id: 'c', order: 'a', parentId: 'p' })
    $blocks.set({ p: parent, c: child })
    const newId = insertSiblingAfter('c')!
    expect($blocks.get()[newId]).toMatchObject({ kind: 'paragraph', content: '', parentId: 'p' })
  })
})

describe('deleteAndPromote', () => {
  beforeEach(() => $blocks.set({}))

  it('removes a childless Block', () => {
    const a = block({ id: 'a', order: 'a' })
    const b = block({ id: 'b', order: 'b' })
    $blocks.set({ a, b })
    deleteAndPromote('a')
    expect(rootBlocks(allBlocks()).map((x) => x.id)).toEqual(['b'])
    assertNoOrphans()
  })

  it('promotes children into the deleted parent place, preserving order', () => {
    // root: [A, D];  A has children [B, C]
    $blocks.set({
      A: block({ id: 'A', order: 'a' }),
      B: block({ id: 'B', order: 'a', parentId: 'A' }),
      C: block({ id: 'C', order: 'b', parentId: 'A' }),
      D: block({ id: 'D', order: 'b' }),
    })
    deleteAndPromote('A')
    // B and C are now root-level, sitting where A was, before D, in order.
    expect(rootBlocks(allBlocks()).map((x) => x.id)).toEqual(['B', 'C', 'D'])
    assertNoOrphans()
  })

  it('never orphans grandchildren', () => {
    // A > B > C ; delete A -> B promoted to root, C still child of B
    $blocks.set({
      A: block({ id: 'A', order: 'a' }),
      B: block({ id: 'B', order: 'a', parentId: 'A' }),
      C: block({ id: 'C', order: 'a', parentId: 'B' }),
    })
    deleteAndPromote('A')
    expect($blocks.get()['B'].parentId).toBe(null)
    expect($blocks.get()['C'].parentId).toBe('B')
    expect(childrenOf(allBlocks(), 'B').map((x) => x.id)).toEqual(['C'])
    assertNoOrphans()
  })
})
