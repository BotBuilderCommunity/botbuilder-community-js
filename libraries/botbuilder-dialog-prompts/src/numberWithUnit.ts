import * as recognizers  from '@microsoft/recognizers-text-number-with-unit';
import { Activity, InputHints, TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptRecognizerResult, PromptValidator } from 'botbuilder-dialogs';

/**
 * @module botbuildercommunity/dialog-prompts
 */

export interface NumberWithUnitResult
{
    unit: string
    ; value: any;
}

export enum NumberWithUnitPromptType
    {
    Currency = 0,
    Temperature = 1,
    Age = 2,
    Dimension = 3
}

export class NumberWithUnitPrompt extends Prompt<NumberWithUnitResult> {
    public defaultLocale: string | undefined;
    public promptType: NumberWithUnitPromptType;
    public constructor(dialogId: string, promptType: NumberWithUnitPromptType, validator?: PromptValidator<NumberWithUnitResult>, defaultLocale?: string) {
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
    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<NumberWithUnitResult>> {
        const result: PromptRecognizerResult<NumberWithUnitResult> = { succeeded: false };
        let results: any;
        const activity: Activity = context.activity;
        const utterance: string = activity.text;
        const locale: string = activity.locale || this.defaultLocale || 'en-us';
        
        switch(this.promptType)
        {
            case NumberWithUnitPromptType.Currency:
                results = recognizers.recognizeCurrency(utterance, locale);
                break;
            case NumberWithUnitPromptType.Dimension:
                results = recognizers.recognizeDimension(utterance, locale);
                break;
            case NumberWithUnitPromptType.Age:
                results = recognizers.recognizeAge(utterance, locale);
                break;
            case NumberWithUnitPromptType.Temperature:
                results = recognizers.recognizeTemperature(utterance, locale);
                break;
        }
        if (results.length > 0 && results[0].resolution != null) {
            const resolvedUnit = results[0].resolution.unit;
            const resolvedValue = results[0].resolution.value;
            try {
                result.succeeded = true;
                const numberWithUnitResult = {
                    unit: resolvedUnit
                    , value: resolvedValue
                };
                result.value = numberWithUnitResult;
            }
            catch(e) {
                console.log(e);
            }
        }
        return result;
    }
}
