import {
  ExtensionContext,
  commands,
  window,
  languages,
  TextDocument,
  Position,
  CancellationToken,
  CompletionContext,
  CompletionItem
} from "vscode";

import { MultiStepInput } from "../functions/multistep";
import Snipp from "../interfaces/snipp";

export async function AddSnippForm(context: ExtensionContext) {
  const title = "Create Snippit";

  async function startAddSnipp(state: Partial<Snipp>) {
    await MultiStepInput.run(input => addSnippName(input, state));
    return state as Snipp;
  }

  async function addSnippName(input: MultiStepInput, state: Partial<Snipp>) {
    state.name = await input.showInputBox({
      title,
      step: 1,
      totalSteps: 2,
      value: typeof state.name === "string" ? state.name : "",
      prompt: "Enter snipp name",
      validate: validateSnippName,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => addSnippTags(input, state);
  }

  async function addSnippTags(input: MultiStepInput, state: Partial<Snipp>) {
    const tagString = await input.showInputBox({
      title,
      step: 1,
      totalSteps: 2,
      value: state?.tags?.join(" + ") ?? "",
      prompt: "Enter Snipp tags, use + symbol for multiple",
      validate: validateSnippTags,
      shouldResume: shouldResume
    });

    state.tags = tagString
      .split("+")
      .map(i => i.trim())
      .filter(e => e.length >= 2);

    const content = await getSnippText();

    state.content = content?.text;
    state.contentType = content?.type;

    const existingSnipps = context.globalState.get("snipps", []);

    const updatedSnipps = [...existingSnipps, state];

    context.globalState.update("snipps", updatedSnipps);

    if (content.type && state.name) {
      languages.registerCompletionItemProvider(content.type, {
        provideCompletionItems(
          document: TextDocument,
          position: Position,
          token: CancellationToken,
          context: CompletionContext
        ) {
          const commandCompletion = new CompletionItem(state.name || '');
          commandCompletion.insertText = state.content || "";
          return [commandCompletion];
        }
      });
    }

    window.showInformationMessage("Snipp Saved");

    commands.executeCommand("allSnipps.refreshEntry");
  }

  async function getSnippText() {
    const editor = window.activeTextEditor;

    let text = editor?.document.getText(editor.selection);
    return { text, type: editor?.document.languageId };
  }

  async function validateSnippName(name: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return name.length < 3
      ? "Please enter a snipp name (3 characters or more)"
      : undefined;
  }

  async function validateSnippTags(tags: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return tags.length < 3
      ? "Please at least one tag for this Snipp"
      : undefined;
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>((resolve, reject) => {});
  }

  await startAddSnipp({ created: new Date() });
}
