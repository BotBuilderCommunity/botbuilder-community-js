import { Middleware, TurnContext, ActivityTypes } from 'botbuilder';
import { Engine, TextAnalysisMiddleware } from '@botbuildercommunity/middleware-engine-core';
import * as nlup from 'ibm-watson/natural-language-understanding/v1.js';
import { WatsonEngine } from './engine';

/**
 * @module botbuildercommunity/middleware-watson-nlu
 */

export class KeyPhrases extends TextAnalysisMiddleware implements Middleware {
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
    public static rankKeywordKeys(keywordsResult: nlup.KeywordsResult[]): string[] {
        return KeyPhrases
            .rankKeywords(keywordsResult)
            .map((e: nlup.KeywordsResult): string => e.text);
    }
    public static rankKeywords(keywordsResult: nlup.KeywordsResult[]): nlup.KeywordsResult[] {
        return keywordsResult.sort((a: nlup.KeywordsResult, b: nlup.KeywordsResult): number => b.relevance - a.relevance);
    }
    public static topKeyword(keywordsResult: nlup.KeywordsResult[]): string {
        return KeyPhrases.rankKeywordKeys(keywordsResult)[0];
    }
    public static topKeywordResult(keywordsResult: nlup.KeywordsResult[]): nlup.KeywordsResult {
        return KeyPhrases.rankKeywords(keywordsResult)[0];
    }
}
