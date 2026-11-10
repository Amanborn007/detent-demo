# Changelog

## 0.2.0

Adds the `maxLength` option to `slugify`, from [issue #1](https://github.com/Amanborn007/detent-demo/issues/1), merged in [PR #2](https://github.com/Amanborn007/detent-demo/pull/2) on 2026-10-21. `maxLength: null` means no cap. With `maxLength` set, a separator that is empty or contains a lowercase letter or digit throws `RangeError`. The version was set to 0.2.0 after the merge.

## 0.1.0

The first version, commit `ab71561` (2026-10-20): `slugify` with a custom `separator` and 5 tests.
