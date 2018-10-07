import { TextAnalyticsClient } from 'azure-cognitiveservices-textanalytics';
import { ActivityTypes, Middleware, TurnContext } from 'botbuilder';
import { CognitiveServicesCredentials } from 'ms-rest-azure';

/**
 * @module botbuildercommunity/text-analytics
 */

export class LanguageDetection implements Middleware {
    public credentials: CognitiveServicesCredentials;
    public client: TextAnalyticsClient;
    constructor(public serviceKey: string, public endpoint: string, public options?: any) {
        this.credentials = new CognitiveServicesCredentials(serviceKey);
        this.client = new TextAnalyticsClient(this.credentials, endpoint, options);
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>) {
        if (context.activity.type === ActivityTypes.Message) {
            const input = {
                documents: [
                    {
                        id: '1',
                        text: context.activity.text
                    }
                ]
            };
            try {
                const result = await this.client.detectLanguage(input);
                const l = result.documents[0].detectedLanguages;
                context.turnState.set('language', l);
            } catch (e) {
                throw new Error(`Failed to process language on ${context.activity.text}. Error: ${e}`);
            }
        }
        await next();
    }
}
