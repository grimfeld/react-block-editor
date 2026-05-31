import { useEffect, useState } from 'react'
import Editor from './Editor'
import '../styles/Block.css'
import { BlockType } from '../types'

interface Props {
  id: string,
  editorId: string,
  type: 'base' | 'heading',
  color: string
  content: string,
  parent: string,
  children: Array<BlockType>,
  blocks: Array<BlockType>,
  blockLength: number,
  handleContentChange(e: any, id: string): any,
  handleTypeChange(id: string, value: string): any,
  handleColorChange(id: string, value: string): any,
  handleAdd(): any,
  handleDelete(id: string): any,
  handleIndent(id: string, blocks: Array<BlockType>): any,
  handleIndentEvent(id: string, editorId: string): any,
  handleOutdent(id: string, parent: string): any,
  emptyBlock(id: string): any
}

function getRandomString(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default function Block(props: Props) {

  const [focus, setFocus] = useState(false)
  const [menu, setMenu] = useState(false)
  const [nested, setNested] = useState(false)

  useEffect(() => {
    const el = document.getElementById(props.id)
    if (el !== null && props.content !== el?.textContent) {
      el.textContent = props.content
    }
  })

  function handleKeyPress(e: any) {
    if (!e.shiftKey && e.code === 'Enter') {
      // Handle adding block on keypress 'Enter'
      e.preventDefault()
      if (e.target.textContent.trim() !== '') {
        props.handleAdd()
      }
    } else if (e.code === 'Backspace' && props.blockLength > 1 && e.target.textContent.trim() === '') {
      // Handle removing block on 'backspace' press if the block is empty and is not the only block on the page
      e.preventDefault()
      props.handleDelete(props.id)
    } else if (e.shiftKey && e.code === 'Backspace') {
      // Handle removing block on shift + backspace if the block is not the only one on the page
      e.preventDefault()
      if (props.blockLength > 1) {
        props.handleDelete(props.id)
      } else {
        e.target.textContent = ''
        props.emptyBlock(props.id)
      }
    } else if (e.shiftKey && e.code === 'Tab') {
      e.preventDefault()
      if (props.parent !== 'root') {
        props.handleOutdent(props.id, props.parent)
      }
    } else if (e.code === 'Tab') {
      e.preventDefault()
      props.handleIndentEvent(props.id, props.editorId)
    }
  }

  function handleBlur(e: any) {
    setFocus(false)
    if (props.blockLength > 1 && e.target.textContent.trim() === '') {
      props.handleDelete(props.id)
    }
  }


  return (
    <div className="Block-main" data-focus={focus}>
      <div className="Block-wrapper">
        <i className='bx bx-dots-horizontal-rounded Block-menu-trigger' onClick={() => setMenu(!menu)}></i>
        {props.children.length > 0 && <i className={['bx Block-nest-trigger', nested ? 'bx-caret-right' : 'bx-caret-down'].join(' ')} onClick={() => setNested(!nested)}></i>}
        {menu &&
          <div className="Block-menu">
            <i className='bx bx-paragraph Block-menu-item' onClick={() => props.handleTypeChange(props.id, 'base')}></i>
            <span className="Block-menu-item" onClick={() => props.handleTypeChange(props.id, 'heading1')}>H1</span>
            <span className="Block-menu-item" onClick={() => props.handleTypeChange(props.id, 'heading2')}>H2</span>
            <span className="Block-menu-item" onClick={() => props.handleTypeChange(props.id, 'heading3')}>H3</span>
            <span className="Block-menu-item default" onClick={() => props.handleColorChange(props.id, 'default')}></span>
            <span className="Block-menu-item yellow" onClick={() => props.handleColorChange(props.id, 'yellow')}></span>
            <span className="Block-menu-item red" onClick={() => props.handleColorChange(props.id, 'red')}></span>
            <span className="Block-menu-item green" onClick={() => props.handleColorChange(props.id, 'green')}></span>
          </div>
        }
        <div className="Block-dot" />
        <div
          key={props.id}
          id={props.id}
          data-id={props.id}
          data-content={props.content}
          contentEditable="true"
          className={['Block-content', props.color.toString(), props.type.toString()].join(' ')}
          onInput={(e) => props.handleContentChange(e, props.id)}
          onKeyDown={(e) => handleKeyPress(e)}
          onFocus={() => setFocus(true)}
          onBlur={handleBlur}
        />
      </div>
      {props.children.length > 0 && !nested &&
        <div className="Editor-indent">
          <Editor
            id={getRandomString()}
            blocksToDisplay={props.children}
            allBlocks={props.blocks}
            handleAdd={props.handleAdd}
            handleContentChange={props.handleContentChange}
            handleTypeChange={props.handleTypeChange}
            handleColorChange={props.handleColorChange}
            handleDelete={props.handleDelete}
            handleIndent={props.handleIndent}
            handleIndentEvent={props.handleIndentEvent}
            handleOutdent={props.handleOutdent}
            emptyBlock={props.emptyBlock}
          />
        </div>
      }
    </div>
  )
}
