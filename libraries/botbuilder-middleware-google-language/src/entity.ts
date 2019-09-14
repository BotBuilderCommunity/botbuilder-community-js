import { Middleware, TurnContext, ActivityTypes } from 'botbuilder';
import { Engine } from '@botbuildercommunity/middleware-engine-core';
import { GoogleCloudEngine } from './engine';
import { GoogleCloudOptions } from './schema';

/**
 * @module botbuildercommunity/middleware-google-cloud
 */

export class EntityExtraction implements Middleware {
    public engine: Engine;
    public constructor(options?: GoogleCloudOptions) {
        this.engine = new GoogleCloudEngine(options);
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
                const result = await this.engine.entities(input);
                const e = result.documents[0].entities;
                context.turnState.set('textEntities', e);
            }
            catch(e) {
                throw new Error(`Failed to process entities on ${ context.activity.text }. Error: ${ e }`);
            }
        }
        await next();
    }
}
