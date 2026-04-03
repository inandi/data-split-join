/**
 * Template Settings Store
 *
 * Handles reading/writing custom templates from VS Code configuration targets.
 * Parsing and validation are delegated to schema utilities.
 *
 * @author Gobinda Nandi <gobinda.nandi.public@gmail.com>
 * @since 1.0.0
 * @version 1.0.0
 * @copyright (c) 2026 Gobinda Nandi
 */

import * as vscode from "vscode";
import { FormatTemplate } from "../transform/engine";
import {
  normalizeTemplates,
  ScopedTemplate,
  TemplateScope
} from "./schema";

const CUSTOM_TEMPLATES_KEY = "quickListFormat.customTemplates";

/**
 * Returns merged scoped templates from workspace and global settings.
 */
export async function getScopedTemplates(): Promise<ScopedTemplate[]> {
  const config = vscode.workspace.getConfiguration();
  const workspaceRaw = config.inspect<unknown[]>(CUSTOM_TEMPLATES_KEY)
    ?.workspaceValue;
  const globalRaw = config.inspect<unknown[]>(CUSTOM_TEMPLATES_KEY)?.globalValue;

  return [
    ...normalizeTemplates(workspaceRaw, "workspace"),
    ...normalizeTemplates(globalRaw, "global")
  ];
}

/**
 * Upserts a custom template in the selected configuration scope.
 */
export async function saveTemplate(
  template: FormatTemplate,
  scope: TemplateScope
): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  const inspection = config.inspect<unknown[]>(CUSTOM_TEMPLATES_KEY);
  const raw = scope === "workspace" ? inspection?.workspaceValue : inspection?.globalValue;
  const templates = normalizeTemplates(raw, scope).map((item) => item.template);
  const existingIdx = templates.findIndex((item) => item.name === template.name);

  if (existingIdx >= 0) {
    templates[existingIdx] = template;
  } else {
    templates.push(template);
  }

  await config.update(
    CUSTOM_TEMPLATES_KEY,
    templates,
    scope === "global"
      ? vscode.ConfigurationTarget.Global
      : vscode.ConfigurationTarget.Workspace
  );
}

/**
 * Deletes a custom template by name from the selected configuration scope.
 */
export async function deleteTemplate(
  templateName: string,
  scope: TemplateScope
): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  const inspection = config.inspect<unknown[]>(CUSTOM_TEMPLATES_KEY);
  const raw = scope === "workspace" ? inspection?.workspaceValue : inspection?.globalValue;
  const templates = normalizeTemplates(raw, scope)
    .map((item) => item.template)
    .filter((item) => item.name !== templateName);

  await config.update(
    CUSTOM_TEMPLATES_KEY,
    templates,
    scope === "global"
      ? vscode.ConfigurationTarget.Global
      : vscode.ConfigurationTarget.Workspace
  );
}

export type { ScopedTemplate, TemplateScope };
