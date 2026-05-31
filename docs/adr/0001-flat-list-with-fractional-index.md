# Store the block tree as a flat list with fractional-index ordering

The document is a tree of Blocks, but we store it as a **flat list** where each Block carries a `parent` reference and a **fractional index** giving its position among its siblings, rather than as a nested tree of `children` arrays. We chose this because Order is a first-class, user-controlled concept (insert, move up/down, indent/outdent) and a flat model makes every structural mutation a cheap, local edit: inserting or moving a Block is a single record write with a new fractional index, with no sibling renumbering and no deep immutable tree surgery. It also maps 1:1 onto per-record persistence (see ADR-0002).

## Considered Options

- **Nested tree (`children` arrays).** Order falls out of array position for free, but indent/outdent/promote become deep immutable rewrites, and per-record storage forces a flatten anyway.
- **Flat list + integer index.** Inserting between two siblings forces renumbering the rest of the group.
- **Flat list + fractional index (chosen).** Insert/move = one write; no renumbering.

## Consequences

- Rendering requires grouping by `parent` and sorting by fractional index on each level.
- Fractional indices can in principle run out of precision after many insertions in the same gap; a periodic rebalance may eventually be needed (not expected at this scale).
