import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class SnippProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Dependency | undefined
  > = new vscode.EventEmitter<Dependency | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this
    ._onDidChangeTreeData.event;

  constructor(
    private workspaceRoot: string,
    private context: vscode.ExtensionContext
  ) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    interface Snipp {
      name: string;
      tags: string[];
      content: string | null;
      contentType: string | null;
    }
    return Promise.resolve(this.context?.globalState?.get("snipps", []).map((snipp: Snipp) => (new Dependency(snipp.name, "1.3", 1))));
  }
}

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}-${this.version}`;
  }

  get description(): string {
    return this.version;
  }

  // iconPath = {
  //   light: path.join(
  //     __filename,
  //     "..",
  //     "..",
  //     "..",
  //     "resources",
  //     "dependency.svg"
  //   ),
  //   dark: path.join(
  //     __filename,
  //     "..",
  //     "..",

  //     "..",
  //     "resources",
  //     "dependency.svg"
  //   )
  // };

  // contextValue = "createSnipp";
}
