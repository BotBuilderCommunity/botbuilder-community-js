import { Engine } from '@botbuildercommunity/middleware-engine-core';
import * as aws from "aws-sdk";

/**
 * @module botbuildercommunity/middleware-aws-comprehend
 */

export class AWSComprehendEngine extends Engine {
    public client: aws.Comprehend;
    public constructor() {
        super();
        this.client = new aws.Comprehend({ apiVersion: '2017-11-27', region: 'us-east-1' });
    }
    public async entities(input: any): Promise<aws.Comprehend.DetectEntitiesResponse> {
        const params = {
            LanguageCode: 'en',
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject) => {
            this.client.detectEntities(params, (err, data) => {
                if(err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
    public async keyPhrases(input: any): Promise<aws.Comprehend.DetectKeyPhrasesResponse> {
        const params = {
            LanguageCode: 'en',
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject) => {
            this.client.detectKeyPhrases(params, (err, data) => {
                if(err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
    public async detectLanguage(input: any): Promise<aws.Comprehend.DetectDominantLanguageResponse> {
        const params = {
            LanguageCode: 'en',
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject) => {
            this.client.detectDominantLanguage(params, (err, data) => {
                if(err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
    public async sentiment(input: any): Promise<aws.Comprehend.DetectSentimentResponse> {
        const params = {
            LanguageCode: 'en',
            Text: input.documents[0].text
        };
        return new Promise((resolve, reject) => {
            this.client.detectSentiment(params, (err, data) => {
                if(err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
    public async categories(input: string): Promise<any> {
        return Promise.reject('[categories] is not supported by this engine.');
    }
    public async concepts(input: string): Promise<any> {
        return Promise.reject('[concepts] is not supported by this engine.');
    }
    public async emotion(input: string): Promise<any> {
        return Promise.reject('[emotion] is not supported by this engine.');
    }
}
