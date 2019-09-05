import { Middleware, TurnContext, ActivityTypes } from 'botbuilder';
import { Engine } from '@botbuildercommunity/middleware-engine-core';
import { AWSComprehendEngine } from './engine';

/**
 * @module botbuildercommunity/middleware-aws-comprehend
 */

export class SentimentAnalysis implements Middleware {
    public engine: Engine;
    public constructor() {
        this.engine = new AWSComprehendEngine();
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
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
                const result = await this.engine.sentiment(input);
                const s = result.documents[0].score;
                const t = result.documents[0].sentiment;
                context.turnState.set('sentimentScore', s);
                context.turnState.set('sentimentType', t);
            }
            catch(e) {
                throw new Error(`Failed to process sentiment on ${ context.activity.text }. Error: ${ e }`);
            }
        }
        await next();
    }
}
