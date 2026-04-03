/**
 * Engine Tests
 *
 * Verifies core transform behaviors in the pure formatting engine.
 *
 * @author Gobinda Nandi <gobinda.nandi.public@gmail.com>
 * @since 1.0.0
 * @version 1.0.0
 * @copyright (c) 2026 Gobinda Nandi
 */

import test from "node:test";
import assert from "node:assert/strict";
import { BASE_TEMPLATE, formatText, FormatTemplate } from "../transform/engine";

/**
 * Builds a full template object from partial test overrides.
 */
function withOverrides(overrides: Partial<FormatTemplate>): FormatTemplate {
  return {
    ...BASE_TEMPLATE,
    ...overrides,
    name: "test-template",
    split: {
      ...BASE_TEMPLATE.split,
      ...(overrides.split ?? {})
    },
    output: {
      ...BASE_TEMPLATE.output,
      ...(overrides.output ?? {})
    }
  };
}

test("joins lines with comma", () => {
  const template = withOverrides({
    inputMode: "lines",
    output: { delimiter: ",", quote: "none", prefix: "", suffix: "", wrapStart: "", wrapEnd: "" }
  });
  const result = formatText("1\n2\n3", template);
  assert.equal(result, "1,2,3");
});

test("splits mixed delimiters to lines", () => {
  const template = withOverrides({
    inputMode: "delimited",
    split: { delimiters: [",", ";", "\n"] },
    output: {
      delimiter: "\n",
      quote: "none",
      prefix: "",
      suffix: "",
      wrapStart: "",
      wrapEnd: ""
    }
  });
  const result = formatText("1, 2;3\n4", template);
  assert.equal(result, "1\n2\n3\n4");
});

test("quotes with single quotes", () => {
  const template = withOverrides({
    inputMode: "lines",
    output: {
      delimiter: ",",
      quote: "single",
      prefix: "",
      suffix: "",
      wrapStart: "",
      wrapEnd: ""
    }
  });
  const result = formatText("a\nb", template);
  assert.equal(result, "'a','b'");
});

test("applies prefix and suffix", () => {
  const template = withOverrides({
    inputMode: "lines",
    output: {
      delimiter: ",",
      quote: "none",
      prefix: "file-",
      suffix: ".txt",
      wrapStart: "",
      wrapEnd: ""
    }
  });
  const result = formatText("1\n2", template);
  assert.equal(result, "file-1.txt,file-2.txt");
});

test("removes empty items and de-duplicates", () => {
  const template = withOverrides({
    inputMode: "delimited",
    split: { delimiters: [","] },
    trimItems: true,
    dropEmpty: true,
    dedupe: true,
    output: {
      delimiter: ",",
      quote: "none",
      prefix: "",
      suffix: "",
      wrapStart: "",
      wrapEnd: ""
    }
  });
  const result = formatText("a, a, ,b,a", template);
  assert.equal(result, "a,b");
});
