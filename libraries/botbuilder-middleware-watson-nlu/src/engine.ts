import { Engine } from '@botbuildercommunity/middleware-engine-core';
import * as nlup from 'ibm-watson/natural-language-understanding/v1.js';

/**
 * @module botbuildercommunity/middleware-watson-nlu
 */

export class WatsonEngine extends Engine {
    private _apikey: string;
    private _url: string;
    private _options: any;
    private _nlu: any;
    constructor(apikey: string, url: string, opts?: any) {
        super();
        this._apikey = apikey;
        this._url = url;
        this._options = opts;
        this._nlu = this.init();
    }
    private init(): any {
        return new nlup({
            version: '2018-11-16',
            iam_apikey: this._apikey,
            url: this._url
        });
    }
    private async recognize(text: string, type: string): Promise<any> {
        return await watsonRecognizer(this._nlu, text, type);
    }
    //The below methods can all be abstracted further. Consider this a TO-DO.
    public async entities(input: string): Promise<any> {
        return await this.recognize(input, 'entities');
    }
    public async keyPhrases(input: string): Promise<any> {
        return await this.recognize(input, 'keywords');
    }
    public async detectLanguage(input: string): Promise<any> {
        return Promise.reject('[detectLanguage] is not supported by this engine.');
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
    const input = (typeof text === 'string') ? text : (<any>text).documents[0].text;
    const opts = {
        html: input,
        features: {
            [type]: {}
        }
    };
    return new Promise((resolve, reject) => {
        nlu.analyze(opts, (err, res) => {
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
