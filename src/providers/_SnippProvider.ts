import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class SnippProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Dependency | undefined
  > = new vscode.EventEmitter<Dependency | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined> = this
    ._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

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
    const snipps = this.context?.globalState?.get("snipps", []);
    return Promise.resolve(
      snipps.map((snipp: Snipp) => new Dependency(snipp.name, 1))
    );
  }
}

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}`;
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
