/**
 * Template Schema Tests
 *
 * Ensures custom template parsing is resilient and defaults are applied.
 *
 * @author Gobinda Nandi <gobinda.nandi.public@gmail.com>
 * @since 1.0.0
 * @version 1.0.0
 * @copyright (c) 2026 Gobinda Nandi
 */

import test from "node:test";
import assert from "node:assert/strict";
import { parseTemplate } from "../templates/schema";

test("parseTemplate returns undefined for invalid input", () => {
  assert.equal(parseTemplate(null), undefined);
  assert.equal(parseTemplate("hello"), undefined);
  assert.equal(parseTemplate({}), undefined);
});

test("parseTemplate normalizes partial templates", () => {
  const parsed = parseTemplate({
    name: "sql-in",
    inputMode: "delimited",
    split: { delimiters: [",", ";"] },
    output: {
      delimiter: ",",
      quote: "single",
      wrapStart: "(",
      wrapEnd: ")"
    }
  });

  assert.ok(parsed);
  assert.equal(parsed.name, "sql-in");
  assert.equal(parsed.inputMode, "delimited");
  assert.deepEqual(parsed.split.delimiters, [",", ";"]);
  assert.equal(parsed.output.quote, "single");
  assert.equal(parsed.output.wrapStart, "(");
  assert.equal(parsed.output.wrapEnd, ")");
  assert.equal(parsed.trimItems, true);
  assert.equal(parsed.dropEmpty, true);
});
