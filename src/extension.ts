import { ExtensionContext, commands } from "vscode";
import { AddSnippForm } from "./components/add_snipp";
import { SnippExplorer } from "./providers/snippProvider";
import { CompletionProvider } from "./providers/CompletionProvider";
import { SearchSnippForm } from "./components/search_snipps";

export function activate(context: ExtensionContext) {

  new SnippExplorer(context);
  new CompletionProvider(context);

  context.subscriptions.push(
    commands.registerCommand("extension.createSnipp", async () => {
      await AddSnippForm(context);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("extension.searchSnipps", async () => {
      SearchSnippForm(context);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("extension.insertSnipp", async () => {
      SearchSnippForm(context);
    })
  );
}

export function deactivate() {}
