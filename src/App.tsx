import { useState } from 'react';
import './styles/App.css';
import { BlockType } from './types'
import Editor from './components/Editor'

function getRandomString(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


function App() {
  const [blocks, setBlocks] = useState<Array<BlockType> | any>([{ id: getRandomString(), type: 'base', color: 'default', content: '', parent: 'root' }])

  // Block CRUD

  async function addBlock() {
    const id = getRandomString()
    await setBlocks([...blocks, { id: id, type: 'base', color: 'default', content: '', parent: 'root' }])
    const newBlock = document.getElementById(id)
    newBlock?.focus()
  }

  function removeBlock(id: string) {
    setBlocks(blocks.filter((block: BlockType) => block.id !== id))
  }

  function updateContent(e: any, id: string) {
    setBlocks(blocks.map((block: BlockType) => block.id === id ? { ...block, content: e.target.textContent } : block))
  }

  function updateType(id: string, value: string) {
    setBlocks(blocks.map((block: BlockType) => block.id === id ? { ...block, type: value } : block))
  }

  function updateColor(id: string, value: string) {
    setBlocks(blocks.map((block: BlockType) => block.id === id ? { ...block, color: value } : block))
  }

  function indentBlock(id: string, blocksToDisplay: Array<BlockType>) {
    const index = blocksToDisplay.findIndex((bl: BlockType) => bl.id === id)
    if (index > 0) {
      const target = blocksToDisplay[index - 1]
      setBlocks(blocks.map((block: BlockType) => block.id === id ? { ...block, parent: target.id } : block))
    }
  }

  function outdentBlock(id: string, parent: string) {
    console.log(parent);
    const parentBlock = blocks.filter((block: BlockType) => block.id === parent)
    console.log(parentBlock);
    setBlocks(blocks.map((block: BlockType) => block.id === id ? { ...block, parent: parentBlock[0].parent } : block))
  }

  const rootBlocks = blocks.filter((bl: BlockType) => bl.parent === 'root')

  return (
    <div className="App">
      <div style={{ width: '25%' }}>
        <p className="Credits">
          App by <a href="https://grimfeld.tech">Grimfeld</a>
        </p>
      </div>
      <div className="Editor-wrapper">
        <Editor
          id={getRandomString()}
          blocksToDisplay={rootBlocks}
          allBlocks={blocks}
          handleAdd={addBlock}
          handleContentChange={updateContent}
          handleTypeChange={updateType}
          handleColorChange={updateColor}
          handleDelete={removeBlock}
          handleIndent={indentBlock}
          handleIndentEvent={() => { }}
          handleOutdent={outdentBlock}
          emptyBlock={(id) => setBlocks(blocks.map((block: BlockType) => block.id === id ? { ...block, content: '' } : block))}
        />
      </div>
      <div className="Result">
        <pre>
          {JSON.stringify(blocks, null, 2)}
        </pre>
      </div>
    </div >
  );
}

export default App;