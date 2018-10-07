import * as recognizers from '@microsoft/recognizers-text-sequence';
import { Activity, InputHints, TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptRecognizerResult, PromptValidator } from 'botbuilder-dialogs';

/**
 * @module botbuildercommunity/dialog-prompts
 */

export class EmailPrompt extends Prompt<string> {
    public defaultLocale: string | undefined;
    constructor(dialogId: string, validator?: PromptValidator<string>, defaultLocale?: string) {
        super(dialogId, validator);
    }
    protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await context.sendActivity(options.retryPrompt, undefined, InputHints.ExpectingInput);
        } else if (options.prompt) {
            await context.sendActivity(options.prompt, undefined, InputHints.ExpectingInput);
        }
    }
    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<string>> {
        const result: PromptRecognizerResult<string> = { succeeded: false };
        const activity: Activity = context.activity;
        const utterance: string = activity.text;
        const locale: string = activity.locale || this.defaultLocale || 'en-us';
        const results = recognizers.recognizeEmail(utterance, locale);
        if (results.length > 0 && results[0].resolution != null) {
            try {
                result.succeeded = true;
                result.value = results[0].resolution.value;
            } catch (e) { }
        }
        return result;
    }
}
