import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import BlockContent from './BlockContent'

const noop = () => {}

describe('BlockContent', () => {
  it('seeds its text on mount', () => {
    render(
      <BlockContent id="a" content="hello" className="x" onInput={noop} onKeyDown={noop} />,
    )
    expect(document.getElementById('a')!.textContent).toBe('hello')
  })

  it('reflects an external content change when not focused', () => {
    function Harness() {
      const [content, setContent] = useState('one')
      return (
        <>
          <button onClick={() => setContent('two')}>change</button>
          <BlockContent id="a" content={content} className="x" onInput={noop} onKeyDown={noop} />
        </>
      )
    }
    render(<Harness />)
    expect(document.getElementById('a')!.textContent).toBe('one')
    fireEvent.click(screen.getByText('change'))
    expect(document.getElementById('a')!.textContent).toBe('two')
  })

  it('does not clobber the node while it is focused (caret safety)', () => {
    function Harness() {
      const [content, setContent] = useState('typed')
      return (
        <>
          <button onClick={() => setContent('external')}>change</button>
          <BlockContent id="a" content={content} className="x" onInput={noop} onKeyDown={noop} />
        </>
      )
    }
    render(<Harness />)
    const el = document.getElementById('a') as HTMLDivElement
    el.focus()
    expect(document.activeElement).toBe(el)
    fireEvent.click(screen.getByText('change'))
    // While focused, an external change must NOT overwrite the live text.
    expect(el.textContent).toBe('typed')
  })

  it('reports input text without rewriting the node', () => {
    const onInput = vi.fn()
    render(<BlockContent id="a" content="" className="x" onInput={onInput} onKeyDown={noop} />)
    const el = document.getElementById('a') as HTMLDivElement
    el.textContent = 'abc'
    fireEvent.input(el)
    expect(onInput).toHaveBeenCalledWith('abc')
    // The node's own text is untouched by the component on input.
    expect(el.textContent).toBe('abc')
  })
})
