# detent-demo

A slugify library with no dependencies (`src/index.js`, about 40 lines). [Detent](https://github.com/Amanborn007/detent) runs a coding agent through fixed stages and pauses for human answers. This repo is the target of one recorded run, and it is kept small so the run is easy to read.

## The run

[Issue #1](https://github.com/Amanborn007/detent-demo/issues/1) asked for a `maxLength` option because long titles make long slugs. [PR #2](https://github.com/Amanborn007/detent-demo/pull/2) is what the run produced. The record of the run is in the Detent repo: [2026-10-20-amanborn007-detent-demo-1](https://github.com/Amanborn007/detent/tree/main/docs/examples/2026-10-20-amanborn007-detent-demo-1). Its `decisions.json` holds seven questions. Two of them changed what `slugify` does:

- D-001, before implementing: what does `maxLength: null` mean? I chose "no cap", so a `null` from a config file gives a full slug.
- D-007, before shipping: the reviewer found that a separator such as `a` can split a word at the cut. I chose to fix it in the PR and not leave it for a follow-up. With `maxLength` set, a separator that is empty or contains a lowercase letter or digit now throws `RangeError`. Without `maxLength` the separator is not checked, so existing calls return what they did before, as issue #1 requires. The tradeoff is that `separator: "a"` is accepted without `maxLength` and rejected with it.

```js
import { slugify } from "./src/index.js";

slugify("Crème Brûlée"); // "creme-brulee"
slugify("Hello brave new world", { maxLength: 13 }); // "hello-brave"
```

This is a fixture and I have not published it to npm.

## Run the tests

You need Node 20 or later. There are no dependencies and no install step.

```sh
git clone https://github.com/Amanborn007/detent-demo.git
cd detent-demo
npm test
```

## Edge cases covered

`test/slugify.test.js` covers accents (`Crème Brûlée` gives `creme-brulee`), punctuation runs and trimmed ends, a custom separator, and non-string input throwing `TypeError`. For `maxLength` it covers:

- The cut lands on the last separator that starts at or before index `maxLength`, so `Hello brave new world` at 13 gives `hello-brave`.
- A first word longer than the cap is cut mid-word.
- A multi-character separator is never split: `ab cd ef` with `--` at 7 gives `ab--cd`.
- `maxLength` must be an integer of at least 1, otherwise `RangeError`.
- Over five titles, three separators and caps 1 to 25, the result fits the cap, has no trailing separator, is a prefix of the uncapped slug and splits no word except a first word longer than the cap.

## What did not work

- The first cut (`9c8a38a`) searched inside `slug.slice(0, maxLength)`, so a `--` that crossed the cap was missed and `ab cd ef` with `--` at 7 gave `ab`. `9529cdc` pinned it with a test and `c595989` switched to `lastIndexOf(separator, maxLength)`.
- The D-007 failing test (`609628e`) asserted that `separator: ""` returns `hellobrave`. An empty separator already threw `SyntaxError` on main, so `017433f` dropped the assertion.
- The reviewer's D-007 examples were wrong. The empty separator threw and did not return `hellobr`, and `banana split` with `a` at 4 gave `ban`, not `b`. The `ban` result still splits a word, so the finding held.

## Known limits

Each limit is pinned in `test/known-limits.test.js`, so a fix or a regression fails `npm test`. Anything outside `a-z0-9` after NFKD is dropped, so non-Latin input such as `Привет мир`, empty input and punctuation-only input all return `""` with no error. The others are letters with no NFKD decomposition (`Straße` gives `stra-e`), an apostrophe splitting a word, the separator being validated only with `maxLength`, and `null` options throwing `TypeError`.

The cut takes the last separator that fits, which keeps the most whole words. A first word over the cap is cut mid-word, so that is the one case where a word is split. There is no CI, no wide Unicode test and no performance test, so `npm test` is the only check.

## License

MIT, see [LICENSE](LICENSE). Version history is in [CHANGELOG.md](CHANGELOG.md).
