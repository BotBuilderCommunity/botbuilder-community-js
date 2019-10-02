import { Middleware, TurnContext, ActivityTypes } from 'botbuilder';
import { Engine, TextAnalysisMiddleware } from '@botbuildercommunity/middleware-engine-core';
import * as nlup from 'ibm-watson/natural-language-understanding/v1.js';
import { WatsonEngine } from './engine';
import { RANKING } from './schema';

/**
 * @module botbuildercommunity/middleware-watson-nlu
 */

export class EntityExtraction extends TextAnalysisMiddleware implements Middleware {
    public engine: Engine;
    public serviceKey: string;
    public endpoint: string;
    public options: any;
    public constructor(serviceKey: string, endpoint: string, options?: any) {
        super();
        this.serviceKey = serviceKey;
        this.endpoint = endpoint;
        this.options = options;
        this.engine = new WatsonEngine(serviceKey, endpoint, options);
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
                const result = await this.engine.entities(input, this.config);
                const l = result.documents[0].entities;
                context.turnState.set('textEntities', l);
            }
            catch(e) {
                throw new Error(`Failed to process entities on ${ context.activity.text }. Error: ${ e }`);
            }
        }
        await next();
    }
    public static getEntities(entitiesResult: nlup.EntitiesResult[], type?: string): string[] {
        if(type != null) {
            return entitiesResult
                .filter((e: nlup.EntitiesResult): boolean => e.type.toLocaleLowerCase() === type.toLocaleLowerCase())
                .map((e: nlup.EntitiesResult): string  => e.text);
        }
        return entitiesResult.map((e: nlup.EntitiesResult): string  => e.text);
    }
    public static rankEntityKeys(entitiesResult: nlup.EntitiesResult[], ranking: RANKING = RANKING.RELEVANCE): string[] {
        return EntityExtraction
            .rankEntities(entitiesResult, ranking)
            .map((e: nlup.EntitiesResult): string => e.text);
    }
    public static rankEntities(entitiesResult: nlup.EntitiesResult[], ranking: RANKING = RANKING.RELEVANCE): nlup.EntitiesResult[] {
        return entitiesResult.sort((a: nlup.EntitiesResult, b: nlup.EntitiesResult): number => b[ranking] - a[ranking]);
    }
    public static topEntity(entitiesResult: nlup.EntitiesResult[], ranking: RANKING = RANKING.RELEVANCE): string {
        return EntityExtraction.rankEntityKeys(entitiesResult, ranking)[0];
    }
    public static topEntityResult(entitiesResult: nlup.EntitiesResult[], ranking: RANKING = RANKING.RELEVANCE): nlup.EntitiesResult {
        return EntityExtraction.rankEntities(entitiesResult, ranking)[0];
    }
}
