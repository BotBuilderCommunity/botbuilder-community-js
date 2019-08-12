import { ModelResult } from '@microsoft/recognizers-text';
import { recognizeHashtag, recognizeMention } from '@microsoft/recognizers-text-sequence';
import { ActivityTypes, Middleware, TurnContext } from 'botbuilder';

/**
 * @module botbuildercommunity/text-recognizer-middleware
 */

export class SocialMediaRecognizer implements Middleware {
    public defaultLocale?: string
    public constructor(defaultLocale?: string) {
        this.defaultLocale = defaultLocale;
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type === ActivityTypes.Message) {
            const mentions: ModelResult[] = recognizeMention(context.activity.text, this.defaultLocale);
            const hastags: ModelResult[] = recognizeHashtag(context.activity.text, this.defaultLocale);
            const mentionEntities: string[] = [];
            const hastagEntities: string[] = [];
            if (mentions.length > 0) {
                for (const i of mentions) {
                    mentionEntities.push(i.resolution.value);
                }
                context.turnState.set('mentionEntities', mentionEntities);
            }
            if (hastags.length > 0) {
                for (const i of hastags) {
                    hastagEntities.push(i.resolution.value);
                }
                context.turnState.set('hastagEntities', hastagEntities);
            }
        }
        await next();
    }
}
