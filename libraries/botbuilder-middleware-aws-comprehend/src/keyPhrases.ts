import { Middleware, TurnContext, ActivityTypes } from 'botbuilder';
import { Engine } from '@botbuildercommunity/middleware-engine-core';
import { AWSComprehendEngine } from './engine';

/**
 * @module botbuildercommunity/middleware-aws-comprehend
 */

export class KeyPhrases implements Middleware {
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
                const result = await this.engine.keyPhrases(input);
                const k = result.documents[0].keyPhrases;
                context.turnState.set('keyPhrases', k);
            }
            catch(e) {
                throw new Error(`Failed to process key phrases on ${ context.activity.text }. Error: ${ e }`);
            }
        }
        await next();
    }
}
