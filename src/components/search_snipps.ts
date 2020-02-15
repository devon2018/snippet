import { ExtensionContext, window, commands } from "vscode";
import Snipp from "../interfaces/snipp";

export async function SearchSnippForm(context: ExtensionContext) {
  const title = "Search Snipps";

  interface State {
    term?: string;
    results?: Snipp[];
  }

  async function startSearchSnipp(state: Partial<State>) {
    const snipps = context?.globalState?.get("snipps", []);
    const result = await window.showQuickPick(
      snipps.map((sn: Snipp) => ({
        label: sn.name,
        description: `(${sn.tags.join(', ')})`,
        snipp: sn
      })),
      {
        placeHolder: "Search snipps",
        matchOnDescription: true,
        matchOnDetail: true
      }
    );

    if(result && result.snipp) {
      commands.executeCommand('allSnipps.insertEntry', result.snipp);
    }
  }

  await startSearchSnipp({});
}
