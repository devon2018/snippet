import {
  ExtensionContext,
  commands,
  window,
  Range,
  Uri,
  TextDocument,
  workspace,
  Position
} from "vscode";

import { MultiStepInput } from "../functions/multistep";

export async function AddSnippForm(context: ExtensionContext) {
  const title = "Create Snippit";

  interface State {
    name: string;
    tags: string[];
    content: string | null;
    contentType: string | null;
  }

  async function startAddSnipp(state: Partial<State>) {
    await MultiStepInput.run(input => addSnippName(input, state));
    return state as State;
  }

  async function addSnippName(input: MultiStepInput, state: Partial<State>) {
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

  async function addSnippTags(input: MultiStepInput, state: Partial<State>) {
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


    
    const existingSnipps = context.globalState.get('snipps', []);
    
    const updatedSnipps = [...existingSnipps, state];

    context.globalState.update('snipps', updatedSnipps);
    
    window.showInformationMessage('Snipp Saved');
    console.log(context.globalState.get('snipps'));
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

  await startAddSnipp({});
}
