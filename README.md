# detent-demo

A slugify library with no dependencies (`src/index.js`, about 40 lines). [Detent](https://github.com/Amanborn007/detent) runs a coding agent through fixed stages and pauses for human answers. This repo is the target of one recorded run, and it is kept small so a reviewer can check the whole diff. It is a fixture, not a competing slugify package.

## The run

[Issue #1](https://github.com/Amanborn007/detent-demo/issues/1) asked for a `maxLength` option because long titles make long slugs. A slug often goes into a URL or a fixed-width column, and a cut at a separator leaves a whole word (`/creme`, not `/cr`). Its criteria say the cut lands on a separator, so a plain `slice` is out. [PR #2](https://github.com/Amanborn007/detent-demo/pull/2) is what the run produced. The record is [2026-10-20-amanborn007-detent-demo-1](https://github.com/Amanborn007/detent/tree/main/docs/examples/2026-10-20-amanborn007-detent-demo-1) in the Detent repo.

```js
import { slugify } from "./src/index.js";

slugify("Crème Brûlée"); // "creme-brulee"
slugify("Hello brave new world", { maxLength: 13 }); // "hello-brave"
```

## Run it

You need Node 20 or later. There is no install step.

```sh
git clone https://github.com/Amanborn007/detent-demo.git
cd detent-demo
npm test
node --input-type=module -e 'import { slugify as s } from "./src/index.js"; console.log(s("Hello brave new world", { maxLength: 13 })); try { s("x", { maxLength: 0 }) } catch (e) { console.log(e.name) }'
```

The last command prints `hello-brave` and then `RangeError`.

## How it works

`slugify` runs NFKD, strips combining marks, lowercases, turns each run of characters outside `a-z0-9` into the separator and trims the ends. The cut runs last, on that trimmed slug, so a call without `maxLength` takes the same path as before ([plan.md](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/plan/plan.md)). It cuts at `lastIndexOf(separator, maxLength)`. A first word longer than the cap is cut mid-word, because issue #1 asks for that.

## Decisions

Links go to [the record folder](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1). Two of the seven questions changed what `slugify` does.

- D-001, `maxLength: null` ([decisions.json](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/decisions.json)). I chose "no cap". The alternative was `RangeError`. A `null` from a config file means unset, and `separator` already treats `null` that way. The tradeoff is that a mistaken `null` is not reported.
- D-007, a separator such as `a` can split a word at the cut ([reviewer-response.json](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/verify/reviewer-response.json)). I fixed it in the PR, because it broke the promise that no word is split. With `maxLength` set, a separator that is empty or has a lowercase letter or digit throws `RangeError`. Without `maxLength` the separator is not checked, so existing calls return what they did before, as issue #1 requires. The tradeoff is that `separator: "a"` works without `maxLength` and throws with it.
- The plan puts the cut after the existing pipeline, so calls without `maxLength` take the same path ([plan.md](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/plan/plan.md)). Cutting a word list instead would not need the separator check. The cost of the current shape is the separator limits below.
- The base pipeline (NFKD, strip marks, no dependency, no character table) follows the no-dependencies constraint in [brief.md](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/brief.md). The cost is that `ß`, `ø` and `Ł` are lost.

D-002 kept a docs step the brief did not ask for, because an option nobody can find in the docs is not usable. D-003 and D-006 approved the plan and the push. D-004 and D-005 turned down the agent's own review and hand-gathered evidence and asked for an independent reviewer and verifier. The reviewer then raised D-007.

## What did not work

- The first cut (`9c8a38a`) searched inside `slug.slice(0, maxLength)`, so a `--` that crossed the cap was missed and `ab cd ef` with `--` at 7 gave `ab`. `9529cdc` pinned it with a test and `c595989` switched to `lastIndexOf(separator, maxLength)`.
- The D-007 word-splitting bug is that `lastIndexOf` assumes the separator only appears between words. With `a` as the separator it matches inside a word, and `banana split` at 4 gave `ban`. The fix is the validation above.
- The D-007 failing test (`609628e`) asserted that `separator: ""` returns `hellobrave`. An empty separator already threw `SyntaxError` on main, so `017433f` dropped the assertion. The reviewer's own examples were also wrong (`banana split` gave `ban`, not `b`), but the finding held.

## Edge cases covered

`test/slugify.test.js` freezes 15 outputs of 0.1.0 for calls without `maxLength`, uses `.`, `+` and `*` as separators, and covers accents, punctuation runs and trimmed ends, a custom separator, `separator: null`, and non-string input throwing `TypeError`. For `maxLength` it covers a cut on the last separator that fits, a first word longer than the cap, a multi-character separator never split (`ab cd ef` with `--` at 7 gives `ab--cd`), `RangeError` for 0, -1, 2.5, `"10"`, `NaN` and `Infinity`, and `null` meaning no cap. A sweep over titles, three separators and caps 1 to 25 checks that the result fits the cap, has no trailing separator, is a prefix of the uncapped slug and splits no word except a first word longer than the cap.

## Known limits

Each limit is pinned in `test/known-limits.test.js`, so a fix or a regression fails `npm test`.

- Each run of characters outside `a-z0-9`, after NFKD, accent stripping and lowercasing, becomes one separator, and separators at the ends are trimmed. So `Привет мир`, empty input and punctuation-only input all return `""` with no error.
- NFKD plus stripping combining marks needs no data table, but letters with no decomposition are lost or split: `Straße` gives `stra-e`, `Søren` gives `s-ren`.
- An apostrophe splits a word. `null` options throw `TypeError`, from reading a property of `null` and not from a check.
- The separator is checked only with `maxLength`, and only for lowercase letters and digits, so `A` passes.
- Trimming repeats only the last character of the separator, so `slugify(" yes", { separator: "xy" })` gives `es`.
- The separator is passed to `String.replace`, so `$&` is read as a pattern. `slugify("Hello brave new world", { separator: "$&", maxLength: 13 })` gives `hello brave n`.

There is no CI, no wide Unicode test and no performance test, so `npm test` is the only check.

## What I would change

- Validate the separator whether or not `maxLength` is set, and group it in the trim regex. Both change output for some existing calls, so they belong in a 1.0.
- Pass the separator to `replace` through a function so `$` is literal. That changes output for existing callers who pass `$$`, so it also waits for 1.0.
- Add a transliteration table for `ß`, `ø` and `Ł`. Someone has to write and maintain the table in this repo, and it changes the output for those letters, which the known-limits tests pin.
- Cut a word list when `maxLength` is set. It drops the separator check and the D-007 bug, but it rewrites the cut code and its tests, and the plan did not weigh it.
- Add a CI workflow that runs `node --test` on Node 20 and 22.

## License

MIT, see [LICENSE](LICENSE). Version history is in [CHANGELOG.md](CHANGELOG.md).
