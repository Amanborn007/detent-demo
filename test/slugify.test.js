import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../src/index.js";

test("lowercases and joins words with dashes", () => {
  assert.equal(slugify("Hello World"), "hello-world");
});

test("strips accents", () => {
  assert.equal(slugify("Crème Brûlée"), "creme-brulee");
});

test("collapses runs of punctuation and trims the ends", () => {
  assert.equal(slugify("  --Hello,   World!--  "), "hello-world");
});

test("honours a custom separator", () => {
  assert.equal(slugify("Hello World", { separator: "_" }), "hello_world");
});

test("rejects non-strings", () => {
  assert.throws(() => slugify(42), TypeError);
});

test("rejects a maxLength below 1 or not an integer", () => {
  for (const maxLength of [0, -1, 2.5, "10", Number.NaN]) {
    assert.throws(() => slugify("Hello World", { maxLength }), RangeError, String(maxLength));
  }
});
