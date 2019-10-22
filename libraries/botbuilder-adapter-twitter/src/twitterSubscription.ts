import * as Twitter from 'twitter';
import { TwitterSubscriptionResponse, TwitterSubscription } from './schema';

/**
 * @module botbuildercommunity/adapter-twitter
 */

async function handleSubscription(func: Function, env: string): Promise<boolean> {
    const p: Promise<boolean> = new Promise((resolve, reject) => {
        func(`/account_activity/all/${env}/subscriptions.json`, null, (err: string, res: any, raw: any): void => {
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

export async function listSubscriptions(client: Twitter, env: string): Promise<number[]> {
    const list: TwitterSubscriptionResponse = await client.get(`/account_activity/all/${env}/subscriptions/list.json`, { }) as TwitterSubscriptionResponse;
    const subs: TwitterSubscription[] = list.subscriptions;
    return subs.map((e: TwitterSubscription) => e.user_id);
}
