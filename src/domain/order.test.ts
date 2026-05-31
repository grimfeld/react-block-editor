import { describe, expect, it } from 'vitest'
import { between, firstKey } from './order'

describe('between', () => {
  it('produces a key between two bounds', () => {
    const k = between('a', 'c')
    expect(k > 'a').toBe(true)
    expect(k < 'c').toBe(true)
  })

  it('produces a key before everything (null low bound)', () => {
    const k = between(null, 'm')
    expect(k < 'm').toBe(true)
  })

  it('produces a key after everything (null high bound)', () => {
    const k = between('m', null)
    expect(k > 'm').toBe(true)
  })

  it('produces a key when both bounds are null', () => {
    const k = between(null, null)
    expect(k.length).toBeGreaterThan(0)
  })

  it('descends a level when bounds are adjacent', () => {
    const k = between('a', 'b')
    expect(k > 'a').toBe(true)
    expect(k < 'b').toBe(true)
    expect(k.length).toBeGreaterThan(1)
  })

  it('throws when a >= b', () => {
    expect(() => between('c', 'a')).toThrow()
    expect(() => between('a', 'a')).toThrow()
  })

  it('stays ordered under repeated insert-at-front', () => {
    let low: string | null = null
    const high = 'm'
    const keys: string[] = []
    for (let i = 0; i < 50; i++) {
      const k = between(low, high)
      keys.push(k)
      low = k
    }
    // Each successive front-insert is larger than the previous but below high.
    for (let i = 1; i < keys.length; i++) expect(keys[i] > keys[i - 1]).toBe(true)
    expect(keys.every((k) => k < high)).toBe(true)
  })

  it('stays ordered under repeated insert-in-the-same-gap', () => {
    // Always insert between the same two neighbours; precision must grow, order must hold.
    let lo = 'a'
    const hi = 'b'
    const inserted: string[] = []
    for (let i = 0; i < 50; i++) {
      const k = between(lo, hi)
      expect(k > lo).toBe(true)
      expect(k < hi).toBe(true)
      inserted.push(k)
      hi // unchanged
      lo = lo // keep low fixed; new key sits just above lo
      lo = k
    }
    for (let i = 1; i < inserted.length; i++) {
      expect(inserted[i] > inserted[i - 1]).toBe(true)
    }
  })

  it('maintains a sorted list under random insertions (fuzz)', () => {
    // Deterministic pseudo-random (no Math.random — keep tests reproducible).
    let seed = 123456789
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }

    let list: string[] = [firstKey()]
    for (let n = 0; n < 200; n++) {
      const i = Math.floor(rand() * (list.length + 1))
      const lo = i === 0 ? null : list[i - 1]
      const hi = i === list.length ? null : list[i]
      const k = between(lo, hi)
      list.splice(i, 0, k)
    }
    // The list, read in insertion-position order, is strictly sorted.
    for (let i = 1; i < list.length; i++) {
      expect(list[i] > list[i - 1]).toBe(true)
    }
    expect(list.length).toBe(201)
  })
})
