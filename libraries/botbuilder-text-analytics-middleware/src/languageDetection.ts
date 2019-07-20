import { Middleware, TurnContext, ActivityTypes } from "botbuilder";
import { CognitiveServicesCredentials } from "ms-rest-azure";
import { TextAnalyticsClient } from "azure-cognitiveservices-textanalytics";
import { Engine } from "./engine";

/**
 * @module botbuildercommunity/text-analytics
 */

export class LanguageDetection implements Middleware {
    public engine: Engine;
    constructor(public serviceKey: string, public endpoint: string, public options?: any) {
        this.engine = Engine.getEngine(serviceKey, endpoint, options);
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
                const result = await this.engine.detectLanguage(input);
                const l = result.documents[0].detectedLanguages;
                context.turnState.set("language", l);
            }
            catch(e) {
                throw new Error(`Failed to process language on ${context.activity.text}. Error: ${e}`);
            }
        }
        await next();
    }
}
