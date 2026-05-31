import { useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import './styles/App.sass'
import './styles/Block.sass'
import Editor from './components/Editor'
import { $blocks } from './store/blocks'
import { ROOT } from './domain/block'
import { hydrate, startPersisting } from './persistence/sync'

function App() {
  const blocks = useStore($blocks)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let stop: (() => void) | undefined
    hydrate().then(() => {
      stop = startPersisting()
      setReady(true)
    })
    return () => stop?.()
  }, [])

  if (!ready) return null

  return (
    <div className="App">
      <h1 className="visually-hidden">React Block Editor</h1>
      <main className="Editor-wrapper" aria-label="Document">
        <Editor parentId={ROOT} />
      </main>
      <aside className="Result" aria-label="Document data (JSON)">
        <pre>{JSON.stringify(Object.values(blocks), null, 2)}</pre>
      </aside>
      <footer className="Credits">
        App by <a href="https://grimfeld.tech">Grimfeld</a>
      </footer>
    </div>
  )
}

export default App
