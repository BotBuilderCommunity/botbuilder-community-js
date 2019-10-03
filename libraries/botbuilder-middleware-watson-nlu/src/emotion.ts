import { TurnContext, ActivityTypes, Middleware } from 'botbuilder';
import { Engine, TextAnalysisMiddleware } from '@botbuildercommunity/middleware-engine-core';
import * as nlup from 'ibm-watson/natural-language-understanding/v1.js';
import * as math from 'mathjs';
import { WatsonEngine } from './engine';
import { Emotion } from './schema';

/**
 * @module botbuildercommunity/middleware-watson-nlu
 */

export class EmotionDetection extends TextAnalysisMiddleware implements Middleware {
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
                const result = await this.engine.emotion(input, this.config);
                const l = result.documents[0].emotion;
                context.turnState.set('emotionDetection', l);
                const t = result.documents[0].targets;
                if(t !== undefined) {
                    context.turnState.set('emotionTargets', t);
                }
            }
            catch(e) {
                console.error(`Failed to process emotions on ${ context.activity.text }. Error: ${ e }`);
            }
        }
        await next();
    }
    public static getEmotions(result: nlup.EntitiesResult | nlup.KeywordsResult): nlup.EmotionScores {
        if(result.emotion !== undefined) {
            return result.emotion;
        }
    }
    public static rankEmotionKeys(emotionScores: nlup.EmotionScores): string[] {
        return Object.keys(emotionScores).sort((a: string, b: string): number => emotionScores[b] - emotionScores[a]);
    }
    public static rankEmotions(emotionScores: nlup.EmotionScores): Emotion[] {
        const result: Emotion[] = [ ];
        const rankedEmotions: string[] = EmotionDetection.rankEmotionKeys(emotionScores);
        rankedEmotions.forEach((v: string): any => result.push({ name: v, score: emotionScores[v] }));
        return result;
    }
    public static topEmotion(emotionScores: nlup.EmotionScores): string {
        const rankedEmotions: string[] = EmotionDetection.rankEmotionKeys(emotionScores);
        return rankedEmotions[0];
    }
    public static topEmotionScore(emotionScores: nlup.EmotionScores): Emotion {
        const rankedEmotions: string[] = EmotionDetection.rankEmotionKeys(emotionScores);
        return {
            name: rankedEmotions[0],
            score: emotionScores[rankedEmotions[0]]
        };
    }
    public static calculateDifference(emotionScores: nlup.EmotionScores, firstEmotion?: string, secondEmotion?: string): number {
        if(firstEmotion != null && secondEmotion == null || firstEmotion == null && secondEmotion != null) {
            throw new Error('You must supply both the first and second emotion to calculate a difference between the two. Otherwise, supply neither to get the difference between the top two.');
        }
        if(firstEmotion == null && secondEmotion == null) {
            const rankedEmotions: Emotion[] = EmotionDetection.rankEmotions(emotionScores);
            return Math.abs(rankedEmotions[0].score - rankedEmotions[1].score);
        }
        return Math.abs(parseFloat(emotionScores[firstEmotion]) - parseFloat(emotionScores[secondEmotion]));
    }
    public static calculateVariance(emotionScores: nlup.EmotionScores): number {
        const scores = EmotionDetection.rankEmotions(emotionScores).map((e: Emotion): number => e.score);
        return math.variance(...scores);
    }
}
