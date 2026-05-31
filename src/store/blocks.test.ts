import { beforeEach, describe, expect, it } from 'vitest'
import { $blocks, allBlocks, seedIfEmpty, setBlocks, setContent } from './blocks'

describe('blocks store', () => {
  beforeEach(() => $blocks.set({}))

  it('seeds a single empty paragraph when empty', () => {
    seedIfEmpty()
    const blocks = allBlocks()
    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({ kind: 'paragraph', content: '', parentId: null })
  })

  it('does not re-seed a non-empty document', () => {
    seedIfEmpty()
    const id = allBlocks()[0].id
    seedIfEmpty()
    expect(allBlocks()).toHaveLength(1)
    expect(allBlocks()[0].id).toBe(id)
  })

  it('updates content by id', () => {
    setBlocks([
      { id: 'a', kind: 'paragraph', content: '', highlight: 'default', parentId: null, order: 'a0' },
    ])
    setContent('a', 'hello')
    expect($blocks.get()['a'].content).toBe('hello')
  })

  it('ignores content updates for unknown ids', () => {
    setContent('missing', 'x')
    expect(allBlocks()).toHaveLength(0)
  })
})
