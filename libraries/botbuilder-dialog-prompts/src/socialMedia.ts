import * as recognizers  from '@microsoft/recognizers-text-sequence';
import { Activity, InputHints, TurnContext } from 'botbuilder-core';
import { Prompt, PromptOptions, PromptRecognizerResult, PromptValidator } from 'botbuilder-dialogs';

/**
 * @module botbuildercommunity/dialog-prompts
 */

export enum SocialMediaPromptType
    {
    Mention = 0,
    Hashtag = 1
}

export class SocialMediaPrompt extends Prompt<string> {
    public defaultLocale: string | undefined;
    public promptType: SocialMediaPromptType;
    public constructor(dialogId: string, promptType: SocialMediaPromptType, validator?: PromptValidator<string>, defaultLocale?: string) {
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
    protected async onRecognize(context: TurnContext, state: any, options: PromptOptions): Promise<PromptRecognizerResult<string>> {
        const result: PromptRecognizerResult<string> = { succeeded: false };
        let results: any;
        const activity: Activity = context.activity;
        const utterance: string = activity.text;
        const locale: string = activity.locale || this.defaultLocale || 'en-us';
        switch(this.promptType)
        {
            case SocialMediaPromptType.Mention:
                results = recognizers.recognizeMention(utterance, locale);
                break;
            case SocialMediaPromptType.Hashtag:
                results = recognizers.recognizeHashtag(utterance, locale);
                break;
        }
        if (results.length > 0 && results[0].resolution != null) {
            try {
                result.succeeded = true;
                result.value = results[0].resolution.value;
            }
            catch(e) {
                console.log(e);
            }
        }
        return result;
    }
}
