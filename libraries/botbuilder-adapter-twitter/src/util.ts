import { WebRequest } from 'botbuilder';
import { parse } from 'qs';
import * as crypto from 'crypto';
import * as Twitter from 'twitter';
import { TwitterResponseToken } from './schema';

/**
 * @module botbuildercommunity/adapter-twitter
 */

function getChallengeResponse(crcToken: string, consumerSecret: string): string {
    return crypto.createHmac('sha256', consumerSecret)
        .update(crcToken)
        .digest('base64');
}

function listSubscription(): string[] {
    return null;
}

export function retrieveBody(req: WebRequest): Promise<any> {
    return new Promise((resolve: any, reject: any): any => {

        const type = req.headers['content-type'] || req.headers['Content-Type'];

        if (req.body) {
            try {
                resolve(req.body);
            }
            catch (err) {
                reject(err);
            }
        }
        else {
            let requestData = '';
            req.on('data', (chunk: string): void => {
                requestData += chunk;
            });
            req.on('end', (): void => {
                try {
                    if (type.includes('application/x-www-form-urlencoded')) {
                        req.body = parse(requestData);
                    }
                    else {
                        req.body = JSON.parse(requestData);
                    }

                    resolve(req.body);
                }
                catch (err) {
                    reject(err);
                }
            });
        }
    });
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

export function registerWebhook() {
    /* /:env/webhooks.json?url=
     */
   //register webhook, twitter will make a crc token request, acquire id (it's the webhook id)
}

export function hasSubscription(client: Twitter, username: string): boolean {
    const subs = listSubscription();
    if(subs.find((e: string) => e === username) !== null) {
        return true;
    }
    return false;
}

export function addSubscription(client: Twitter, username: string, env: string): void {
    const url = `account_activity/all/{env}/subscriptions.json`;
    //https://api.twitter.com/1.1/account_activity/all/:ENV_NAME/subscriptions.json 
}
