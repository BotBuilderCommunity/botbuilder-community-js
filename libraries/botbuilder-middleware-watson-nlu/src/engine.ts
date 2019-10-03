import { Engine } from '@botbuildercommunity/middleware-engine-core';
import * as nlup from 'ibm-watson/natural-language-understanding/v1.js';
import { EmotionOptions, EntityOptions } from './schema';

/**
 * @module botbuildercommunity/middleware-watson-nlu
 */

export class WatsonEngine extends Engine {
    private _apikey: string;
    private _url: string;
    private _options: any;
    private _nlu: any;
    public constructor(apikey: string, url: string, opts?: any) {
        super();
        this._apikey = apikey;
        this._url = url;
        this._options = opts;
        this._nlu = this.init();
    }
    private init(): any {
        return new nlup({
            version: '2019-07-12',
            iam_apikey: this._apikey,
            url: this._url
        });
    }
    private async recognize(text: string, type: string, options?: any): Promise<any> {
        return await watsonRecognizer(this._nlu, text, type, options);
    }
    //The below methods can all be abstracted further. Consider this a TO-DO.
    public async entities(input: string, config?: any): Promise<any> {
        const options: EntityOptions = { };
        if(config != null) {
            options.sentiment = (config.sentiment) ? true : false;
            options.emotion = (config.emotion) ? true : false;
        }
        return await this.recognize(input, 'entities', options);
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
    /*
     * The `config` can literally be anything in an object, but comes from `set()`
     * so should be key/value pairs with the value be `any`.
     * For emotion detection, you can pass whether or not to show the whole document results,
     * as well as what words to target.
     * When passed into Watson's NLU, this has a structure of:
     *  {
     *      document: true //Default
     *      targets: ['lions', 'tigers', 'bears']
     *  }
     * Here, we take the config passed into the `emotion()` method, and look for the specific
     * options.
     */
    public async emotion(input: string, config?: any): Promise<any> {
        const options: EmotionOptions = { };
        if(config != null) {
            if(config.document != null) {
                options.document = config.document;
            }
            if(config.targets != null && config.targets instanceof Array) {
                options.targets = config.targets;
            }
        }
        return await this.recognize(input, 'emotion', options);
    }
}

async function watsonRecognizer(nlu: any, text: string, type: string, options: any = { }): Promise<any> {
    const input = (typeof text === 'string') ? text : (text as any).documents[0].text;
    const opts = {
        html: input,
        features: {
            [type]: options
        }
    };
    return new Promise((resolve, reject): any => {
        nlu.analyze(opts, (err, res): any => {
            if(err != null) {
                reject(err);
            }
            else {
                const doc = res[type].document[type]; //Needs better checking of properties.
                if(type === 'keywords') {
                    type = 'keyPhrases';
                }
                const result = {
                    documents: [
                        {
                            [type]: doc
                        }
                    ]
                };
                if(res[type].targets) { // I don't like this. Need a better schema to match all text analysis with.
                    result.documents[0].targets = res[type].targets;
                }
                resolve(result);
            }
        });
    });
}
