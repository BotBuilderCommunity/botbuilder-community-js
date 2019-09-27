import { ModelResult } from '@microsoft/recognizers-text';
import { recognizeURL } from '@microsoft/recognizers-text-sequence';
import { ActivityTypes, Middleware, TurnContext } from 'botbuilder';

/**
 * @module botbuildercommunity/text-recognizer-middleware
 */

export class URLRecognizer implements Middleware {
    public defaultLocale?: string
    public constructor(defaultLocale?: string) {
        this.defaultLocale = defaultLocale;
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type === ActivityTypes.Message) {
            const urls: ModelResult[] = recognizeURL(context.activity.text, this.defaultLocale);
            const urlEntities: string[] = [];
            if (urls.length > 0) {
                for (const i of urls) {
                    urlEntities.push(i.resolution.value);
                }
                context.turnState.set('urlEntities', urlEntities);
            }
        }
        await next();
    }
}
