/**
 * Built-in Template Definitions
 *
 * Declares default formatter presets surfaced in the context menu.
 *
 * @author Gobinda Nandi <gobinda.nandi.public@gmail.com>
 * @since 1.0.0
 * @version 1.0.0
 * @copyright (c) 2026 Gobinda Nandi
 */

import { BASE_TEMPLATE, FormatTemplate } from "../transform/engine";

export type BuiltInTemplateId =
  | "joinComma"
  | "joinSemicolon"
  | "joinSingleQuotedComma"
  | "joinDoubleQuotedSemicolon"
  | "splitToLines";

export interface BuiltInTemplate {
  id: BuiltInTemplateId;
  template: FormatTemplate;
}

/**
 * Helper to merge template overrides with the shared base defaults.
 */
function template(
  name: string,
  overrides: Partial<FormatTemplate>
): FormatTemplate {
  return {
    ...BASE_TEMPLATE,
    ...overrides,
    name,
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

/**
 * All built-in formatter templates available out of the box.
 */
export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: "joinComma",
    template: template("Join With Comma", {
      inputMode: "auto",
      output: {
        delimiter: ",",
        quote: "none",
        prefix: "",
        suffix: "",
        wrapStart: "",
        wrapEnd: ""
      }
    })
  },
  {
    id: "joinSemicolon",
    template: template("Join With Semicolon", {
      inputMode: "auto",
      output: {
        delimiter: ";",
        quote: "none",
        prefix: "",
        suffix: "",
        wrapStart: "",
        wrapEnd: ""
      }
    })
  },
  {
    id: "joinSingleQuotedComma",
    template: template("Join As Single-Quoted CSV", {
      inputMode: "auto",
      output: {
        delimiter: ",",
        quote: "single",
        prefix: "",
        suffix: "",
        wrapStart: "",
        wrapEnd: ""
      }
    })
  },
  {
    id: "joinDoubleQuotedSemicolon",
    template: template("Join As Double-Quoted Semicolon", {
      inputMode: "auto",
      output: {
        delimiter: ";",
        quote: "double",
        prefix: "",
        suffix: "",
        wrapStart: "",
        wrapEnd: ""
      }
    })
  },
  {
    id: "splitToLines",
    template: template("Split To New Lines", {
      inputMode: "delimited",
      split: {
        delimiters: [",", ";", "\n", "\t"]
      },
      output: {
        delimiter: "\n",
        quote: "none",
        prefix: "",
        suffix: "",
        wrapStart: "",
        wrapEnd: ""
      }
    })
  }
];

/**
 * Returns one built-in template by identifier.
 */
export function getBuiltInTemplate(id: BuiltInTemplateId): FormatTemplate {
  const found = BUILT_IN_TEMPLATES.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown built-in template: ${id}`);
  }
  return found.template;
}
