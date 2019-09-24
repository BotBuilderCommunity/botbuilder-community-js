import { ModelResult } from '@microsoft/recognizers-text';
import { recognizeEmail } from '@microsoft/recognizers-text-sequence';
import { ActivityTypes, Middleware, TurnContext } from 'botbuilder';

/**
 * @module botbuildercommunity/text-recognizer-middleware
 */

export class EmailRecognizer implements Middleware {
    public defaultLocale: string;

    public constructor(defaultLocale?: string) {
        this.defaultLocale = defaultLocale;
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type === ActivityTypes.Message) {
            const emails: ModelResult[] = recognizeEmail(context.activity.text, this.defaultLocale);
            const emailEntities: string[] = [];
            if (emails.length > 0) {
                for (const i of emails) {
                    emailEntities.push(i.resolution.value);
                }
                context.turnState.set('emailEntities', emailEntities);
            }
        }
        await next();
    }
}
