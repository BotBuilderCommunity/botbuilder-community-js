import { Engine } from '@botbuildercommunity/middleware-engine-core';
import { GoogleCloudOptions } from './schema';

/**
 * @module botbuildercommunity/middleware-google-cloud
 */

export class GoogleCloudEngine extends Engine {
    public client: any;
    public options: any;
    public lang: string;
    public constructor(options?: any) {
        super();
        this.options = { ...{ apiVersion: '2017-11-27', region: 'us-east-1' }, ...options};
        this.lang = this.options.lang || 'en';
        this.client = new GCP(this.options);
    }
    public async entities(input: any): Promise<any> {
        const params = {
            LanguageCode: this.lang,
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject): void => {
            this.client.detectEntities(params, (err: any, data: any): void => {
                if(err) {
                    reject(err);
                }
                try {
                    const entities = data.Entities.map((e: any): string => e.Text);
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
            this.client.detectKeyPhrases(params, (err: any, data: any): void => {
                if(err) {
                    reject(err);
                }
                try {
                    const keyPhrases = data.KeyPhrases.map((e: any): string => e.Text);
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
            this.client.detectDominantLanguage(params, (err: any, data: any): void => {
                if(err) {
                    reject(err);
                }
                try {
                    const vals = Object.values(data.Languages).sort((a: any, b: any): number => b.Score - a.Score);
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
            this.client.detectSentiment(params, (err: any, data: any): void => {
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
