import * as request from 'request-promise';
import { TwitterSubscriptionResponse, TwitterSubscription } from './schema';
import { TwitterTokenManager } from './twitterToken';

/**
 * @module botbuildercommunity/adapter-twitter
 */

async function getBearerToken(consumerKey: string, consumerSecret: string): Promise<string> {
    return await TwitterTokenManager.getBearerToken(consumerKey, consumerSecret);
}

export class TwitterSubscriptionManager {
    public constructor() {

    }
    public static async manageSubscription(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string): Promise<boolean> {
        const isSubscribed: boolean = await TwitterSubscriptionManager.hasSubscription(consumerKey, consumerSecret, accessToken, accessSecret, env);
        if(!isSubscribed) {
            const success = await TwitterSubscriptionManager.addSubscription(consumerKey, consumerSecret, accessToken, accessSecret, env);
            if(success) {
                return true;
            }
            return false;
        }
        return true;
    }
    
    public static async hasSubscription(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string): Promise<boolean> {
        const opts = {
            uri: `https://api.twitter.com/1.1/account_activity/all/${ env }/subscriptions.json`,
            method: 'GET',
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
    
    public static async addSubscription(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string): Promise<boolean> {
        const opts = {
            uri: `https://api.twitter.com/1.1/account_activity/all/${ env }/subscriptions.json`,
            method: 'POST',
            oauth: {
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
                token: accessToken,
                token_secret: accessSecret
            },
            resolveWithFullResponse: true
        };
              
        const res: any = await request(opts);
        if(res.statusCode === 204) {
            return true;
        }
        return false;
    }
    
    public static async removeSubscription(consumerKey: string, consumerSecret: string, env: string, userID: string): Promise<boolean> {
        const bearer = await getBearerToken(consumerKey, consumerSecret);
        const opts = {
            uri: `https://api.twitter.com/1.1/account_activity/all/${ env }/subscriptions/${ userID }.json`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${ bearer }`
            },
            resolveWithFullResponse: true
        };
            
        const res: any = await request(opts);
        if(res.statusCode === 204) {
            return true;
        }
        return false;
    }
    
    public static async listSubscriptions(consumerKey: string, consumerSecret: string, env: string): Promise<number[]> {
        const bearer = await getBearerToken(consumerKey, consumerSecret);
        const opts = {
            uri: `https://api.twitter.com/1.1/account_activity/all/${ env }/subscriptions/list.json`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ bearer }`
            },
            resolveWithFullResponse: true
        };
            
        const res: request.RequestPromise = await request(opts);
        const list: TwitterSubscriptionResponse = JSON.parse(res.body as string);
        const subs: TwitterSubscription[] = list.subscriptions;
        return subs.map((e: TwitterSubscription): number => e.user_id);
    }
    
}
