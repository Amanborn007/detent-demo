# detent-demo

A slugify library with no dependencies (`src/index.js`, 38 lines). It is the target repo of the [Detent](https://github.com/Amanborn007/detent) worked example.

## The problem

Detent's README puts it this way: "Left alone, an agent can spend an hour building the wrong thing and then push it. Detent stops it twice." This repo is small enough to check that on one run, end to end. [Issue #1](https://github.com/Amanborn007/detent-demo/issues/1) asked for a `maxLength` option, and [PR #2](https://github.com/Amanborn007/detent-demo/pull/2) is what one Detent run produced from it. The goal in the run's [brief](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/brief.md) is "Callers can cap how long a slug gets, and the cap never leaves a half word or a dangling separator."

The nine rules and the test behind each are in [docs/testing.md](docs/testing.md). The decisions, the false starts and the possible next changes are in [docs/decisions.md](docs/decisions.md).

## Run it

You need Node 20 or later. There are no dependencies, so there is no install step.

```sh
git clone https://github.com/Amanborn007/detent-demo.git
cd detent-demo
npm test
```

`npm test` reports `# pass 13` and `# fail 0` (Node v20.20.2, 2026-11-10). To try it, run this from the repo root:

```sh
node --input-type=module -e 'import { slugify } from "detent-demo"; console.log(slugify("Crème Brûlée"), slugify("Hello brave new world", { maxLength: 13 }))'
```

It prints `creme-brulee hello-brave`. The package is not on npm, so elsewhere import `/path/to/detent-demo/src/index.js` by path.

## Not tested

`options` set to `null`, non-Latin input and empty input. `Infinity` throws `RangeError` but no test pins it.

## Known limitations

Measured against `src/index.js` on 2026-11-10. The commands to reproduce them are in [docs/testing.md](docs/testing.md#reproduce-the-known-limits).

- Non-Latin scripts are dropped. `"Привет мир"` and `"日本語"` both return `""`. Empty or punctuation-only input also returns `""` with no error.
- Letters with no NFKD decomposition are lost or split. `Straße` returns `stra-e`, `Søren` returns `s-ren` and `Łódź` returns `odz`.
- Apostrophes split words. `Don't stop` returns `don-t-stop`.
- Separator validation only runs with `maxLength`. Without it, `separator: ""` throws a regex `SyntaxError` instead of a clear error, and `separator: "a"` turns `"a b"` into `"b"`.
- `slugify(s, null)` throws `TypeError`. Only an `undefined` second argument defaults to `{}`.
- There is no CI. Tests run locally only.

## License

MIT, see [LICENSE](LICENSE).
