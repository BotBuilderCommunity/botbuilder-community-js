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
