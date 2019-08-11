import { Middleware, TurnContext, ActivityTypes } from 'botbuilder';
import { Engine } from '@botbuildercommunity/middleware-engine-core';
import { WatsonEngine } from './engine';

/**
 * @module botbuildercommunity/middleware-watson-nlu
 */

export class EmotionDetection implements Middleware {
    public engine: Engine;
    constructor(public serviceKey: string, public endpoint: string, public options?: any) {
        this.engine = new WatsonEngine(serviceKey, endpoint, options);
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>) {
        if(context.activity.type === ActivityTypes.Message) {
            const input = {
                documents: [
                    {
                        'id': '1'
                        , 'text': context.activity.text
                    }
                ]
            };
            try {
                const result = await this.engine.emotion(input);
                const l = result.documents[0].emotion;
                context.turnState.set('emotionDetection', l);
            }
            catch(e) {
                throw new Error(`Failed to process emotions on ${ context.activity.text }. Error: ${ e }`);
            }
        }
        await next();
    }
}
