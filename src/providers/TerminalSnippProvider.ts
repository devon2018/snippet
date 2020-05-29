import * as vscode from "vscode";
import Snipp from "../interfaces/snipp";

export class TerminalSnippModel {
  constructor(
    readonly view: string,
    private context: vscode.ExtensionContext
  ) {}

  public get roots(): Thenable<Snipp[]> {
    const snipps = this.context?.globalState?.get("terminal_snipps", []);
    return Promise.resolve(snipps);
  }

  public getContent(resource: vscode.Uri): Thenable<string> {
    return Promise.resolve("");
  }
}

export class TerminalSnippProvider
  implements
    vscode.TreeDataProvider<Snipp>,
    vscode.TextDocumentContentProvider {
  private _onDidChangeTreeData: vscode.EventEmitter<
    any
  > = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData
    .event;

  constructor(
    private readonly model: TerminalSnippModel,
    private context: vscode.ExtensionContext
  ) {}

  public refresh(): any {
    this._onDidChangeTreeData.fire(null);
  }

  public getTreeItem(element: Snipp): vscode.TreeItem {
    const t = element.name;

    const snippcomm = {
      command: "terminalSnipps.insertEntry",
      title: "",
      arguments: [element],
    };

    return {
      label: element.name,
      command: snippcomm,
    };
  }

  public getChildren(element?: Snipp): Snipp[] | Thenable<Snipp[]> {
    return this.model.roots;
  }

  public provideTextDocumentContent(
    uri: vscode.Uri,
    token?: vscode.CancellationToken
  ): vscode.ProviderResult<string> {
    return this.model.getContent(uri).then((content) => {
      return content;
    });
  }
}

export class TerminalSnippExplorer {
  private snippViewer: vscode.TreeView<Snipp>;

  constructor(context: vscode.ExtensionContext) {
    const snippModel = new TerminalSnippModel("recent", context);

    const snippDataProvider = new TerminalSnippProvider(snippModel, context);

    this.snippViewer = vscode.window.createTreeView("terminalSnipps", {
      treeDataProvider: snippDataProvider,
    });

    vscode.commands.registerCommand("terminalSnipps.refreshEntry", () => {
      snippDataProvider.refresh();
    });

    vscode.commands.registerCommand(
      "terminalSnipps.insertEntry",
      (snipp: Snipp) => {
        if (vscode.window.activeTerminal) {
          vscode.window.activeTerminal.show();
          vscode.window.activeTerminal.sendText(snipp.content);
        } else {
          vscode.window.showErrorMessage(
            `Please open a terminal instance to insert this snippet.`
          );
        }
      }
    );
  }
}
