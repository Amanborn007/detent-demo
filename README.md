# detent-demo

A slugify library with no dependencies (`src/index.js`, 38 lines). [Detent](https://github.com/Amanborn007/detent) is a tool that runs a coding agent through fixed stages and pauses for human answers. It used this repo as the target of one recorded run.

## The problem

[Issue #1](https://github.com/Amanborn007/detent-demo/issues/1) asked for a `maxLength` option because long titles make long slugs. [PR #2](https://github.com/Amanborn007/detent-demo/pull/2) is what the run produced. The run recorded seven decisions, and two of them changed what `slugify` does. Before implementing, it asked what `maxLength: null` means (D-001), and I chose "no cap". Before shipping, the reviewer found that a separator such as `a` can split a word (D-007), and I chose to fix it in the PR. Both are in the run's [decisions.json](https://github.com/Amanborn007/detent/blob/main/docs/examples/2026-10-20-amanborn007-detent-demo-1/decisions.json).

## Run it

You need Node 20 or later. There are no dependencies, so there is no install step.

```sh
git clone https://github.com/Amanborn007/detent-demo.git
cd detent-demo
npm test
```

`npm test` reports `# pass 21` and `# fail 0` (Node v20.20.2, 2026-11-10). To try it, run this from the repo root:

```sh
node --input-type=module -e 'import { slugify } from "detent-demo"; console.log(slugify("Crème Brûlée"), slugify("Hello brave new world", { maxLength: 13 }))'
```

It prints `creme-brulee hello-brave`. The package is not on npm, so elsewhere import `/path/to/detent-demo/src/index.js` by path.

## Tests, limits and decisions

[docs/testing.md](docs/testing.md) lists each rule with its test, and the known limits, each pinned by a test. The limit most callers will hit is that non-Latin input such as `Привет мир` returns `""` with no error. [docs/decisions.md](docs/decisions.md) has the decisions, the false starts and the possible next changes.

## License

MIT, see [LICENSE](LICENSE).
