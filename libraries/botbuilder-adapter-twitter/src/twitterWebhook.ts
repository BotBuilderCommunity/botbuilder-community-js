import { WebRequest } from 'botbuilder';
import { parse } from 'qs';
import * as crypto from 'crypto';
import * as Twitter from 'twitter';
import * as request from 'request-promise';
import { TwitterResponseToken, TwitterWebhookResponse } from './schema';
import { getTwitterBearerToken } from './twitterToken';

/**
 * @module botbuildercommunity/adapter-twitter
 */

function getChallengeResponse(crcToken: string, consumerSecret: string): string {
    return crypto.createHmac('sha256', consumerSecret)
        .update(crcToken)
        .digest('base64');
}

export function processWebhook(req: WebRequest, consumerSecret: string): TwitterResponseToken {
    const request = req as any;
    let token: string;
    if(request.query !== undefined && request.query.crc_token !== undefined) {
        token = request.query.crc_token;
    }
    else if(request.url !== undefined) {
        try {
            const parsed = parse(request.url.split('?')[1]);
            token = parsed.crc_token;
        }
        catch(e) {
            console.error(e);
        }
    }
    if(token === null) {
        throw new Error('No query parameter extraction method found.');
    }
    return {
        response_token: `sha256=${getChallengeResponse(token, consumerSecret)}`
    };
}

export async function registerWebhook(client: Twitter, env: string, callbackUrl: string): Promise<number> {
    const result: TwitterWebhookResponse = await client.post(`/account_activity/all/${env}/webhooks.json`, { url: callbackUrl }) as TwitterWebhookResponse;
    return result.id;
}

export async function listWebhooks(consumerKey: string, consumerSecret: string, env: string): Promise<string[]> {
    const bearer = await getTwitterBearerToken(consumerKey, consumerSecret);
    const opts = {
        uri: `https://api.twitter.com/1.1/account_activity/all/${env}/webhooks.json`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearer}`
        },
        resolveWithFullResponse: true
    };
        
    const res: request.RequestPromise = await request(opts);
    const result: TwitterWebhookResponse[] = JSON.parse(res.body as string);
    if(result != null && result.length > 0) {
        try {
            return result.map((e: TwitterWebhookResponse) => e.url);
        }
        catch(e) {
            return [];
        }
    }
    return [];
}
