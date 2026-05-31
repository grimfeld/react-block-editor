import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Block from './Block'
import { $blocks, seedIfEmpty } from '../store/blocks'

describe('Block menu', () => {
  beforeEach(() => $blocks.set({}))

  it('sets kind and highlight through the menu', async () => {
    seedIfEmpty()
    const id = Object.keys($blocks.get())[0]
    const user = userEvent.setup()
    render(<Block id={id} />)

    await user.click(screen.getByLabelText('Open block menu'))
    await user.click(screen.getByLabelText('Set kind heading2'))
    expect($blocks.get()[id].kind).toBe('heading2')

    await user.click(screen.getByLabelText('Open block menu'))
    await user.click(screen.getByLabelText('Set highlight yellow'))
    expect($blocks.get()[id].highlight).toBe('yellow')
  })

  it('renders the kind and highlight as CSS classes', async () => {
    seedIfEmpty()
    const id = Object.keys($blocks.get())[0]
    render(<Block id={id} />)
    const content = document.getElementById(id)!
    expect(content.className).toContain('paragraph')
    expect(content.className).toContain('default')
  })
})
