/**
 * Turn arbitrary text into a URL-safe slug.
 * @param {string} input
 * @param {{ separator?: string }} [options]
 * @returns {string}
 */
export function slugify(input, options = {}) {
  if (typeof input !== "string") {
    throw new TypeError("slugify expects a string");
  }
  const separator = options.separator ?? "-";
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${escape(separator)}+|${escape(separator)}+$`, "g"), "");
}

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
