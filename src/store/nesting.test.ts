import { beforeEach, describe, expect, it } from 'vitest'
import { $blocks, allBlocks, indent, outdent } from './blocks'
import { childrenOf, rootBlocks, type Block } from '../domain/block'

function block(partial: Partial<Block> & Pick<Block, 'id' | 'order'>): Block {
  return { kind: 'paragraph', content: '', highlight: 'default', parentId: null, ...partial }
}

function assertNoOrphans() {
  const ids = new Set(allBlocks().map((b) => b.id))
  for (const b of allBlocks()) {
    if (b.parentId !== null) expect(ids.has(b.parentId)).toBe(true)
  }
}

describe('indent', () => {
  beforeEach(() => $blocks.set({}))

  it('makes a Block a child of the sibling above it', () => {
    $blocks.set({ a: block({ id: 'a', order: 'a' }), b: block({ id: 'b', order: 'b' }) })
    indent('b')
    expect($blocks.get()['b'].parentId).toBe('a')
    expect(rootBlocks(allBlocks()).map((x) => x.id)).toEqual(['a'])
    expect(childrenOf(allBlocks(), 'a').map((x) => x.id)).toEqual(['b'])
    assertNoOrphans()
  })

  it('appends to the end of the new parent children', () => {
    $blocks.set({
      a: block({ id: 'a', order: 'a' }),
      x: block({ id: 'x', order: 'a', parentId: 'a' }),
      b: block({ id: 'b', order: 'b' }),
    })
    indent('b')
    expect(childrenOf(allBlocks(), 'a').map((x) => x.id)).toEqual(['x', 'b'])
  })

  it('is a no-op for the first Block in a level', () => {
    $blocks.set({ a: block({ id: 'a', order: 'a' }), b: block({ id: 'b', order: 'b' }) })
    indent('a')
    expect($blocks.get()['a'].parentId).toBe(null)
  })
})

describe('outdent', () => {
  beforeEach(() => $blocks.set({}))

  it('promotes a child to sit after its former parent', () => {
    $blocks.set({
      a: block({ id: 'a', order: 'a' }),
      b: block({ id: 'b', order: 'a', parentId: 'a' }),
      c: block({ id: 'c', order: 'c' }),
    })
    outdent('b')
    expect($blocks.get()['b'].parentId).toBe(null)
    // b sits between a and c
    expect(rootBlocks(allBlocks()).map((x) => x.id)).toEqual(['a', 'b', 'c'])
    assertNoOrphans()
  })

  it('is a no-op for a top-level Block', () => {
    $blocks.set({ a: block({ id: 'a', order: 'a' }) })
    outdent('a')
    expect($blocks.get()['a'].parentId).toBe(null)
  })

  it('indent then outdent restores the parent', () => {
    $blocks.set({ a: block({ id: 'a', order: 'a' }), b: block({ id: 'b', order: 'b' }) })
    indent('b')
    expect($blocks.get()['b'].parentId).toBe('a')
    outdent('b')
    expect($blocks.get()['b'].parentId).toBe(null)
    expect(rootBlocks(allBlocks()).map((x) => x.id)).toEqual(['a', 'b'])
    assertNoOrphans()
  })
})
