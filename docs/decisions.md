# Decisions

Some terms come from Detent. The run record is the folder of files Detent wrote during the run, in the Detent repo under [`docs/examples/2026-10-20-amanborn007-detent-demo-1`](https://github.com/Amanborn007/detent/tree/main/docs/examples/2026-10-20-amanborn007-detent-demo-1). The brief is the acceptance criteria Detent wrote from issue #1. `decisions.json` holds the questions the run stopped to ask me, numbered D-001 to D-007. The reviewer is the review step Detent runs before it ships.

## How it works

`slugify` normalizes the input with NFKD, strips the combining marks `U+0300` to `U+036F`, lowercases it, replaces each run of characters outside `[a-z0-9]` with the separator, and trims the separator from both ends. If `maxLength` is set and the slug is longer, `slug.lastIndexOf(separator, maxLength)` finds the last separator that starts at or before index `maxLength` and the slug is cut there. With no such separator, the first word is cut at `maxLength`.

NFKD and the ASCII-only output came with the initial commit `ab71561`, and PR #2 did not touch them. No reason for either is recorded in the repo or the run record. One measured difference: NFKD turns the `ﬁ` ligature into `fi`, so `slugify("ﬁsh")` returns `fish`, and NFD would leave the ligature in place for the `[^a-z0-9]` step to drop. That is a benefit I found afterwards, not a reason I held.

The brief requires that the cut lands on a separator. It does not say which one. The code takes the last one, because `lastIndexOf` from `maxLength` returns the last separator at or before that index, so the result keeps as many whole words as fit. No reason for choosing the last over the first is recorded, so that is inferred from the code.

## How it was built

`ab71561` (2026-10-20) is the initial library with 5 tests. [PR #2](https://github.com/Amanborn007/detent-demo/pull/2) was merged on 2026-10-21 as `0a0c704` and has 13 commits. Five behaviours were added as a failing-test commit followed by the implementation commit:

- `6f0ed4b` then `709f017`: validate `maxLength`.
- `15a742d` then `9c8a38a`: cut at the last separator.
- `9529cdc` then `c595989`: multi-character separator at the cut. `9529cdc` also added the first-word and unchanged-output tests, which already passed on `9c8a38a`.
- `cfafc0b` then `00568f4`: `maxLength: null`.
- `609628e` then `78232b9`: reject a word-character separator.

The other three commits are `07cd059` (JSDoc for `maxLength`), `017433f` (drops a wrong assertion, below) and `40431d2` (JSDoc says when a word does get cut).

## Questions the run asked me

- D-001 asked what `maxLength: null` means. The brief raised it as U1 because it decides whether a caller passing `null` from a config file gets a slug or an exception. I picked "treat null like undefined" over throwing `RangeError`, and the code reads `options.maxLength ?? undefined`. The run's `decision-rationale.jsonl` records this reason against the throwing option: a `null` from a config file means unset, and the `separator` option already treats `null` that way with `??`.
- D-007 came from the reviewer after the tests were green. It said an empty or alphanumeric separator can split words, and I chose to fix it in the PR. With `maxLength` set, an empty or alphanumeric separator now throws `RangeError`. The check only runs with `maxLength` because the brief requires that "Calls without `maxLength` return exactly what they return today".

## What did not work

- The first cut (`9c8a38a`) searched for the separator inside `slug.slice(0, maxLength)`, plus an exact match at the cap. A `--` separator that straddled the cap was missed, so `slugify("ab cd ef", { separator: "--", maxLength: 7 })` returned `ab` instead of `ab--cd`. `9529cdc` added the failing test and `c595989` switched to `slug.lastIndexOf(separator, maxLength)`.
- The D-007 failing test (`609628e`) also asserted that `slugify("Hello brave", { separator: "" })` returns `hellobrave`. An empty separator already threw on main, so the assertion described behaviour that never existed. `017433f` dropped it with my sign-off, per its commit message, and the `RangeError` cases stayed.
- The reviewer's examples for D-007 were partly wrong. The empty-separator example was wrong. It said `slugify("Hello brave", { separator: "", maxLength: 7 })` returned `hellobr`. On the code before the fix (`07cd059`) it throws `SyntaxError: Invalid regular expression: /^+|+$/g: Nothing to repeat`, because the trim regex is built before the cut.
- The alphanumeric-separator example was also wrong. It said `slugify("banana split", { separator: "a", maxLength: 4 })` returned `b`, but it returned `ban`. The `ban` result does split a word, so the finding held.

The empty separator was never a word-splitting bug.

## What could change next

These come from the known limits in [testing.md](testing.md). I have not decided any of them.

- Validate the separator even without `maxLength`. This replaces the regex `SyntaxError` for `separator: ""` with a clear error, but it changes output for callers who pass `separator: "a"` today, since `slugify("a b", { separator: "a" })` returns `b`.
- Transliterate letters that have no NFKD decomposition, such as `ß`, `ø` and `ł`, with a small table. The table has to be maintained, and every letter it misses is still dropped.
- Accept `options` set to `null`. Today `slugify(s, null)` throws `TypeError`.
