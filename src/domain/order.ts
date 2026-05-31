/**
 * Fractional indexing (see docs/adr/0001).
 *
 * Order keys are strings compared lexicographically. `between(a, b)` returns a
 * new key that sorts strictly between `a` and `b`, so inserting or moving a
 * Block is a single write with no renumbering of its siblings.
 *
 * Keys are built from a fixed digit alphabet. When two adjacent keys leave no
 * digit between them at a given position, we descend a level (append a digit),
 * giving effectively unbounded precision.
 */

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'
const BASE = DIGITS.length
const FIRST = DIGITS[0] // '0'
const LAST = DIGITS[DIGITS.length - 1] // 'z'
/** A mid digit used to seed the very first key in an empty list. */
const MID = DIGITS[Math.floor(BASE / 2)] // 'i'

function digit(s: string, i: number): number {
  // Treat positions past the end of a key as the lowest digit.
  return i < s.length ? DIGITS.indexOf(s[i]) : 0
}

/**
 * Returns a key strictly between `a` and `b`.
 * Pass `null` for `a` to mean "before everything", `null` for `b` to mean
 * "after everything". Requires `a < b` when both are provided.
 */
export function between(a: string | null, b: string | null): string {
  if (a !== null && b !== null && a >= b) {
    throw new Error(`between() requires a < b, got a=${a} b=${b}`)
  }

  let result = ''
  let i = 0
  // Walk position by position, copying shared prefix digits, until we find a
  // position where we can place a digit strictly between the two bounds.
  for (;;) {
    const lo = a !== null ? digit(a, i) : 0
    const hi = b !== null ? digit(b, i) : BASE
    if (lo === hi) {
      // No room here; keep this digit and descend.
      result += DIGITS[lo]
      i++
      continue
    }
    const mid = Math.floor((lo + hi) / 2)
    if (mid > lo) {
      // There is a gap: place the midpoint digit and we are done.
      return result + DIGITS[mid]
    }
    // Digits are adjacent (hi === lo + 1). Anchor on the lower digit and
    // descend into the next position, where `b` has no constraint.
    result += DIGITS[lo]
    i++
    // From here `b`'s tail no longer bounds us; only `a`'s tail (if any) does.
    return result + tailAfter(a, i)
  }
}

/**
 * Builds a suffix that sorts strictly after `a`'s remaining digits (from
 * position `i`), used once we've descended past `b`'s constraint.
 */
function tailAfter(a: string | null, i: number): string {
  let result = ''
  let j = i
  for (;;) {
    const lo = a !== null ? digit(a, j) : 0
    if (lo + 1 < BASE) {
      // Step one digit above `a` at this position.
      const mid = Math.floor((lo + BASE) / 2)
      return result + DIGITS[mid > lo ? mid : lo + 1]
    }
    // `a` has the max digit here; copy it and look one position deeper.
    result += LAST
    j++
  }
}

/** The first key for an Block appended to an empty list. */
export function firstKey(): string {
  return MID
}

export const ORDER_INTERNALS = { DIGITS, FIRST, LAST, MID }
