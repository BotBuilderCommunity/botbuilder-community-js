import { Engine } from '@botbuildercommunity/middleware-engine-core';
import * as nlup from 'ibm-watson/natural-language-understanding/v1.js';
import { WatsonOptions } from './schema';

/**
 * @module botbuildercommunity/middleware-watson-nlu
 */

export class WatsonEngine extends Engine {
    public apiKey: string;
    public endpoint: string;
    public options: WatsonOptions;
    public nlu: nlup;
    public constructor(options: WatsonOptions) {
        super();
        this.options = options;
        this.apiKey = this.options.apiKey;
        this.endpoint = this.options.endpoint;
        this.nlu = new nlup({
            version: this.options.version,
            iam_apikey: this.apiKey,
            url: this.endpoint
        });
    }
    private async recognize(text: string, type: string): Promise<any> {
        return await watsonRecognizer(this.nlu, text, type);
    }
    //The below methods can all be abstracted further. Consider this a TO-DO.
    public async entities(input: string): Promise<any> {
        return await this.recognize(input, 'entities');
    }
    public async keyPhrases(input: string): Promise<any> {
        return await this.recognize(input, 'keywords');
    }
    public async detectLanguage(input: string): Promise<any> {
        return Promise.reject(`[detectLanguage] is not supported by this engine. "${ input }" cannot be processed`);
    }
    public async sentiment(input: string): Promise<any> {
        return await this.recognize(input, 'sentiment');
    }
    public async categories(input: string): Promise<any> {
        return await this.recognize(input, 'categories');
    }
    public async concepts(input: string): Promise<any> {
        return await this.recognize(input, 'concepts');
    }
    public async emotion(input: string): Promise<any> {
        return await this.recognize(input, 'emotion');
    }
}

async function watsonRecognizer(nlu: any, text: string, type: string): Promise<any> {
    const input = (typeof text === 'string') ? text : (text as any).documents[0].text;
    const opts = {
        html: input,
        features: {
            [type]: {}
        }
    };
    return new Promise((resolve, reject): any => {
        nlu.analyze(opts, (err, res): any => {
            if(err != null) {
                reject(err);
            }
            const result = res[type].document[type]; //Needs better checking of properties.
            if(type === 'keywords') {
                type = 'keyPhrases';
            }
            resolve({
                documents: [
                    {
                        [type]: result
                    }
                ]
            });
        });
    });
}
