# Testing

`npm test` runs `node --test` over `test/slugify.test.js` and `test/known-limits.test.js`. On 2026-11-10 with Node v20.20.2 it reported `# pass 21` and `# fail 0`.

## The contract and its tests

Each rule below is stated once, with the test that pins it. Where a rule comes from:

- Rules 1 and 2, and the tests listed under the table, came with the initial commit `ab71561`.
- Rules 3 to 6, 9 and 10 trace to the acceptance criteria in the run's [brief](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/brief.md). The brief requires that the cut lands on a separator. It does not say which one. Rule 3 takes the last one that starts at or before index `maxLength`, which keeps the most words that fit. That reading is mine, inferred from the code, not a recorded decision.
- Rule 7 is my answer to D-001 in the run's [decisions.json](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/decisions.json).
- Rule 8 is the reviewer's suggested fix for D-007, which I chose to apply in the PR.

| # | Rule | Example | Test |
| --- | --- | --- | --- |
| 1 | Accents are stripped | `Crème Brûlée` gives `creme-brulee` | `strips accents` |
| 2 | Punctuation runs collapse and the ends are trimmed | `  --Hello,   World!--  ` gives `hello-world` | `collapses runs of punctuation and trims the ends` |
| 3 | The cut is at the last separator that starts at or before index `maxLength` | `Hello brave new world`, 13 gives `hello-brave` | `caps the length by cutting at the last separator that fits` |
| 4 | The result never ends in a separator | `Hello brave new world`, 12 gives `hello-brave` | `never leaves a trailing separator after the cut` |
| 5 | A first word longer than the cap is cut mid-word | `Supercalifragilistic expialidocious`, 5 gives `super` | `cuts a first word that is longer than maxLength` |
| 6 | Without `maxLength`, or when it is not needed, output is unchanged | `Hello World`, 50 gives `hello-world` | `leaves output unchanged when maxLength is not given or not needed` |
| 7 | `maxLength: null` means no cap | `Hello brave new world` gives `hello-brave-new-world` | `treats maxLength: null as no cap` |
| 8 | With `maxLength`, an empty or alphanumeric separator throws `RangeError` | `""`, `"a"`, `"x1"` | `rejects a separator that can appear inside a word when maxLength is set` |
| 9 | `maxLength` must be an integer of at least 1, otherwise `RangeError` | `0`, `-1`, `2.5`, `"10"`, `NaN`, `Infinity` | `rejects a maxLength below 1 or not an integer`, `rejects Infinity as maxLength` |
| 10 | The result has at most `maxLength` characters, no trailing separator, is a prefix of the uncapped slug and splits no word | 5 titles, separators `-`, `--` and `_`, `maxLength` 1 to 25 | `keeps the result within maxLength, without a trailing separator, as a prefix of the uncapped slug` |

Four more tests cover the default lowercase-and-dash output (`lowercases and joins words with dashes`), a custom separator (`honours a custom separator`), non-string input throwing `TypeError` (`rejects non-strings`), and a multi-character separator that is never split (`never splits a multi-character separator`). For example, `ab cd ef` with `--` at 7 gives `ab--cd`.

## Known limits

`test/known-limits.test.js` pins each of these, so a fix or a regression fails `npm test`. When a limit is fixed, update that test and this table together. Measured against `src/index.js` on 2026-11-10.

| Limit | Example | Test |
| --- | --- | --- |
| Non-Latin scripts are dropped | `Привет мир` and `日本語` return `""` | `known limit: non-Latin scripts are dropped` |
| Empty or punctuation-only input returns `""` with no error | `""` and `!!!` return `""` | `known limit: empty and punctuation-only input return an empty string` |
| Letters with no NFKD decomposition are lost or split | `Straße` gives `stra-e`, `Søren` gives `s-ren`, `Łódź` gives `odz` | `known limit: letters with no NFKD decomposition are lost or split` |
| An apostrophe splits a word | `Don't stop` gives `don-t-stop` | `known limit: an apostrophe splits a word` |
| The separator is only validated with `maxLength` | Without it, `""` throws a regex `SyntaxError` and `a` turns `a b` into `b` | `known limit: the separator is not validated without maxLength` |
| `options` set to `null` throws | `slugify(s, null)` throws `TypeError`, because only `undefined` defaults to `{}` | `known limit: null options throws TypeError` |

## What the tests do not cover

The tests pin the rules and limits above and nothing else. There is no test over arbitrary Unicode input, no performance test and no CI, so `npm test` runs only when someone runs it locally.
