import { Middleware, TurnContext, ActivityTypes } from 'botbuilder';
import { Engine } from '@botbuildercommunity/middleware-engine-core';
import { GoogleCloudEngine } from './engine';
import { GoogleCloudOptions } from './schema';

/**
 * @module botbuildercommunity/middleware-aws-comprehend
 */

export class CategoryExtraction implements Middleware {
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
                const result = await this.engine.categories(input);
                const c = result.documents[0].categories;
                context.turnState.set('categoryEntities', c);
            }
            catch(e) {
                throw new Error(`Failed to process key phrases on ${ context.activity.text }. Error: ${ e }`);
            }
        }
        await next();
    }
}
