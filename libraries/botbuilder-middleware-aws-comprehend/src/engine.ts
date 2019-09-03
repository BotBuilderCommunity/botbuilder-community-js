import { Engine } from '@botbuildercommunity/middleware-engine-core';
import * as aws from 'aws-sdk';

/**
 * @module botbuildercommunity/middleware-aws-comprehend
 */

export class AWSComprehendEngine extends Engine {
    public client: aws.Comprehend;
    public constructor() {
        super();
        this.client = new aws.Comprehend({ apiVersion: '2017-11-27', region: 'us-east-1' });
    }
    public async entities(input: any): Promise<any> {
        const params = {
            LanguageCode: 'en',
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject): void => {
            this.client.detectEntities(params, (err: aws.AWSError, data: aws.Comprehend.DetectEntitiesResponse): void => {
                if(err) {
                    reject(err);
                }
                try {
                    const entities = data.Entities.map((e: aws.Comprehend.Entity): string => e.Text);
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
            LanguageCode: 'en',
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject): void => {
            this.client.detectKeyPhrases(params, (err: aws.AWSError, data: aws.Comprehend.DetectKeyPhrasesResponse): void => {
                if(err) {
                    reject(err);
                }
                try {
                    const keyPhrases = data.KeyPhrases.map((e: aws.Comprehend.KeyPhrase): string => e.Text);
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
            LanguageCode: 'en',
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject): void => {
            this.client.detectDominantLanguage(params, (err: aws.AWSError, data: aws.Comprehend.DetectDominantLanguageResponse): void => {
                if(err) {
                    reject(err);
                }
                try {
                    const vals = Object.values(data.Languages).sort((a: aws.Comprehend.DominantLanguage, b: aws.Comprehend.DominantLanguage): number => b.Score - a.Score);
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
            LanguageCode: 'en',
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject): void => {
            this.client.detectSentiment(params, (err: aws.AWSError, data: aws.Comprehend.DetectSentimentResponse): void => {
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
