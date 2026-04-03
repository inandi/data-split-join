/**
 * Text Transformation Engine
 *
 * Contains the normalized template model and pure formatting pipeline used by
 * Data Split-Join commands. This module is UI-agnostic and safe for unit tests.
 *
 * @author Gobinda Nandi <gobinda.nandi.public@gmail.com>
 * @since 1.0.0
 * @version 1.0.0
 * @copyright (c) 2026 Gobinda Nandi
 */

export type InputMode = "auto" | "lines" | "delimited";
export type QuoteMode = "none" | "single" | "double";
export type SortMode = "none" | "asc" | "desc";

export interface SplitConfig {
  delimiters: string[];
}

export interface OutputConfig {
  delimiter: string;
  quote: QuoteMode;
  prefix: string;
  suffix: string;
  wrapStart: string;
  wrapEnd: string;
}

export interface FormatTemplate {
  name: string;
  inputMode: InputMode;
  split: SplitConfig;
  trimItems: boolean;
  dropEmpty: boolean;
  dedupe: boolean;
  sort: SortMode;
  output: OutputConfig;
}

/**
 * Default template baseline used by built-ins and custom-template normalization.
 */
export const BASE_TEMPLATE: Omit<FormatTemplate, "name"> = {
  inputMode: "auto",
  split: {
    delimiters: [",", ";", "\n", "\t"]
  },
  trimItems: true,
  dropEmpty: true,
  dedupe: false,
  sort: "none",
  output: {
    delimiter: ",",
    quote: "none",
    prefix: "",
    suffix: "",
    wrapStart: "",
    wrapEnd: ""
  }
};

/**
 * Formats raw input text according to the provided template.
 */
export function formatText(input: string, template: FormatTemplate): string {
  const items = parseInput(input, template);
  const normalized = normalizeItems(items, template);
  return renderOutput(normalized, template);
}

/**
 * Splits input into item tokens based on selected input mode.
 */
function parseInput(input: string, template: FormatTemplate): string[] {
  const source = input.replace(/\r\n/g, "\n");

  if (template.inputMode === "lines") {
    return source.split("\n");
  }

  if (template.inputMode === "delimited") {
    return splitByDelimiters(source, template.split.delimiters);
  }

  const hasNewLine = source.includes("\n");
  if (hasNewLine) {
    return source.split("\n");
  }

  return splitByDelimiters(source, template.split.delimiters);
}

/**
 * Splits text by multiple delimiter tokens.
 */
function splitByDelimiters(input: string, delimiters: string[]): string[] {
  const effectiveDelimiters = delimiters.length > 0 ? delimiters : [","];
  const escaped = effectiveDelimiters.map((token) => escapeRegex(token));
  const splitter = new RegExp(escaped.join("|"), "g");
  return input.split(splitter);
}

/**
 * Applies cleanup steps (trim, quote-strip, drop-empty, dedupe, sort).
 */
function normalizeItems(items: string[], template: FormatTemplate): string[] {
  let next = items.map((item) => item.replace(/\r/g, ""));

  if (template.trimItems) {
    next = next.map((item) => item.trim());
  }

  next = next.map(stripMatchingQuotes);

  if (template.dropEmpty) {
    next = next.filter((item) => item.length > 0);
  }

  if (template.dedupe) {
    const seen = new Set<string>();
    next = next.filter((item) => {
      if (seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    });
  }

  if (template.sort === "asc") {
    next = [...next].sort((a, b) => a.localeCompare(b));
  } else if (template.sort === "desc") {
    next = [...next].sort((a, b) => b.localeCompare(a));
  }

  return next;
}

/**
 * Builds final output by composing item-level transforms and join delimiter.
 */
function renderOutput(items: string[], template: FormatTemplate): string {
  const rendered = items.map((item) => {
    const quoted = applyQuote(item, template.output.quote);
    return `${template.output.prefix}${quoted}${template.output.suffix}`;
  });

  return `${template.output.wrapStart}${rendered.join(
    template.output.delimiter
  )}${template.output.wrapEnd}`;
}

/**
 * Applies configured quote mode to a single token.
 */
function applyQuote(value: string, quoteMode: QuoteMode): string {
  if (quoteMode === "single") {
    return `'${value}'`;
  }
  if (quoteMode === "double") {
    return `"${value}"`;
  }
  return value;
}

/**
 * Removes matching surrounding single or double quotes from a token.
 */
function stripMatchingQuotes(value: string): string {
  if (value.length < 2) {
    return value;
  }

  const startsSingle = value.startsWith("'");
  const endsSingle = value.endsWith("'");
  if (startsSingle && endsSingle) {
    return value.slice(1, -1);
  }

  const startsDouble = value.startsWith('"');
  const endsDouble = value.endsWith('"');
  if (startsDouble && endsDouble) {
    return value.slice(1, -1);
  }

  return value;
}

/**
 * Escapes regex metacharacters for delimiter-safe pattern creation.
 */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
