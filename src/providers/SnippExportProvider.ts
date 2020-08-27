"use strict";

import * as vscode from "vscode";
import Snipp from "../interfaces/snipp";
// const path = require("path");
// const cjson = require("cjson");
// const fs = require("fs");

export default class SnippetExportProvider
  implements vscode.TextDocumentContentProvider {
  private snipps: Snipp[];

  constructor(context: vscode.ExtensionContext) {
    this.snipps = context?.globalState?.get("snipps", []);
  }
  /**
   *
   * @param {vscode.Uri} uri - a fake uri
   * @returns {string} - settings read from the JSON file
   **/
  public provideTextDocumentContent(uri: vscode.Uri): string {
    // console.log();
    // let settingsFilePath = "/path/to/settings/file/settings.json";
    let returnString = { test: "testing" };

    // // read settings file
    // if (fs.existsSync(settingsFilePath)) {
    //   returnString = cjson.load(settingsFilePath);
    // }

    // return JSON object as a string
    return JSON.stringify(this.snipps, null, 4) || ""; // prettify and return
  }
}
