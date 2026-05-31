import type { Block } from '../domain/block'
import { $blocks, seedIfEmpty, setBlocks } from '../store/blocks'
import { loadAll, put, remove } from './db'

/**
 * Bridges the nanostores document state to IndexedDB:
 *  - on boot, hydrates the store from persisted Blocks (seeding if empty);
 *  - thereafter, persists each change by diffing against the last snapshot and
 *    writing only the Blocks that were added/changed or removed.
 */

let lastSnapshot: Record<string, Block> = {}

/** Load persisted Blocks into the store, then seed an empty document. */
export async function hydrate(): Promise<void> {
  const persisted = await loadAll()
  setBlocks(persisted)
  seedIfEmpty()
  lastSnapshot = { ...$blocks.get() }
}

/** Begin persisting store changes. Returns an unsubscribe function. */
export function startPersisting(): () => void {
  return $blocks.subscribe((current) => {
    const writes: Promise<void>[] = []

    for (const id of Object.keys(current)) {
      const block = current[id]
      if (block !== lastSnapshot[id]) writes.push(put(block))
    }
    for (const id of Object.keys(lastSnapshot)) {
      if (!(id in current)) writes.push(remove(id))
    }

    lastSnapshot = { ...current }
    // Fire and forget; surface failures without blocking the UI.
    void Promise.all(writes).catch((err) => console.error('persist failed', err))
  })
}
