import { ServiceClientOptions } from '@azure/ms-rest-js';

/**
 * @module botbuildercommunity/middleware-text-analytics
 */

export interface TextAnalysisOptions extends ServiceClientOptions {
    serviceKey: string;
    endpoint: string;
}
