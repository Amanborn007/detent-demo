import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../src/index.js";

test("known limit: non-Latin scripts are dropped", () => {
  assert.equal(slugify("Привет мир"), "");
  assert.equal(slugify("日本語"), "");
});

test("known limit: empty and punctuation-only input return an empty string", () => {
  assert.equal(slugify(""), "");
  assert.equal(slugify("!!!"), "");
});

test("known limit: letters with no NFKD decomposition are lost or split", () => {
  assert.equal(slugify("Straße"), "stra-e");
  assert.equal(slugify("Søren"), "s-ren");
  assert.equal(slugify("Łódź"), "odz");
});

test("known limit: an apostrophe splits a word", () => {
  assert.equal(slugify("Don't stop"), "don-t-stop");
});

test("known limit: the separator is not validated without maxLength", () => {
  assert.throws(() => slugify("Hello brave", { separator: "" }), SyntaxError);
  assert.equal(slugify("a b", { separator: "a" }), "b");
});

test("known limit: null options throws TypeError", () => {
  assert.throws(() => slugify("x", null), TypeError);
});
