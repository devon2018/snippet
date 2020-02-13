// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, commands, window} from "vscode";
import { LoginForm } from "./components/login_form";
import { AddSnippForm } from "./components/add_snipp";
import { SnippExplorer } from "./providers/snippProvider";


export function activate(context: ExtensionContext) {

  new SnippExplorer(context);
	// commands.registerCommand('allSnipps.addEntry', () => window.showInformationMessage(`Successfully called add entry.`));
	// commands.registerCommand('allSnipps.editEntry', (node: Dependency) => window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));
	// commands.registerCommand('allSnipps.deleteEntry', (node: Dependency) => window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));
  context.subscriptions.push(
    commands.registerCommand("extension.createSnipp", async () => {
      AddSnippForm(context);
    })
  );
}

// commands.executeCommand('setContext', 'isLoggedIn', true);


// this method is called when your extension is deactivated
export function deactivate() {}
