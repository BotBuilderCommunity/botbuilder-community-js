import { WebRequest } from 'botbuilder';
import { parse } from 'qs';
import * as crypto from 'crypto';
import * as Twitter from 'twitter';
import * as request from 'request-promise';
import { TwitterResponseToken, TwitterWebhookResponse } from './schema';
import { TwitterTokenManager } from './twitterToken';

/**
 * @module botbuildercommunity/adapter-twitter
 */

async function getBearerToken(consumerKey: string, consumerSecret: string): Promise<string> {
    return await TwitterTokenManager.getBearerToken(consumerKey, consumerSecret);
}

export class TwitterWebhookManager {
    public constructor() {

    }
    private static getChallengeResponse(crcToken: string, consumerSecret: string): string {
        return crypto.createHmac('sha256', consumerSecret)
            .update(crcToken)
            .digest('base64');
    }
    
    public static processWebhook(req: WebRequest, consumerSecret: string): TwitterResponseToken {
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
            response_token: `sha256=${ TwitterWebhookManager.getChallengeResponse(token, consumerSecret) }`
        };
    }
    
    public static async registerWebhook(client: Twitter, env: string, callbackUrl: string): Promise<number> {
        const result: TwitterWebhookResponse = await client.post(`/account_activity/all/${ env }/webhooks.json`, { url: callbackUrl }) as TwitterWebhookResponse;
        return result.id;
    }
    
    public static async listWebhooks(consumerKey: string, consumerSecret: string, env: string): Promise<TwitterWebhookResponse[]> {
        const bearer = await getBearerToken(consumerKey, consumerSecret);
        const opts = {
            uri: `https://api.twitter.com/1.1/account_activity/all/${ env }/webhooks.json`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ bearer }`
            },
            resolveWithFullResponse: true
        };
            
        const res: request.RequestPromise = await request(opts);
        const result: TwitterWebhookResponse[] = JSON.parse(res.body as string);
        if(result != null && result.length > 0) {
            try {
                return result;
            }
            catch(e) {
                return [];
            }
        }
        return [];
    }
    
    public static async removeWebhook(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string, webhookID: number): Promise<boolean> {
        const opts = {
            uri: `https://api.twitter.com/1.1/account_activity/all/${ env }/webhooks/${ webhookID }.json`,
            method: 'DELETE',
            oauth: {
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
                token: accessToken,
                token_secret: accessSecret
            },
            resolveWithFullResponse: true
        };
        try {
            const res: any = await request(opts);
            if(res.statusCode === 204) {
                return true;
            }
            return false;
        }
        catch(e) {
            return false;
        }
    }
    
    public static async updateWebhook(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string, webhookID: number): Promise<boolean> {
    
        const opts = {
            uri: `https://api.twitter.com/1.1/account_activity/all/${ env }/webhooks/${ webhookID }.json`,
            method: 'PUT',
            oauth: {
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
                token: accessToken,
                token_secret: accessSecret
            },
            resolveWithFullResponse: true
        };
        try {
            const res: any = await request(opts);
            if(res.statusCode === 204) {
                return true;
            }
            return false;
        }
        catch(e) {
            return false;
        }
    }
}
