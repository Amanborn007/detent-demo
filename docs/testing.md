# Testing

`npm test` runs `node --test` over `test/slugify.test.js`. On 2026-11-10 with Node v20.20.2 it reported `# pass 13` and `# fail 0`.

## The contract and its tests

Each rule below is stated once, with the test that pins it. Rules 3 to 6 and 9 trace to the acceptance criteria in the run's [brief](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/brief.md). Picking the last separator that starts within the cap, in rule 3, is the code's choice in [PR #2](https://github.com/Amanborn007/detent-demo/pull/2). Rules 7 and 8 are maintainer answers in the run's [decisions.json](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/decisions.json), D-001 and D-007.

| # | Rule | Example | Test |
| --- | --- | --- | --- |
| 1 | Accents are stripped | `Crème Brûlée` gives `creme-brulee` | `strips accents` |
| 2 | Punctuation runs collapse and the ends are trimmed | `  --Hello,   World!--  ` gives `hello-world` | `collapses runs of punctuation and trims the ends` |
| 3 | The cut is at the last separator that starts within the cap | `Hello brave new world`, 13 gives `hello-brave` | `caps the length by cutting at the last separator that fits` |
| 4 | The result never ends in a separator | `Hello brave new world`, 12 gives `hello-brave` | `never leaves a trailing separator after the cut` |
| 5 | A first word longer than the cap is cut mid-word | `Supercalifragilistic expialidocious`, 5 gives `super` | `cuts a first word that is longer than maxLength` |
| 6 | Without `maxLength`, or when it is not needed, output is unchanged | `Hello World`, 50 gives `hello-world` | `leaves output unchanged when maxLength is not given or not needed` |
| 7 | `maxLength: null` means no cap | `Hello brave new world` gives `hello-brave-new-world` | `treats maxLength: null as no cap` |
| 8 | With `maxLength`, an empty or alphanumeric separator throws `RangeError` | `""`, `"a"`, `"x1"` | `rejects a separator that can appear inside a word when maxLength is set` |
| 9 | `maxLength` must be an integer of at least 1, otherwise `RangeError` | `0`, `-1`, `2.5`, `"10"`, `NaN` | `rejects a maxLength below 1 or not an integer` |

Three more tests cover a custom separator (`honours a custom separator`), non-string input throwing `TypeError` (`rejects non-strings`), and a multi-character separator that is never split (`never splits a multi-character separator`). For example, `ab cd ef` with `--` at 7 gives `ab--cd`.

## Not tested

`Infinity` (it throws `RangeError`, measured but not pinned), `options` set to `null`, non-Latin input, empty input, and every item under Known limitations in the README.

## Reproduce the known limits

Run from the repo root. Measured on 2026-11-10 with Node v20.20.2.

```sh
node --input-type=module -e 'import { slugify as s } from "detent-demo"; console.log(s("Straße"), s("Søren"), s("Łódź"), s("Don" + String.fromCharCode(39) + "t stop"), JSON.stringify(s("Привет мир")), JSON.stringify(s("日本語")), s("a b", { separator: "a" }))'
```

It prints `stra-e s-ren odz don-t-stop "" "" b`. The three throwing cases:

```sh
node --input-type=module -e 'import { slugify as s } from "detent-demo"; for (const f of [() => s("Hello brave", { separator: "" }), () => s("x", null), () => s("ab", { maxLength: Infinity })]) { try { f() } catch (e) { console.log(e.name) } }'
```

It prints `SyntaxError`, `TypeError` and `RangeError`, in that order.
