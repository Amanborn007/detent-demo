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

test("caps the length by cutting at the last separator that fits", () => {
  assert.equal(slugify("Hello brave new world", { maxLength: 13 }), "hello-brave");
  assert.equal(slugify("Hello brave new world", { maxLength: 11 }), "hello-brave");
});

test("never leaves a trailing separator after the cut", () => {
  assert.equal(slugify("Hello brave new world", { maxLength: 12 }), "hello-brave");
});

test("cuts a first word that is longer than maxLength", () => {
  assert.equal(slugify("Supercalifragilistic expialidocious", { maxLength: 5 }), "super");
});

test("never splits a multi-character separator", () => {
  assert.equal(slugify("ab cd ef", { separator: "--", maxLength: 7 }), "ab--cd");
  assert.equal(slugify("ab cd", { separator: "--", maxLength: 3 }), "ab");
});

test("leaves output unchanged when maxLength is not given or not needed", () => {
  assert.equal(slugify("Hello brave new world"), "hello-brave-new-world");
  assert.equal(slugify("Hello World", { maxLength: 50 }), "hello-world");
});
