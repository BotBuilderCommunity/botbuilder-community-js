import * as nlup from "watson-developer-cloud/natural-language-classifier/v1-generated";

/**
 * @module botbuildercommunity/ai
 */

export class WatsonRecognizer {
    private _apikey: string;
    private _url: string;
    private _options: WatsonRecognizerOptions;
    private _nlu: any;
    constructor(apikey: string, url: string, opts?: WatsonRecognizerOptions) {
        this._apikey = apikey;
        this._url = url;
        this._options = opts;
        this._nlu = this.init();
    }
    private init(): any {
        /*
        return new nlup({ //Need to change to classifier; This one is 
            version: "2018-11-16",
            iam_apikey: this._apikey,
            url: this._url
        });
        */
       return new nlup({});
    }
    private process(res: any): WatsonRecognizerResult {
        return null;
    }
    public recognize(text: string): Promise<WatsonRecognizerResult> {
        const opts = {
            html: text,
            features: {
                entities: {},
                keywords: {},
                concepts: {},
                relations: {}
            }
        };
        return new Promise((resolve, reject) => {
            this._nlu.analyze(opts, (err, res) => {
                if(err != null) {
                    reject(err);
                }
                resolve(this.process(res));
            });
        });
    }
}

export interface WatsonRecognizerOptions {

}

export interface WatsonRecognizerResult {

}
