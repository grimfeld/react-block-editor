# React Block Editor

A block-based outliner in the style of RemNote / Dynalist / Roam Research, built
in React + TypeScript. A document is an ordered, nested tree of blocks; each
block is a single editable line with a kind and a highlight.

**Demo:** https://apps.block-editor.grimfeld.tech/

## Features

- **Block kinds** — paragraph and three heading levels (H1–H3)
- **Highlights** — a closed set of colours (default, yellow, red, green)
- **Nesting** — indent / outdent blocks into an ordered tree, collapse subtrees
- **Keyboard-first editing** — Enter inserts a sibling, Backspace on an empty
  block deletes and promotes its children, Tab / Shift+Tab nest and un-nest
- **Local persistence** — the document is saved to IndexedDB and survives refresh
- **Live JSON view** — the underlying document data is shown alongside the editor

## Keyboard

| Key | Action |
| --- | --- |
| `Enter` | Insert an empty block as the next sibling and focus it |
| `Enter` on an empty nested block | Outdent the block |
| `Backspace` on an empty block | Delete it and promote its children |
| `Tab` | Indent under the previous sibling |
| `Shift`+`Tab` | Outdent to the parent's level |

## Architecture

This project was modernised as a showcase. The domain language and the key
decisions are documented:

- **[CONTEXT.md](./CONTEXT.md)** — the glossary (Block, Block Kind, Nesting,
  Order, Highlight) and the no-orphan invariant.
- **[docs/adr/](./docs/adr/)** — architecture decision records:
  - [0001](./docs/adr/0001-flat-list-with-fractional-index.md) — flat list with
    fractional-index ordering
  - [0002](./docs/adr/0002-indexeddb-for-persistence.md) — IndexedDB, one record
    per block
  - [0003](./docs/adr/0003-tamed-contenteditable-over-editor-framework.md) —
    tamed `contentEditable` rather than an editor framework

In short: the document is stored as a **flat collection of blocks**, each with a
`parentId` and a string **fractional `order`** key, so insert/move/indent is a
single write with no renumbering. State lives in **nanostores** behind
intent-named actions (`insertSiblingAfter`, `deleteAndPromote`, `indent`,
`outdent`, …); components read the store directly. Editing is built on a
deliberately **tamed `contentEditable`** — React owns the block structure, the
text node is uncontrolled, and the caret is never disturbed by re-renders.

```
src/
├── domain/        # Block type, tree helpers, fractional-index ordering
├── store/         # nanostores document state + intent-named actions
├── persistence/   # IndexedDB repository + hydrate / write-on-change sync
└── components/     # Editor, Block, BlockContent, BlockMenu
```

## Development

Built with Vite, React 18 and TypeScript (strict). Tests run on Vitest.

```bash
npm install
npm run dev        # start the dev server
npm test           # run the test suite
npm run typecheck  # type-check without emitting
npm run build      # production build to dist/
```

## Credits

App by [Grimfeld](https://grimfeld.tech).
