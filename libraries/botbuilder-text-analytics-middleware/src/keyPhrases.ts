import { TextAnalyticsClient } from 'azure-cognitiveservices-textanalytics';
import { ActivityTypes, Middleware, TurnContext } from 'botbuilder';
import { CognitiveServicesCredentials } from 'ms-rest-azure';

/**
 * @module botbuildercommunity/text-analytics
 */

export class KeyPhrases implements Middleware {
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
                        id: '1'
                        , text: context.activity.text
                    }
                ]
            };
            try {
                const result = await this.client.keyPhrases(input);
                const k = result.documents[0].keyPhrases;
                context.turnState.set('keyPhrases', k);
            } catch (e) {
                throw new Error(`Failed to process key phrases on ${context.activity.text}. Error: ${e}`);
            }
        }
        await next();
    }
}
