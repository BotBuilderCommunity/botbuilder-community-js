import { CognitiveServicesCredentials } from "ms-rest-azure";
import { TextAnalyticsClient } from "azure-cognitiveservices-textanalytics";
import * as nlup from "watson-developer-cloud/natural-language-understanding/v1-generated";
import { ServiceClientOptions } from "@azure/ms-rest-js";
import { EntitiesBatchResult, MultiLanguageBatchInput } from "azure-cognitiveservices-textanalytics/lib/models";

/**
 * @module botbuildercommunity/text-analytics-middleware
 */

export enum EngineType {
    COGNITIVE_SERVICE = 0,
    WATSON = 1
}

export interface IEngineOptions {
    engine: EngineType;
    ServiceClientOptions: any;
    WatsonClientOptions: any;
}

export interface IWatsonRecognizerOptions {

}


export abstract class Engine {
    public client: any;
    public async abstract entities(input: any);
    public static getEngine(key: string, endpoint: string, options?: IEngineOptions): Engine {
        if(options == null) {
            return new CognitiveServiceEngine(key, endpoint);
        }
        if(options.engine == null) {
            
        }
        switch(options.engine) {
            case EngineType.COGNITIVE_SERVICE:
                return new CognitiveServiceEngine(key, endpoint, options.ServiceClientOptions);
            case EngineType.WATSON:
                return new WatsonEngine(key, endpoint, options.WatsonClientOptions);
        }
    }
}

export class CognitiveServiceEngine extends Engine {
    public credentials: CognitiveServicesCredentials;
    public client: TextAnalyticsClient;
    constructor(serviceKey: string, endpoint: string, options?: ServiceClientOptions) {
        super();
        this.credentials = new CognitiveServicesCredentials(serviceKey);
        this.client = new TextAnalyticsClient(this.credentials, endpoint, options);
    }
    public async entities(input: MultiLanguageBatchInput): Promise<EntitiesBatchResult> {
        return await this.client.entities(input);
    }
}

export class WatsonEngine extends Engine {
    private _apikey: string;
    private _url: string;
    private _options: IWatsonRecognizerOptions;
    private _nlu: any;
    constructor(apikey: string, url: string, opts?: IWatsonRecognizerOptions) {
        super();
        this._apikey = apikey;
        this._url = url;
        this._options = opts;
        this._nlu = this.init();
    }
    private init(): any {
        return new nlup({
            version: "2018-11-16",
            iam_apikey: this._apikey,
            url: this._url
        });
    }
    public entities(): any {

    }
    public recognize(text: string): Promise<any> {
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
                resolve((res));
            });
        });
    }
}
