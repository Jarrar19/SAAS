import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes rich text HTML content from TipTap or manual input.
 * Strictly strips dangerous tags (<script>, <iframe>, <object>, etc.)
 * and malicious attributes (onerror, onload, onclick, javascript: links)
 * to neutralize XSS vulnerabilities prior to database storage.
 */
export function sanitizeContent(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") {
    return "";
  }

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "p", "a", "ul", "ol",
      "li", "b", "i", "strong", "em", "strike", "code", "hr", "br", "div",
      "table", "thead", "tbody", "tr", "th", "td", "pre", "img", "span", "s", "u"
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
  });
}
