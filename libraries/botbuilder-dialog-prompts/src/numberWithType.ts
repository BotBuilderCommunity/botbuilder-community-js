import * as recognizers  from '@microsoft/recognizers-text-number';
import { Activity, InputHints, TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptRecognizerResult, PromptValidator } from 'botbuilder-dialogs';

/**
 * @module botbuildercommunity/dialog-prompts
 */

export enum NumberWithTypePromptType
    {
    Ordinal = 0,
    Percentage = 1
}

export class NumberWithTypePrompt extends Prompt<NumberWithTypePromptType> {
    public defaultLocale: string | undefined;
    public promptType: NumberWithTypePromptType;
    public constructor(dialogId: string, promptType: NumberWithTypePromptType, validator?: PromptValidator<number>, defaultLocale?: string) {
        super(dialogId, validator);
        this.defaultLocale = defaultLocale;
        this.promptType = promptType;
    }
    protected async onPrompt(context: TurnContext, state: any, options: PromptOptions, isRetry: boolean): Promise<void> {
        if (isRetry && options.retryPrompt) {
            await context.sendActivity(options.retryPrompt, undefined, InputHints.ExpectingInput);
        } else if (options.prompt) {
            await context.sendActivity(options.prompt, undefined, InputHints.ExpectingInput);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<number>> {
        const result: PromptRecognizerResult<number> = { succeeded: false };
        let results: any;
        const activity: Activity = context.activity;
        const utterance: string = activity.text;
        const locale: string = activity.locale || this.defaultLocale || 'en-us';
        
        switch(this.promptType)
        {
            case NumberWithTypePromptType.Ordinal:
                results = recognizers.recognizeOrdinal(utterance, locale);
                break;
            case NumberWithTypePromptType.Percentage:
                results = recognizers.recognizePercentage(utterance, locale);
                break;
        }
        if (results.length > 0 && results[0].resolution != null) {
            try {
                result.succeeded = true;
                result.value = parseFloat(results[0].resolution.value);
            }
            catch(e) {
                console.log(e);
            }
        }
        return result;
    }
}
