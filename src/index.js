/**
 * Turn arbitrary text into a URL-safe slug.
 * @param {string} input
 * @param {{ separator?: string, maxLength?: number | null }} [options]
 *   `maxLength` caps the result at the last separator that fits. A first word
 *   longer than `maxLength` is the one case that gets cut mid-word.
 *   It must be an integer of at least 1; `null` or omitted means no cap.
 *   With `maxLength`, the separator must contain no letters or digits.
 * @returns {string}
 */
export function slugify(input, options = {}) {
  if (typeof input !== "string") {
    throw new TypeError("slugify expects a string");
  }
  const maxLength = options.maxLength ?? undefined;
  if (maxLength !== undefined && !(Number.isInteger(maxLength) && maxLength >= 1)) {
    throw new RangeError("maxLength must be an integer of at least 1");
  }
  const separator = options.separator ?? "-";
  // Slug words are [a-z0-9], so a separator made of those cannot mark a word boundary.
  if (maxLength !== undefined && !/^[^a-z0-9]+$/.test(separator)) {
    throw new RangeError("maxLength needs a separator with no letters or digits");
  }
  const slug = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${escape(separator)}+|${escape(separator)}+$`, "g"), "");
  if (maxLength === undefined || slug.length <= maxLength) return slug;
  const cut = slug.lastIndexOf(separator, maxLength);
  if (cut > 0) return slug.slice(0, cut);
  return slug.split(separator)[0].slice(0, maxLength);
}

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
