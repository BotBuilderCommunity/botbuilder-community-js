/**
 * @module botbuildercommunity/middleware-watson-nlu
 */

export interface Emotion {
    name: string;
    score: number;
}

export interface EmotionOptions {
    document?: boolean;
    targets?: string[];
}

export interface EntityOptions {
    sentiment?: boolean;
    emotion?: boolean;
}

export enum RANKING {
    RELEVANCE = 'relevance',
    CONFIDENCE = 'confidence'
}
