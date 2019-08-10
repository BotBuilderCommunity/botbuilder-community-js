import { Middleware, TurnContext, ActivityTypes } from 'botbuilder';
import { Engine } from '@botbuildercommunity/middleware-engine-core';
import { WatsonEngine } from './engine';

/**
 * @module botbuildercommunity/middleware-watson-nlu
 */

export class KeyPhrases implements Middleware {
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
