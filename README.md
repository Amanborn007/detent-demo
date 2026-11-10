# detent-demo

A slugify library with no dependencies (`src/index.js`, about 40 lines). [Detent](https://github.com/Amanborn007/detent) runs a coding agent through fixed stages and pauses for human answers. This repo is the target of one recorded run, and it is kept small so the run is easy to read.

## The run

[Issue #1](https://github.com/Amanborn007/detent-demo/issues/1) asked for a `maxLength` option because long titles make long slugs. [PR #2](https://github.com/Amanborn007/detent-demo/pull/2) is what the run produced. The record of the run is in the Detent repo: [2026-10-20-amanborn007-detent-demo-1](https://github.com/Amanborn007/detent/tree/main/docs/examples/2026-10-20-amanborn007-detent-demo-1). Its `decisions.json` holds seven questions. Two of them changed what `slugify` does:

- D-001, before implementing: what does `maxLength: null` mean? I chose "no cap", so a `null` from a config file gives a full slug.
- D-007, before shipping: the reviewer found that a separator such as `a` can split a word at the cut. I chose to fix it in the PR. With `maxLength` set, an empty or alphanumeric separator now throws `RangeError`. Without `maxLength` nothing changes, because the brief requires that calls without it return what they return today.

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
- Over five titles, three separators and caps 1 to 25, the result fits the cap, has no trailing separator, is a prefix of the uncapped slug and splits no word.

## Known limits

Each limit is pinned in `test/known-limits.test.js`, so a fix or a regression fails `npm test`. The one most callers will hit is that non-Latin input such as `Привет мир` returns `""` with no error. The others are letters with no NFKD decomposition (`Straße` gives `stra-e`), an apostrophe splitting a word, the separator being validated only with `maxLength`, and `null` options throwing `TypeError`.

## License

MIT, see [LICENSE](LICENSE). Version history is in [CHANGELOG.md](CHANGELOG.md).
