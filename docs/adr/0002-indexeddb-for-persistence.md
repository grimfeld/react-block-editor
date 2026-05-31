# Persist Blocks in IndexedDB, one record per Block

The document survives page refresh by persisting to **IndexedDB**, storing **one record per Block** keyed by id, rather than serialising the whole tree into a single localStorage blob. For a single small document this is more machinery than strictly needed, so the choice is deliberate: per-record storage pairs naturally with the flat-list + fractional-index model (ADR-0001), letting a single Block mutation become a single record write, and an asynchronous client-side repository layer is a closer reflection of how a real outliner would persist its data — which matters because this project is a skills showcase.

## Considered Options

- **localStorage, whole-tree JSON blob.** Trivial (one synchronous read/write), but every edit rewrites the entire document and it demonstrates little.
- **IndexedDB, per-record (chosen).** Async, more ceremony, but supports granular writes and showcases real client-side persistence design.
- **Cloud database.** Explicitly out of scope — no backend.

## Consequences

- The persistence layer is asynchronous; state hydration on load is async and must be handled in the UI.
- nanostores subscriptions drive writes (subscribe → persist changed Block).
