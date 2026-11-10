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

test("treats maxLength: null as no cap", () => {
  assert.equal(slugify("Hello brave new world", { maxLength: null }), "hello-brave-new-world");
});

test("rejects a separator that can appear inside a word when maxLength is set", () => {
  for (const separator of ["", "a", "x1"]) {
    assert.throws(() => slugify("Hello brave", { separator, maxLength: 7 }), RangeError, JSON.stringify(separator));
  }
});

test("rejects Infinity as maxLength", () => {
  assert.throws(() => slugify("Hello World", { maxLength: Infinity }), RangeError);
});

test("keeps the result within maxLength, without a trailing separator, as a prefix of the uncapped slug", () => {
  const titles = ["Hello brave new world", "ab cd ef gh", "Supercalifragilistic expialidocious", "a b c d e f g", "One"];
  for (const separator of ["-", "--", "_"]) {
    for (const title of titles) {
      const uncapped = slugify(title, { separator });
      for (let maxLength = 1; maxLength <= 25; maxLength++) {
        const label = `${JSON.stringify(title)} separator ${JSON.stringify(separator)} maxLength ${maxLength}`;
        const result = slugify(title, { separator, maxLength });
        assert.ok(result.length <= maxLength, `too long: ${label}`);
        assert.ok(!result.endsWith(separator), `trailing separator: ${label}`);
        assert.ok(uncapped.startsWith(result), `not a prefix: ${label}`);
        const wholeWords = result === uncapped || uncapped.startsWith(separator, result.length);
        const firstWordCut = uncapped.split(separator)[0].length > maxLength;
        assert.ok(wholeWords || firstWordCut, `splits a word: ${label}`);
      }
    }
  }
});

test("treats separator: null as the default dash", () => {
  assert.equal(slugify("Hello World", { separator: null }), "hello-world");
});

test("caps accented and mixed-case titles into a URL-safe prefix of the uncapped slug", () => {
  for (const title of ["Crème Brûlée au chocolat", "HELLO Brave NEW world"]) {
    const uncapped = slugify(title);
    for (let maxLength = 1; maxLength <= 25; maxLength++) {
      const result = slugify(title, { maxLength });
      const label = `${JSON.stringify(title)} maxLength ${maxLength}`;
      assert.match(result, /^[a-z0-9]+(-[a-z0-9]+)*$/, `not URL-safe: ${label}`);
      assert.ok(result.length <= maxLength, `too long: ${label}`);
      assert.ok(uncapped.startsWith(result), `not a prefix: ${label}`);
    }
  }
});

test("matches the 0.1.0 output for calls without maxLength", () => {
  const cases = [
    ["Hello World", {}, "hello-world"],
    ["Crème Brûlée", {}, "creme-brulee"],
    ["  --Hello,   World!--  ", {}, "hello-world"],
    ["Hello World", { separator: "_" }, "hello_world"],
    ["Hello World", { separator: "." }, "hello.world"],
    ["Hello World", { separator: "+" }, "hello+world"],
    ["a b c", { separator: "*" }, "a*b*c"],
    ["Hello brave new world", { separator: "$&" }, "hello brave new world"],
    ["Hello brave new world", { separator: "a" }, "helloabraveanewaworld"],
    ["Straße Søren", {}, "stra-e-s-ren"],
    ["Привет мир", {}, ""],
    ["Don't stop", {}, "don-t-stop"],
    ["Ünïcödé ÀÉÎ 123", {}, "unicode-aei-123"],
    ["", {}, ""],
    ["!!!", {}, ""],
  ];
  for (const [input, options, expected] of cases) {
    assert.equal(slugify(input, options), expected, JSON.stringify([input, options]));
  }
});

test("treats regex characters in the separator as literal text", () => {
  for (const separator of [".", "+", "*"]) {
    assert.equal(slugify("a b c", { separator }), `a${separator}b${separator}c`);
    assert.equal(slugify("Hello brave new world", { separator, maxLength: 13 }), `hello${separator}brave`);
  }
});
