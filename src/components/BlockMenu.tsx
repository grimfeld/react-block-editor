import type { BlockKind, Highlight } from '../domain/block'

interface Props {
  onKind(kind: BlockKind): void
  onHighlight(highlight: Highlight): void
}

const KINDS: { kind: BlockKind; label: string; className?: string }[] = [
  { kind: 'paragraph', label: '¶' },
  { kind: 'heading1', label: 'H1' },
  { kind: 'heading2', label: 'H2' },
  { kind: 'heading3', label: 'H3' },
]

const HIGHLIGHTS: Highlight[] = ['default', 'yellow', 'red', 'green']

/** The per-Block menu for setting its Kind and Highlight. */
export default function BlockMenu({ onKind, onHighlight }: Props) {
  return (
    <div className="Block-menu">
      {KINDS.map(({ kind, label }) => (
        <span
          key={kind}
          className="Block-menu-item"
          role="button"
          aria-label={`Set kind ${kind}`}
          onClick={() => onKind(kind)}
        >
          {label}
        </span>
      ))}
      {HIGHLIGHTS.map((highlight) => (
        <span
          key={highlight}
          className={`Block-menu-item ${highlight}`}
          role="button"
          aria-label={`Set highlight ${highlight}`}
          onClick={() => onHighlight(highlight)}
        />
      ))}
    </div>
  )
}
