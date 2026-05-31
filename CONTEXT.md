# Context

Glossary for the React Block Editor — a block-based outliner in the style of RemNote / Dynalist / Roam Research.

## Block

The atomic unit of the editor. A single editable line of text that carries a kind, a colour, and a position in a parent/child hierarchy. Every document is a tree of Blocks.

## Block Kind

What a Block *is*, which drives how it renders. There are four kinds:

- **Paragraph** — ordinary body text. The default kind for a new Block. (Stored in code as the literal `base`.)
- **Heading 1**, **Heading 2**, **Heading 3** — headings at three levels of prominence.

A Block has exactly one kind at a time. Changing kind does not change the Block's content or position.

## Nesting

The parent/child relationship between Blocks. A Block may have one parent Block and any number of child Blocks, forming a tree. Top-level Blocks have no parent Block (they sit at the root of the document).

- **Indent** — make a Block a child of the sibling immediately above it. Increases nesting depth.
- **Outdent** — promote a Block to sit alongside its former parent (i.e. become a child of its grandparent). Decreases nesting depth.

Every Block's parent is either another existing Block or the document root — there are no orphans. When a Block with children is deleted, its children are **promoted** into its place (reparented to the deleted Block's parent, at the deleted Block's position in Order), so the invariant always holds.

## Order

A Block's position relative to its siblings under the same parent. Order is a first-class property of the document: siblings are strictly ordered, and that order is meaningful and user-controlled (e.g. inserting a Block, moving it up or down). Two documents with the same Blocks in a different sibling order are different documents.

## Highlight

A Block's emphasis, drawn from a fixed, closed set of named values. It is semantic emphasis (mark a Block as notable or categorise it), not freeform styling. The values are:

- **Default** — no emphasis.
- **Yellow**, **Red**, **Green** — distinct highlights.

A Block has exactly one Highlight at a time; **Default** means "unhighlighted".

