"use strict";

import * as vscode from "vscode";
import Snipp from "../interfaces/snipp";

export default class SnippetExportProvider
  implements vscode.TextDocumentContentProvider
{
  private snipps: Snipp[];

  constructor(context: vscode.ExtensionContext, isTerminal?: boolean) {
    if (isTerminal) {
      this.snipps = context?.globalState?.get("terminal_snipps", []);
    } else {
      this.snipps = context?.globalState?.get("snipps", []);
    }
  }
  /**
   *
   * @param {vscode.Uri} uri - a fake uri
   * @returns {string} - settings read from the JSON file
   **/
  public provideTextDocumentContent(uri: vscode.Uri): string {
    let returnString = { test: "testing" };
    return JSON.stringify(this.snipps, null, 4) || ""; // prettify and return
  }
}
