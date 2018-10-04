import { Middleware, TurnContext, ActivityTypes } from "botbuilder";
import { CognitiveServicesCredentials } from "ms-rest-azure";
import { TextAnalyticsClient } from "azure-cognitiveservices-textanalytics";

/**
 * @module botbuilder-sentiment-middleware
 */

export class SentimentAnalysis implements Middleware {
    public credentials: CognitiveServicesCredentials;
    public client: TextAnalyticsClient;
    constructor(public serviceKey: string, public endpoint: string, public options?: any) {
        this.credentials = new CognitiveServicesCredentials(serviceKey);
        this.client = new TextAnalyticsClient(this.credentials, endpoint, options);
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>) {
        if(context.activity.type === ActivityTypes.Message) {
            const input = {
                documents: [
                    {
                        "id": "1"
                        , "text": context.activity.text
                    }
                ]
            };
            try {
                const result = await this.client.sentiment(input);
                const s = result.documents[0].score;
                context.turnState.set("sentimentScore", s);
            }
            catch(e) {
                throw new Error(`Failed to process sentiment on ${context.activity.text}. Error: ${e}`);
            }
        }
        await next();
    }
}
