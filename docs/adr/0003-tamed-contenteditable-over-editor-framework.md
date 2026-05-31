# Build editing on tamed contentEditable rather than an editor framework

Each Block's editable text is implemented with **`contentEditable` handled properly** — React owns the block structure while the content region is treated as uncontrolled, with deliberate caret and selection handling — rather than adopting an editor framework (ProseMirror, Lexical, TipTap, Slate). We chose this because the project is a skills showcase whose point is to demonstrate that we understand how a block outliner works from the ground up; pulling in a framework would move the block-tree, nesting, and ordering model into the framework's abstractions and read as "wired up a library" rather than "built an editor".

## Considered Options

- **Plain `<textarea>`/input per Block.** Trivially correct and fully React-controlled, but unimpressive and rules out future inline rich text.
- **Editor framework (Lexical/Slate/etc).** Most production-ready, but hides the hard parts and reshapes the domain model around the framework.
- **Tamed contentEditable (chosen).** Honest reproduction of how RemNote-class editors actually work; demonstrates the genuine skill.

## Consequences

- contentEditable's known hazards (caret jumps, React/DOM sync, paste handling) must be solved by hand rather than inherited from a library.
- Inline rich formatting, if ever wanted, is ours to build.
