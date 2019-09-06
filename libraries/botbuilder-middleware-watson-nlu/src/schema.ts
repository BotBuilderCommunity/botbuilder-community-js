import * as nlup from 'ibm-watson/natural-language-understanding/v1.js';

/**
 * @module botbuildercommunity/middleware-watson-nlu
 */

export interface WatsonOptions extends nlup.Options {
    apiKey: string;
    endpoint: string;
    version: string;
}
