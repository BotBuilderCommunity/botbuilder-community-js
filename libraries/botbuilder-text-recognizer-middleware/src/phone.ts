import { ModelResult } from '@microsoft/recognizers-text';
import { recognizePhoneNumber } from '@microsoft/recognizers-text-sequence';
import { ActivityTypes, Middleware, TurnContext } from 'botbuilder';

/**
 * @module botbuildercommunity/text-recognizer-middleware
 */

export class PhoneRecognizer implements Middleware {
    constructor(public defaultLocale?: string) {
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type === ActivityTypes.Message) {
            const phoneNumbers: ModelResult[] = recognizePhoneNumber(context.activity.text, this.defaultLocale);
            const phoneNumberEntities: string[] = [];
            if (phoneNumbers.length > 0) {
                for (const i of phoneNumbers) {
                    phoneNumberEntities.push(i.resolution.value);
                }
                context.turnState.set('phoneNumberEntities', phoneNumberEntities);
            }
        }
        await next();
    }
}
