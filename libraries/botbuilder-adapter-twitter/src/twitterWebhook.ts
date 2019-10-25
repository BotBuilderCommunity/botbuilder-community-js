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

export function processWebhook(req: WebRequest, consumerSecret: string): TwitterResponseToken {
    console.log('processWebhook');
    console.log(req);
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
    console.log(token);
    if(token === null) {
        throw new Error('No query parameter extraction method found.');
    }
    console.log(`sha256=${getChallengeResponse(token, consumerSecret)}`);
    return {
        response_token: `sha256=${getChallengeResponse(token, consumerSecret)}`
    };
}

export async function registerWebhook(client: Twitter, env: string, callbackUrl: string): Promise<number> {
    const result: TwitterWebhookResponse = await client.post(`/account_activity/all/${env}/webhooks.json`, { url: callbackUrl }) as TwitterWebhookResponse;
    console.log(result);
    return result.id;
}

export async function listWebhooks(client: Twitter, env: string): Promise<string[]> {
    console.log('listWebhooks');
    const result: any = await client.post(`/account_activity/all/webhooks.json `, { });
    console.log(result);
    if(result != null) {
        try {
            const envs: any = result.environments;
            console.log(envs);
            const currentEnv: any = envs.find((e: any) => e.environment_name === env);
            console.log(currentEnv);
            const webhooks: TwitterWebhookResponse[] = currentEnv;
            return webhooks.map((e: TwitterWebhookResponse) => e.url);
        }
        catch(e) {
            return [];
        }
    }
    return [];
}
