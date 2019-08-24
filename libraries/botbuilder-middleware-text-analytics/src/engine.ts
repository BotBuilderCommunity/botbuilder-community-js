import { Engine } from '@botbuildercommunity/middleware-engine-core';
import { CognitiveServicesCredentials } from 'ms-rest-azure';
import { TextAnalyticsClient } from 'azure-cognitiveservices-textanalytics';
import { ServiceClientOptions } from '@azure/ms-rest-js';
import {
    EntitiesBatchResult,
    MultiLanguageBatchInput,
    KeyPhraseBatchResult,
    SentimentBatchResult,
    LanguageBatchResult
} from 'azure-cognitiveservices-textanalytics/lib/models';

/**
 * @module botbuildercommunity/middleware-text-analytics
 */

export class CognitiveServiceEngine extends Engine {
    public credentials: CognitiveServicesCredentials;
    public client: TextAnalyticsClient;
    public constructor(serviceKey: string, endpoint: string, options?: ServiceClientOptions) {
        super();
        this.credentials = new CognitiveServicesCredentials(serviceKey);
        this.client = new TextAnalyticsClient(this.credentials, endpoint, options);
    }
    public async entities(input: MultiLanguageBatchInput): Promise<EntitiesBatchResult> {
        return await this.client.entities(input);
    }
    public async keyPhrases(input: MultiLanguageBatchInput): Promise<KeyPhraseBatchResult> {
        return await this.client.keyPhrases(input);
    }
    public async detectLanguage(input: MultiLanguageBatchInput): Promise<LanguageBatchResult> {
        return await this.client.detectLanguage(input);
    }
    public async sentiment(input: MultiLanguageBatchInput): Promise<SentimentBatchResult> {
        return await this.client.sentiment(input);
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
