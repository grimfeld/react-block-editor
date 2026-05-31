import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Block } from '../domain/block'
import { loadAll, put, remove } from './db'
import { hydrate, startPersisting } from './sync'
import { $blocks, allBlocks, insertSiblingAfter, setContent } from '../store/blocks'

function block(partial: Partial<Block> & Pick<Block, 'id' | 'order'>): Block {
  return { kind: 'paragraph', content: '', highlight: 'default', parentId: null, ...partial }
}

/** Wipe the IndexedDB store and the in-memory store between tests. */
async function reset() {
  for (const b of await loadAll()) await remove(b.id)
  $blocks.set({})
}

describe('IndexedDB repository', () => {
  beforeEach(reset)

  it('round-trips a Block through put/loadAll', async () => {
    await put(block({ id: 'a', order: 'm', content: 'hi' }))
    const all = await loadAll()
    expect(all).toHaveLength(1)
    expect(all[0]).toMatchObject({ id: 'a', content: 'hi' })
  })

  it('removes a Block', async () => {
    await put(block({ id: 'a', order: 'm' }))
    await remove('a')
    expect(await loadAll()).toHaveLength(0)
  })
})

describe('hydrate + persist', () => {
  let stop: (() => void) | undefined
  beforeEach(reset)
  afterEach(() => stop?.())

  it('seeds a single Paragraph on an empty database', async () => {
    await hydrate()
    expect(allBlocks()).toHaveLength(1)
    expect(allBlocks()[0]).toMatchObject({ kind: 'paragraph', content: '' })
  })

  it('hydrates persisted Blocks instead of seeding', async () => {
    await put(block({ id: 'x', order: 'm', content: 'kept' }))
    await hydrate()
    expect(allBlocks()).toHaveLength(1)
    expect(allBlocks()[0]).toMatchObject({ id: 'x', content: 'kept' })
  })

  it('persists store changes (added and changed Blocks)', async () => {
    await hydrate()
    stop = startPersisting()
    const seeded = allBlocks()[0].id
    setContent(seeded, 'edited')
    const newId = insertSiblingAfter(seeded)!

    // Allow the fire-and-forget writes to settle.
    await new Promise((r) => setTimeout(r, 0))

    const persisted = await loadAll()
    const byId = Object.fromEntries(persisted.map((b) => [b.id, b]))
    expect(byId[seeded].content).toBe('edited')
    expect(byId[newId]).toBeTruthy()
  })

  it('persists removals', async () => {
    await hydrate()
    stop = startPersisting()
    const a = allBlocks()[0].id
    const b = insertSiblingAfter(a)!
    await new Promise((r) => setTimeout(r, 0))

    // Remove `a` by clearing then re-setting without it.
    const rest = allBlocks().filter((x) => x.id !== a)
    $blocks.set(Object.fromEntries(rest.map((x) => [x.id, x])))
    await new Promise((r) => setTimeout(r, 0))

    const ids = (await loadAll()).map((x) => x.id)
    expect(ids).not.toContain(a)
    expect(ids).toContain(b)
  })
})
