/** Generates a short, collision-resistant id for a Block. */
export function createId(): string {
  return (
    Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
  )
}
