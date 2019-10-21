import { WebRequest } from 'botbuilder';
import { parse } from 'qs';
import * as crypto from 'crypto';
import * as Twitter from 'twitter';
import { TwitterResponseToken, TwitterWebhookResponse } from './schema';

/**
 * @module botbuildercommunity/adapter-twitter
 */

function getChallengeResponse(crcToken: string, consumerSecret: string): string {
    return crypto.createHmac('sha256', consumerSecret)
        .update(crcToken)
        .digest('base64');
}

async function handleSubscription(func: Function, env: string): Promise<boolean> {
    const p: Promise<boolean> = new Promise((resolve, reject) => {
        func(`account_activity/all/${env}/subscriptions.json`, null, (err: string, res: any, raw: any): void => {
            if(raw.statusCode === '204') {
                resolve(true);
            }
            else {
                reject(false);
            }
        });
    });
    const result: boolean = await p;
    return result;
}

export function processWebhook(req: WebRequest, consumerSecret: string): TwitterResponseToken {
    const request = req as any;
    let token: string;
    if(request.getQuery !== undefined) {
        token = request.getQuery('crc_token');
    }
    if(request.query !== undefined) {
        token = request.query.crc_token;
    }
    if(request.url !== undefined) {
        try {
            token = parse(request.url.split('?'));
        }
        catch(e) { }
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

export async function manageSubscription(client: Twitter, env: string): Promise<void> {
    const isSubscribed: boolean = await hasSubscription(client, env);
    if(!isSubscribed) {
        await addSubscription(client, env);
    }
}

export async function hasSubscription(client: Twitter, env: string): Promise<boolean> {
    return await handleSubscription(client.get, env);
}

export async function addSubscription(client: Twitter, env: string): Promise<boolean> {
    return await handleSubscription(client.post, env);
}
