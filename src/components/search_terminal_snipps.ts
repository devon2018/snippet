import { ExtensionContext, window, commands } from "vscode";
import Snipp from "../interfaces/snipp";

export async function SearchTerminalSnippsForm(context: ExtensionContext) {
  interface State {
    term?: string;
    results?: Snipp[];
  }

  async function startSearchSnipp(state: Partial<State>) {
    const snipps = context?.globalState?.get("terminal_snipps", []);
    const result = await window.showQuickPick(
      snipps.map((sn: Snipp) => ({
        label: sn.name,
        description: `(${sn.tags.join(', ')})`,
        snipp: sn
      })),
      {
        placeHolder: "Search Terminal Snippets",
        matchOnDescription: true,
        matchOnDetail: true
      }
    );

    if(result && result.snipp) {
      commands.executeCommand('terminalSnipps.insertEntry', result.snipp);
    }
  }

  await startSearchSnipp({});
}
