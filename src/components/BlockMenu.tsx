import type { BlockKind, Highlight } from '../domain/block'

interface Props {
  onKind(kind: BlockKind): void
  onHighlight(highlight: Highlight): void
}

const KINDS: { kind: BlockKind; label: string }[] = [
  { kind: 'paragraph', label: '¶' },
  { kind: 'heading1', label: 'H1' },
  { kind: 'heading2', label: 'H2' },
  { kind: 'heading3', label: 'H3' },
]

const HIGHLIGHTS: Highlight[] = ['default', 'yellow', 'red', 'green']

/** The per-Block menu for setting its Kind and Highlight. */
export default function BlockMenu({ onKind, onHighlight }: Props) {
  return (
    <div className="Block-menu" role="menu" aria-label="Block options">
      {KINDS.map(({ kind, label }) => (
        <button
          key={kind}
          type="button"
          role="menuitem"
          className="Block-menu-item"
          aria-label={`Set kind ${kind}`}
          onClick={() => onKind(kind)}
        >
          {label}
        </button>
      ))}
      {HIGHLIGHTS.map((highlight) => (
        <button
          key={highlight}
          type="button"
          role="menuitem"
          className={`Block-menu-item ${highlight}`}
          aria-label={`Set highlight ${highlight}`}
          onClick={() => onHighlight(highlight)}
        />
      ))}
    </div>
  )
}
