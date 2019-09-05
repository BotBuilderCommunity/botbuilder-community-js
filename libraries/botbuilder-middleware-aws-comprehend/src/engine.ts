import { Engine } from '@botbuildercommunity/middleware-engine-core';
import { AWSComprehendOptions } from './schema';
import { AWSError, Comprehend } from 'aws-sdk';

/**
 * @module botbuildercommunity/middleware-aws-comprehend
 */

export class AWSComprehendEngine extends Engine {
    public client: Comprehend;
    public options: AWSComprehendOptions;
    public lang: string;
    public constructor(options?: AWSComprehendOptions) {
        super();
        this.options = { ...{ apiVersion: '2017-11-27', region: 'us-east-1' }, ...options};
        this.lang = this.options.lang || 'en';
        this.client = new Comprehend(this.options);
    }
    public async entities(input: any): Promise<any> {
        const params = {
            LanguageCode: this.lang,
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject): void => {
            this.client.detectEntities(params, (err: AWSError, data: Comprehend.DetectEntitiesResponse): void => {
                if(err) {
                    reject(err);
                }
                try {
                    const entities = data.Entities.map((e: Comprehend.Entity): string => e.Text);
                    resolve({
                        documents: [
                            {
                                entities: entities
                            }
                        ]
                    });
                }
                catch(e) {
                    reject(e);
                }
            });
        });
    }
    public async keyPhrases(input: any): Promise<any> {
        const params = {
            LanguageCode: this.lang,
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject): void => {
            this.client.detectKeyPhrases(params, (err: AWSError, data: Comprehend.DetectKeyPhrasesResponse): void => {
                if(err) {
                    reject(err);
                }
                try {
                    const keyPhrases = data.KeyPhrases.map((e: Comprehend.KeyPhrase): string => e.Text);
                    resolve({
                        documents: [
                            {
                                keyPhrases: keyPhrases
                            }
                        ]
                    });
                }
                catch(e) {
                    reject(e);
                }
            });
        });
    }
    public async detectLanguage(input: any): Promise<any> {
        const params = {
            LanguageCode: this.lang,
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject): void => {
            this.client.detectDominantLanguage(params, (err: AWSError, data: Comprehend.DetectDominantLanguageResponse): void => {
                if(err) {
                    reject(err);
                }
                try {
                    const vals = Object.values(data.Languages).sort((a: Comprehend.DominantLanguage, b: Comprehend.DominantLanguage): number => b.Score - a.Score);
                    resolve({
                        documents: [
                            {
                                detectedLanguages: vals[0].LanguageCode
                            }
                        ]
                    });
                }
                catch(e) {
                    reject(e);
                }
            });
        });
    }
    public async sentiment(input: any): Promise<any> {
        const params = {
            LanguageCode: this.lang,
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject): void => {
            this.client.detectSentiment(params, (err: AWSError, data: Comprehend.DetectSentimentResponse): void => {
                if(err) {
                    reject(err);
                }
                try {
                    const vals = Object.values(data.SentimentScore).sort((a: number, b: number): number => b - a);
                    resolve({
                        documents: [
                            {
                                sentiment: data.Sentiment.toLowerCase(),
                                score: vals[0]
                            }
                        ]
                    });
                }
                catch(e) {
                    reject(e);
                }
            });
        });
    }
    public async categories(input: string): Promise<any> {
        return Promise.reject(`[categories] is not supported by this engine. "${ input }" cannot be processed`);
    }
    public async concepts(input: string): Promise<any> {
        return Promise.reject(`[concepts] is not supported by this engine. "${ input }" cannot be processed`);
    }
    public async emotion(input: string): Promise<any> {
        return Promise.reject(`[emotion] is not supported by this engine. "${ input }" cannot be processed`);
    }
}
