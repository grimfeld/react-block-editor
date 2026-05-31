import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { childrenOf } from '../domain/block'
import {
  $blocks,
  deleteAndPromote,
  indent,
  insertSiblingAfter,
  outdent,
  setContent,
  setHighlight,
  setKind,
} from '../store/blocks'
import { focusBlock } from './focus'
import BlockContent from './BlockContent'
import BlockMenu from './BlockMenu'
import Editor from './Editor'

interface Props {
  id: string
}

/**
 * A single Block. Reads its own state from the store by id (no prop-drilling),
 * renders its editable content and any nested children, exposes a menu for
 * kind/highlight, and owns the keyboard behaviour for creating, deleting,
 * indenting and outdenting Blocks.
 */
export default function Block({ id }: Props) {
  const blocks = useStore($blocks)
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const block = blocks[id]
  if (!block) return null

  const children = childrenOf(Object.values(blocks), id)
  const hasChildren = children.length > 0
  const className = ['Block-content', block.kind, block.highlight].join(' ')

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!block) return
    const text = e.currentTarget.textContent ?? ''
    const isEmpty = text.trim() === ''

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isEmpty) {
        // Enter on an empty nested Block outdents it instead of inserting.
        if (block.parentId !== null) {
          outdent(block.id)
          focusBlock(block.id, 'end')
        }
        return
      }
      const newId = insertSiblingAfter(block.id)
      if (newId) focusBlock(newId, 'start')
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      if (e.shiftKey) outdent(block.id)
      else indent(block.id)
      focusBlock(block.id, 'end')
      return
    }

    if (e.key === 'Backspace' && isEmpty) {
      e.preventDefault()
      const siblings = childrenOf(Object.values($blocks.get()), block.parentId)
      if (siblings.length <= 1 && block.parentId === null) return // keep last root Block
      const index = siblings.findIndex((b) => b.id === block.id)
      const previous = siblings[index - 1] ?? null
      deleteAndPromote(block.id)
      if (previous) focusBlock(previous.id, 'end')
    }
  }

  return (
    <div className="Block-main">
      <div className="Block-wrapper">
        <button
          type="button"
          className="bx bx-dots-horizontal-rounded Block-menu-trigger"
          aria-label="Open block menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        />
        {hasChildren && (
          <button
            type="button"
            className={['bx Block-nest-trigger', collapsed ? 'bx-caret-right' : 'bx-caret-down'].join(' ')}
            aria-label={collapsed ? 'Expand block' : 'Collapse block'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          />
        )}
        {menuOpen && (
          <BlockMenu
            onKind={(kind) => {
              setKind(block.id, kind)
              setMenuOpen(false)
            }}
            onHighlight={(highlight) => {
              setHighlight(block.id, highlight)
              setMenuOpen(false)
            }}
          />
        )}
        <div className="Block-dot" />
        <BlockContent
          id={block.id}
          content={block.content}
          className={className}
          onInput={(content) => setContent(block.id, content)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {hasChildren && !collapsed && (
        <div className="Editor-indent">
          <Editor parentId={block.id} />
        </div>
      )}
    </div>
  )
}
