import * as vscode from "vscode";
import Snipp from "../interfaces/snipp";
import editTerminalSnippWebviewContent from "../components/edit_terminal_snipp";

export class TerminalSnippModel {
  constructor(
    readonly view: string,
    private context: vscode.ExtensionContext
  ) {}

  public get roots(): Thenable<Snipp[]> {
    const snipps = this.context?.globalState
      ?.get("terminal_snipps", [])
      .sort((a: Snipp, b: Snipp) => a.name.localeCompare(b.name));
    return Promise.resolve(snipps);
  }

  public getContent(resource: vscode.Uri): Thenable<string> {
    return Promise.resolve("");
  }
}

export class TerminalSnippProvider
  implements vscode.TreeDataProvider<Snipp>, vscode.TextDocumentContentProvider
{
  private _onDidChangeTreeData: vscode.EventEmitter<any> =
    new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> =
    this._onDidChangeTreeData.event;

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

    /**
     * Removes a terminal snippet from storage
     */
    vscode.commands.registerCommand(
      "terminalSnipps.deleteEntry",
      (snippToDelete: Snipp) => {
        const existingSnipps = context.globalState.get("terminal_snipps", []);

        const updatedSnipps = existingSnipps.filter((snipp: Snipp) => {
          return JSON.stringify(snipp) !== JSON.stringify(snippToDelete);
        });

        context.globalState.update("terminal_snipps", updatedSnipps);

        vscode.window.showInformationMessage(`Terminal Snippet Removed`);
        snippDataProvider.refresh();
      }
    );

    /**
     * Refreshes the list of terminal snippets.
     */
    vscode.commands.registerCommand("terminalSnipps.refreshEntry", () => {
      snippDataProvider.refresh();
    });

    /**
     * Inserts the snippet into an existing integrated terminal
     */
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

    vscode.commands.registerCommand(
      "terminalSnipps.editEntry",
      (snipp: Snipp) => {
        let existingSnipps = context.globalState.get("terminal_snipps", []);
        const snipIndex = existingSnipps.findIndex(
          (snipp1: Snipp) => JSON.stringify(snipp1) === JSON.stringify(snipp)
        );

        const panel = vscode.window.createWebviewPanel(
          "snippetEditor", // Identifies the type of the webview. Used internally
          `Edit: ${snipp.name}`, // Title of the panel displayed to the user
          vscode.ViewColumn.One, // Editor column to show the new webview panel in.
          {
            enableScripts: true,
          } // Webview options. More on these later.
        );

        panel.webview.html = editTerminalSnippWebviewContent(snipp);

        panel.webview.onDidReceiveMessage(
          (message) => {
            switch (message.command) {
              case "save":
                const { name, content } = message.snippetData;

                if (name) {
                  snipp.name = name;
                }

                if (content) {
                  snipp.content = content;
                }

                const updatedSnipps = existingSnipps.map(
                  (exsnip: Snipp, index) => {
                    if (index === snipIndex) {
                      return snipp;
                    } else {
                      return exsnip;
                    }
                  }
                );
                context.globalState.update("terminal_snipps", updatedSnipps);

                panel.dispose();
                snippDataProvider.refresh();

                vscode.window.showInformationMessage(
                  `Terminal Snippet Updated!`
                );

                return;
            }
          },
          undefined,
          context.subscriptions
        );
      }
    );
  }
}
