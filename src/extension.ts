import {
  ExtensionContext,
  commands,
  workspace,
  window,
  OpenDialogOptions,
  TextDocumentContentProvider,
  Uri,
} from "vscode";
import { AddSnippForm } from "./components/add_snipp";
import { SnippExplorer } from "./providers/SnippProvider";
import { CompletionProvider } from "./providers/CompletionProvider";
import { SearchSnippForm } from "./components/search_snipps";
import { SearchTerminalSnippsForm } from "./components/search_terminal_snipps";

import { TerminalSnippExplorer } from "./providers/TerminalSnippProvider";
import { AddTerminalSnippetForm } from "./components/add_terminal_snipp";
import SnippetExportProvider from "./providers/SnippExportProvider";
import Snipp from "./interfaces/snipp";
import { isDate } from "util";

export function activate(context: ExtensionContext) {
  new SnippExplorer(context);
  new CompletionProvider(context);
  new TerminalSnippExplorer(context);

  context.subscriptions.push(
    commands.registerCommand("extension.createSnipp", async () => {
      await AddSnippForm(context);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("terminalSnipps.addSnipp", async () => {
      await AddTerminalSnippetForm(context);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("extension.searchSnipps", async () => {
      SearchSnippForm(context);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("terminalSnipps.searchSnipps", async () => {
      SearchTerminalSnippsForm(context);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("extension.insertSnipp", async () => {
      SearchSnippForm(context);
    })
  );

  workspace.registerTextDocumentContentProvider(
    "snippet-export",
    new SnippetExportProvider(context)
  );

  context.subscriptions.push(
    commands.registerCommand("extension.exportSnipps", async () => {
      workspace
        .openTextDocument(Uri.parse("snippet-export:snippets.json"))
        .then((doc) => {
          window.showTextDocument(doc, {
            preview: false,
          });
        });
    })
  );

  workspace.registerTextDocumentContentProvider(
    "terminal-snippet-export",
    new SnippetExportProvider(context, true)
  );

  context.subscriptions.push(
    commands.registerCommand("extension.exportTerminalSnipps", async () => {

      
      workspace
        .openTextDocument(
          Uri.parse("terminal-snippet-export:terminal-snippets.json")
        )
        .then((doc) => {
          window.showTextDocument(doc, {
            preview: false,
          });
        });
    })
  );

  context.subscriptions.push(
    commands.registerCommand("extension.deleteAllSnippets", async () => {
      window
        .showInformationMessage(
          "Are you sure you want to delete all your stored snippets, this cannot be undone!",
          "Yes",
          "No"
        )
        .then((answer) => {
          if (answer === "Yes") {
            // Run function
            context.globalState.update("snipps", []);
            commands.executeCommand("allSnipps.refreshEntry");
            window.showInformationMessage(`Successfully removed all snippets`);
          }
        });
    })
  );

  context.subscriptions.push(
    commands.registerCommand("extension.importSnipps", async () => {
      const options: OpenDialogOptions = {
        canSelectMany: false,
        canSelectFiles: true,
        canSelectFolders: false,
        openLabel: "Choose file",
      };

      window.showOpenDialog(options).then((fileUri) => {
        if (fileUri && fileUri[0]) {
          workspace.openTextDocument(fileUri[0].fsPath).then((doc) => {
            try {
              const validSnippets: Snipp[] = [];
              const snippetsToImportRaw = JSON.parse(doc.getText());

              snippetsToImportRaw.forEach((snipp: Snipp) => {
                let valid = true;

                if (!snipp.content) {
                  valid = false;
                  console.log("no content");
                }

                if (!snipp.created) {
                  valid = false;
                  console.log("no ccreated");
                }
                if (
                  !Object.keys(snipp).includes("tags") &&
                  typeof snipp.tags === "object"
                ) {
                  console.log("no tags");

                  valid = false;
                }

                if (!snipp.contentType) {
                  valid = false;
                  console.log("no tags");
                }

                if (valid) {
                  validSnippets.push(snipp);
                } else {
                  throw new Error("Snippet is invalid");
                }
              });

              const existingSnipps = context.globalState.get("snipps", []);

              const updatedSnipps = [...existingSnipps, ...validSnippets];

              context.globalState.update("snipps", updatedSnipps);
              commands.executeCommand("allSnipps.refreshEntry");
              window.showInformationMessage(`Snippets import success`);
            } catch (error) {
              window.showErrorMessage(
                `Import failed, the json file you selected is invalid, please double check all fields.`
              );
            }
          });
        }
      });
    })
  );
}

export function deactivate() {}
