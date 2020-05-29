import {
  ExtensionContext,
  commands,
  window,
  languages,
  TextDocument,
  Position,
  CancellationToken,
  CompletionContext,
  CompletionItem,
} from "vscode";

import { MultiStepInput } from "../functions/multistep";
import Snipp from "../interfaces/snipp";

export async function AddTerminalSnippetForm(context: ExtensionContext) {

  const title = "Create Terminal Snippet";

  async function startAddSnipp(state: Partial<Snipp>) {
    await MultiStepInput.run((input) => addSnippContent(input, state));
    return state as Snipp;
  }

  async function addSnippContent(input: MultiStepInput, state: Partial<Snipp>) {
    state.content = await input.showInputBox({
      title,
      step: 1,
      totalSteps: 3,
      value: typeof state.content === "string" ? state.content : "",
      prompt: "Enter terminal command",
      validate: validateSnippCommand,
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => addSnippName(input, state);
  }

  async function addSnippName(input: MultiStepInput, state: Partial<Snipp>) {
    state.name = await input.showInputBox({
      title,
      step: 2,
      totalSteps: 3,
      value: typeof state.name === "string" ? state.name : "",
      prompt: "Enter snipp name",
      validate: validateSnippName,
      shouldResume: shouldResume,
    });
    return (input: MultiStepInput) => addSnippTags(input, state);
  }

  async function addSnippTags(input: MultiStepInput, state: Partial<Snipp>) {
    const tagString = await input.showInputBox({
      title,
      step: 3,
      totalSteps: 3,
      value: state?.tags?.join(" + ") ?? "",
      prompt: "Enter Snipp tags, use + symbol for multiple",
      validate: validateSnippTags,
      shouldResume: shouldResume,
    });

    state.tags = tagString
      .split("+")
      .map((i) => i.trim())
      .filter((e) => e.length >= 2);


      console.warn(state);

    // const content = await getSnippText();

    // state.content = content?.text;
    state.contentType = 'shell';

    const existingSnipps = context.globalState.get("terminal_snipps", []);

    const updatedSnipps = [...existingSnipps, state];

    context.globalState.update("terminal_snipps", updatedSnipps);

    window.showInformationMessage("Terminal snippet saved.");

    commands.executeCommand("terminalSnipps.refreshEntry");
  }

  async function getSnippText() {
    const editor = window.activeTextEditor;

    let text = editor?.document.getText(editor.selection);
    return { text, type: editor?.document.languageId };
  }

  async function validateSnippName(name: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return name.length < 3
      ? "Please enter a snipp name (3 characters or more)"
      : undefined;
  }

  async function validateSnippCommand(content: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return content.length < 1
      ? "Command must contain more than 1 character"
      : undefined;
  }

  async function validateSnippTags(tags: string) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
