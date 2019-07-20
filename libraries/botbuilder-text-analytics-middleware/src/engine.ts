import { CognitiveServicesCredentials } from "ms-rest-azure";
import { TextAnalyticsClient } from "azure-cognitiveservices-textanalytics";
import * as nlup from "watson-developer-cloud/natural-language-understanding/v1-generated";
import { ServiceClientOptions } from "@azure/ms-rest-js";
import {
    EntitiesBatchResult,
    MultiLanguageBatchInput,
    KeyPhraseBatchResult,
    SentimentBatchResult,
    LanguageBatchResult
} from "azure-cognitiveservices-textanalytics/lib/models";

/**
 * @module botbuildercommunity/text-analytics-middleware
 */

export enum EngineType {
    COGNITIVE_SERVICE = 0,
    WATSON = 1
}

export interface IEngineOptions {
    engine: EngineType;
    ClientOptions: any;
}

export abstract class Engine {
    public client: any;
    public async abstract entities(input: any);
    public async abstract keyPhrases(input: any);
    public async abstract detectLanguage(input: any);
    public async abstract sentiment(input: any);
    public async abstract categories(input: any);
    public async abstract concepts(input: any);
    public async abstract emotion(input: any);
    public static getEngine(key: string, endpoint: string, options?: IEngineOptions): Engine {
        if(options == null) {
            return new CognitiveServiceEngine(key, endpoint);
        }
        if(options.engine == null) {
            return new CognitiveServiceEngine(key, endpoint);
        }
        switch(options.engine) {
            case EngineType.COGNITIVE_SERVICE:
                return new CognitiveServiceEngine(key, endpoint, options.ClientOptions);
            case EngineType.WATSON:
                return new WatsonEngine(key, endpoint, options.ClientOptions);
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
    public async keyPhrases(input: MultiLanguageBatchInput): Promise<KeyPhraseBatchResult> {
        return Promise.resolve(null);
    }
    public async detectLanguage(input: MultiLanguageBatchInput): Promise<LanguageBatchResult> {
        return Promise.resolve(null);
    }
    public async sentiment(input: MultiLanguageBatchInput): Promise<SentimentBatchResult> {
        return Promise.resolve(null);
    }
    public async categories(input: string): Promise<any> {
        return Promise.reject("[categories] is not supported by this engine.");
    }
    public async concepts(input: string): Promise<any> {
        return Promise.reject("[concepts] is not supported by this engine.");
    }
    public async emotion(input: string): Promise<any> {
        return Promise.reject("[emotion] is not supported by this engine.");
    }
}

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
            version: "2018-11-16",
            iam_apikey: this._apikey,
            url: this._url
        });
    }
    private recognize(text: string, type: string): Promise<any> {
        return watsonRecognizer(text, type);
    }
    //The below methods can all be abstracted further. Consider this a TO-DO.
    public async entities(input: string): Promise<any> {
        const entities = this.recognize(input, "entities");
        return Promise.resolve(
            {
                documents:[
                    {
                        entities: entities
                    }
                ]
            }
        );
    }
    public async keyPhrases(input: string): Promise<any> {
        const keyPhrases = this.recognize(input, "keywords");
        return Promise.resolve(
            {
                documents:[
                    {
                        keyPhrases: keyPhrases
                    }
                ]
            }
        );
    }
    public async detectLanguage(input: string): Promise<any> {
        return Promise.reject("[detectLanguage] is not supported by this engine.");
    }
    public async sentiment(input: string): Promise<any> {
        const sentiment = this.recognize(input, "sentiment");
        return Promise.resolve(
            {
                documents:[
                    {
                        sentiment: sentiment
                    }
                ]
            }
        );
    }
    public async categories(input: string): Promise<any> {
        const categories = this.recognize(input, "categories");
        return Promise.resolve(
            {
                documents:[
                    {
                        categories: categories
                    }
                ]
            }
        );
    }
    public async concepts(input: string): Promise<any> {
        const concepts = this.recognize(input, "concepts");
        return Promise.resolve(
            {
                documents:[
                    {
                        concepts: concepts
                    }
                ]
            }
        );
    }
    public async emotion(input: string): Promise<any> {
        const emotion = this.recognize(input, "emotion");
        return Promise.resolve(
            {
                documents:[
                    {
                        emotion: emotion
                    }
                ]
            }
        );
    }
}

function watsonRecognizer(text: string, type: string): Promise<any> {
    const opts = {
        html: text,
        features: {
            [type]: {}
        }
    };
    return new Promise((resolve, reject) => {
        this._nlu.analyze(opts, (err, res) => {
            if(err != null) {
                reject(err);
            }
            resolve((res[type]));
        });
    });
}
