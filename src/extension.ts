// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  ExtensionContext,
  commands,
  languages,
  TextDocument,
  Position,
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  SnippetString,
  MarkdownString
} from "vscode";
import { LoginForm } from "./components/login_form";
import { AddSnippForm } from "./components/add_snipp";
import { SnippExplorer, Snipp } from "./providers/snippProvider";
import { CompletionProvider } from "./providers/CompletionProvider";

export function activate(context: ExtensionContext) {
  new SnippExplorer(context);

  new CompletionProvider(context);

  context.subscriptions.push(
    commands.registerCommand("extension.createSnipp", async () => {
      AddSnippForm(context);
    })
  );

}

export function deactivate() {}
