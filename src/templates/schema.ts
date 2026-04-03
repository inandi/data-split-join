/**
 * Template Schema Utilities
 *
 * Provides parsing and normalization utilities for custom templates loaded from
 * VS Code settings JSON (workspace/global scopes).
 *
 * @author Gobinda Nandi <gobinda.nandi.public@gmail.com>
 * @since 1.0.0
 * @version 1.0.0
 * @copyright (c) 2026 Gobinda Nandi
 */

import {
  BASE_TEMPLATE,
  FormatTemplate,
  InputMode,
  OutputConfig,
  QuoteMode,
  SortMode
} from "../transform/engine";

export type TemplateScope = "workspace" | "global";

export interface ScopedTemplate {
  scope: TemplateScope;
  template: FormatTemplate;
}

/**
 * Converts raw settings array values into validated scoped templates.
 */
export function normalizeTemplates(
  raw: unknown,
  scope: TemplateScope
): ScopedTemplate[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const normalized: ScopedTemplate[] = [];
  for (const item of raw) {
    const template = parseTemplate(item);
    if (template) {
      normalized.push({ scope, template });
    }
  }
  return normalized;
}

/**
 * Parses one unknown object into a typed formatter template.
 */
export function parseTemplate(raw: unknown): FormatTemplate | undefined {
  if (typeof raw !== "object" || raw === null) {
    return undefined;
  }

  const source = raw as Record<string, unknown>;
  const name = asString(source.name);
  if (!name) {
    return undefined;
  }

  const inputMode = asInputMode(source.inputMode) ?? BASE_TEMPLATE.inputMode;
  const trimItems = asBoolean(source.trimItems, BASE_TEMPLATE.trimItems);
  const dropEmpty = asBoolean(source.dropEmpty, BASE_TEMPLATE.dropEmpty);
  const dedupe = asBoolean(source.dedupe, BASE_TEMPLATE.dedupe);
  const sort = asSortMode(source.sort) ?? BASE_TEMPLATE.sort;

  const split = parseSplit(source.split);
  const output = parseOutput(source.output);

  return {
    name,
    inputMode,
    split,
    trimItems,
    dropEmpty,
    dedupe,
    sort,
    output
  };
}

/**
 * Parses split configuration with safe defaults.
 */
function parseSplit(raw: unknown): { delimiters: string[] } {
  if (typeof raw !== "object" || raw === null) {
    return { ...BASE_TEMPLATE.split };
  }

  const obj = raw as Record<string, unknown>;
  const delimiters = Array.isArray(obj.delimiters)
    ? obj.delimiters.filter((item): item is string => typeof item === "string")
    : BASE_TEMPLATE.split.delimiters;

  return {
    delimiters: delimiters.length > 0 ? delimiters : [...BASE_TEMPLATE.split.delimiters]
  };
}

/**
 * Parses output configuration with safe defaults.
 */
function parseOutput(raw: unknown): OutputConfig {
  if (typeof raw !== "object" || raw === null) {
    return { ...BASE_TEMPLATE.output };
  }

  const obj = raw as Record<string, unknown>;
  return {
    delimiter: asString(obj.delimiter) ?? BASE_TEMPLATE.output.delimiter,
    quote: asQuoteMode(obj.quote) ?? BASE_TEMPLATE.output.quote,
    prefix: asString(obj.prefix) ?? BASE_TEMPLATE.output.prefix,
    suffix: asString(obj.suffix) ?? BASE_TEMPLATE.output.suffix,
    wrapStart: asString(obj.wrapStart) ?? BASE_TEMPLATE.output.wrapStart,
    wrapEnd: asString(obj.wrapEnd) ?? BASE_TEMPLATE.output.wrapEnd
  };
}

/**
 * Returns string value when present.
 */
function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Returns boolean value when present, otherwise fallback.
 */
function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/**
 * Type guard/converter for input mode enum values.
 */
function asInputMode(value: unknown): InputMode | undefined {
  return value === "auto" || value === "lines" || value === "delimited"
    ? value
    : undefined;
}

/**
 * Type guard/converter for sort mode enum values.
 */
function asSortMode(value: unknown): SortMode | undefined {
  return value === "none" || value === "asc" || value === "desc"
    ? value
    : undefined;
}

/**
 * Type guard/converter for quote mode enum values.
 */
function asQuoteMode(value: unknown): QuoteMode | undefined {
  return value === "none" || value === "single" || value === "double"
    ? value
    : undefined;
}
