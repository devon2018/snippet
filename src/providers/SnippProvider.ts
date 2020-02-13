import * as vscode from "vscode";
import { basename, dirname } from "path";

export interface Snipp {
  name: string;
  tags: string[];
  content: string | null;
  contentType: string | null;
}

export class SnippModel {
  private nodes: Map<string, Snipp> = new Map<string, Snipp>();

  constructor(
    readonly view: string,
    private context: vscode.ExtensionContext
  ) {}

  public get roots(): Thenable<Snipp[]> {
    return Promise.resolve(this.context?.globalState?.get("snipps", []));
  }

  public getChildren(node: Snipp): Thenable<Snipp[]> {
    return Promise.resolve([]);
    // return Promise.resolve(this.context?.globalState?.get("snipps", []));
  }

  public getContent(resource: vscode.Uri): Thenable<string> {
    return Promise.resolve("");
  }
}

export class SnippProvider
  implements
    vscode.TreeDataProvider<Snipp>,
    vscode.TextDocumentContentProvider {
  private _onDidChangeTreeData: vscode.EventEmitter<
    any
  > = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData
    .event;

  constructor(
    private readonly model: SnippModel,
    private context: vscode.ExtensionContext
  ) {}

  public refresh(): any {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: Snipp): vscode.TreeItem {
    return {
      label: element.name
    };
  }

  public getChildren(element?: Snipp): Snipp[] | Thenable<Snipp[]> {
    return element ? this.model.getChildren(element) : this.model.roots;
  }

  // public getParent(element: Snipp): Snipp {

  //   const parent = element.resource.with({
  //     path: dirname(element.resource.path)
  //   });
  //   return parent.path !== "//"
  //     ? { resource: parent, isDirectory: true }
  //     : null;
  // }

  public provideTextDocumentContent(
    uri: vscode.Uri,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<string> {
    return this.model.getContent(uri).then(content => content);
  }
}

export class SnippExplorer {
  private snippViewer: vscode.TreeView<Snipp>;

  constructor(context: vscode.ExtensionContext) {
    const snippModel = new SnippModel("recent", context);

    const snippDataProvider = new SnippProvider(snippModel, context);

    this.snippViewer = vscode.window.createTreeView("allSnipps", {
      treeDataProvider: snippDataProvider
    });

    vscode.commands.registerCommand("allSnipps.refreshEntry", () =>
      snippDataProvider.refresh()
    );
    vscode.commands.registerCommand("allSnipps.addEntry", () =>
      vscode.window.showInformationMessage(`Successfully called add entry.`)
    );
  }
}
