import * as request from 'request-promise';
import { TwitterSubscriptionResponse, TwitterSubscription } from './schema';
import { getTwitterBearerToken } from './twitterToken';

/**
 * @module botbuildercommunity/adapter-twitter
 */

export async function manageSubscription(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string): Promise<boolean> {
    const isSubscribed: boolean = await hasSubscription(consumerKey, consumerSecret, accessToken, accessSecret, env);
    if(!isSubscribed) {
        const success = await addSubscription(consumerKey, consumerSecret, accessToken, accessSecret, env);
        if(success) {
            return true;
        }
        return false;
    }
    return true;
}

export async function hasSubscription(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string): Promise<boolean> {
    const opts = {
        uri: `https://api.twitter.com/1.1/account_activity/all/${env}/subscriptions.json`,
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

export async function addSubscription(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string): Promise<boolean> {
    const opts = {
        uri: `https://api.twitter.com/1.1/account_activity/all/${env}/subscriptions.json`,
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

export async function removeSubscription(consumerKey: string, consumerSecret: string, env: string, userID: string): Promise<boolean> {
    const bearer = await getTwitterBearerToken(consumerKey, consumerSecret);
    const opts = {
        uri: `https://api.twitter.com/1.1/account_activity/all/${env}/subscriptions/${userID}.json`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${bearer}`
        },
        resolveWithFullResponse: true
    };
        
    const res: any = await request(opts);
    if(res.statusCode === 204) {
        return true;
    }
    return false;
}

export async function listSubscriptions(consumerKey: string, consumerSecret: string, env: string): Promise<number[]> {
    const bearer = await getTwitterBearerToken(consumerKey, consumerSecret);
    const opts = {
        uri: `https://api.twitter.com/1.1/account_activity/all/${env}/subscriptions/list.json`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearer}`
        },
        resolveWithFullResponse: true
    };
        
    const res: request.RequestPromise = await request(opts);
    const list: TwitterSubscriptionResponse = JSON.parse(res.body as string);
    const subs: TwitterSubscription[] = list.subscriptions;
    return subs.map((e: TwitterSubscription) => e.user_id);
}
