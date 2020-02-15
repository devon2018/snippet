import {
  languages,
  TextDocument,
  Position,
  CancellationToken,
  CompletionContext,
  CompletionItem,
  ExtensionContext
} from "vscode";
import Snipp from "../interfaces/snipp";

export class CompletionProvider {
  constructor(context: ExtensionContext) {
    const snipps = context?.globalState?.get("snipps", []);
    const tags = snipps.map((snipp: Snipp) => snipp.contentType);

    const providers = tags
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(type =>
        languages.registerCompletionItemProvider(type, {
          provideCompletionItems(
            document: TextDocument,
            position: Position,
            token: CancellationToken,
            context: CompletionContext
          ) {
            return snipps
              .filter((snipp: Snipp) => {
                return snipp.contentType === type;
              })
              .map((snipp: Snipp) => {
                const commandCompletion = new CompletionItem(snipp.name);
                commandCompletion.insertText = snipp.content || "";
                return commandCompletion;
              });
          }
        })
      );

    context.subscriptions.push(...providers);
  }
}
