import { useEffect } from 'react'
import { useStore } from '@nanostores/react'
import './styles/App.sass'
import './styles/Block.sass'
import Editor from './components/Editor'
import { $blocks, seedIfEmpty } from './store/blocks'
import { ROOT } from './domain/block'

function App() {
  const blocks = useStore($blocks)

  useEffect(() => {
    seedIfEmpty()
  }, [])

  return (
    <div className="App">
      <div className="Editor-wrapper">
        <Editor parentId={ROOT} />
      </div>
      <div className="Result">
        <pre>{JSON.stringify(Object.values(blocks), null, 2)}</pre>
      </div>
      <p className="Credits">
        App by <a href="https://grimfeld.tech">Grimfeld</a>
      </p>
    </div>
  )
}

export default App
