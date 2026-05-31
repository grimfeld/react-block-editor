import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Block } from '../domain/block'

/**
 * Client-side persistence (see docs/adr/0002): Blocks are stored one record
 * per Block in IndexedDB, keyed by id, so a single Block mutation is a single
 * record write.
 */

interface BlockEditorDB extends DBSchema {
  blocks: {
    key: string
    value: Block
  }
}

const DB_NAME = 'react-block-editor'
const DB_VERSION = 1
const STORE = 'blocks'

let dbPromise: Promise<IDBPDatabase<BlockEditorDB>> | null = null

function getDB(): Promise<IDBPDatabase<BlockEditorDB>> {
  if (!dbPromise) {
    dbPromise = openDB<BlockEditorDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function loadAll(): Promise<Block[]> {
  const db = await getDB()
  return db.getAll(STORE)
}

export async function put(block: Block): Promise<void> {
  const db = await getDB()
  await db.put(STORE, block)
}

export async function remove(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
}
