import {
  QuickPickItem,
  window,
  Disposable,
  QuickInputButton,
  QuickInput,
  ExtensionContext,
  QuickInputButtons
} from "vscode";
import axios from "../plugins/axios";
import { Interface } from "readline";
import { AxiosResponse } from "axios";

export async function LoginForm(context: ExtensionContext) {
  const title = "Snippit";

  interface State {
    title: string;
    step: number;
    totalSteps: number;
    resourceGroup: QuickPickItem | string;
    name: string;
    runtime: QuickPickItem;
    username: string;
    password: string;
  }

  async function startLoginProcess(state: Partial<State>) {
    // const state = {} as Partial<State>;
    await MultiStepInput.run(input => startLogin(input, state));
    return state as State;
  }

  async function startLogin(input: MultiStepInput, state: Partial<State>) {
    state.username = await input.showInputBox({
      title,
      step: 1,
      totalSteps: 2,
      value: typeof state.username === "string" ? state.username : "",
      prompt: "Enter username or email address",
      validate: validateUsernameOrEmailExists,
      shouldResume: shouldResume
    });
    return (input: MultiStepInput) => startLoginPassword(input, state);
  }

  async function startLoginPassword(
    input: MultiStepInput,
    state: Partial<State>
  ) {
    state.password = await input.showInputBox({
      title,
      step: 2,
      totalSteps: 2,
      value: typeof state.password === "string" ? state.password : "",
      prompt: "Enter password",
      validate: validatePasswordInput,
      shouldResume: shouldResume
    });

    attemptLogin(state);
    // return (input: MultiStepInput) => inputName(input, state);
  }

  interface LoginResponse {
    token: string,
    user: object
  }

  async function attemptLogin(state: Partial<State>) {
    const { username, password}  = state;
    axios.post('login', { email: username, password })
      .then((response: any) => {
        context.globalState.update('token', response.token); // eslint-disable-line
      })
      .catch(async e => {
        window.showErrorMessage("Failed to login, details incorrect!");
        state.password = "";
        const s = await startLoginProcess(state);
      }).finally(() => {
        // console.log(context.globalState.get('token'));
      });
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>((resolve, reject) => {});
  }

  async function validateUsernameOrEmailExists(username: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const regexp = new RegExp(
      '/^(([^<>()[]\\.,;:s@"]+(.[^<>()[]\\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/'
    );
    return !username.includes("@") ? "Username or Email is invalid" : undefined;
  }

  async function validatePasswordInput(password: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return password.length < 8 ? "Password is invalid" : undefined;
  }

  await startLoginProcess({});
}

// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------

class InputFlowAction {
  private constructor() {}
  static back = new InputFlowAction();
  static cancel = new InputFlowAction();
  static resume = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

interface InputBoxParameters {
  title: string;
  step: number;
  totalSteps: number;
  value: string;
  prompt: string;
  validate: (value: string) => Promise<string | undefined>;
  buttons?: QuickInputButton[];
  shouldResume: () => Thenable<boolean>;
}

class MultiStepInput {
  static async run<T>(start: InputStep) {
    const input = new MultiStepInput();
    return input.stepThrough(start);
  }

  private current?: QuickInput;
  private steps: InputStep[] = [];

  private async stepThrough<T>(start: InputStep) {
    let step: InputStep | void = start;
    while (step) {
      this.steps.push(step);
      if (this.current) {
        this.current.enabled = false;
        this.current.busy = true;
      }
      try {
        step = await step(this);
      } catch (err) {
        if (err === InputFlowAction.back) {
          this.steps.pop();
          step = this.steps.pop();
        } else if (err === InputFlowAction.resume) {
          step = this.steps.pop();
        } else if (err === InputFlowAction.cancel) {
          step = undefined;
        } else {
          throw err;
        }
      }
    }
    if (this.current) {
      this.current.dispose();
    }
  }

  async showInputBox<P extends InputBoxParameters>({
    title,
    step,
    totalSteps,
    value,
    prompt,
    validate,
    buttons,
    shouldResume
  }: P) {
    const disposables: Disposable[] = [];
    try {
      return await new Promise<
        string | (P extends { buttons: (infer I)[] } ? I : never)
      >((resolve, reject) => {
        const input = window.createInputBox();
        input.title = title;
        input.step = step;
        input.totalSteps = totalSteps;
        input.value = value || "";
        input.prompt = prompt;
        input.buttons = [
          ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
          ...(buttons || [])
        ];
        let validating = validate("");
        disposables.push(
          input.onDidTriggerButton(item => {
            if (item === QuickInputButtons.Back) {
              reject(InputFlowAction.back);
            } else {
              resolve(<any>item);
            }
          }),
          input.onDidAccept(async () => {
            const value = input.value;
            input.enabled = false;
            input.busy = true;
            if (!(await validate(value))) {
              resolve(value);
            }
            input.enabled = true;
            input.busy = false;
          }),
          input.onDidChangeValue(async text => {
            const current = validate(text);
            validating = current;
            const validationMessage = await current;
            if (current === validating) {
              input.validationMessage = validationMessage;
            }
          }),
          input.onDidHide(() => {
            (async () => {
              reject(
                shouldResume && (await shouldResume())
                  ? InputFlowAction.resume
                  : InputFlowAction.cancel
              );
            })().catch(reject);
          })
        );
        if (this.current) {
          this.current.dispose();
        }
        this.current = input;
        this.current.show();
      });
    } finally {
      disposables.forEach(d => d.dispose());
    }
  }
}
