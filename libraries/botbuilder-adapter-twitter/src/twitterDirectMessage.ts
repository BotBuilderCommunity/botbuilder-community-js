import * as request from 'request-promise';
import { TwitterDirectMessage } from './schema';

/**
 * @module botbuildercommunity/adapter-twitter
 */

export class TwitterDirectMessageManager {
    public constructor() {

    }
    
    public static async sendDirectMessage(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, payload: TwitterDirectMessage): Promise<TwitterDirectMessage> {
        const opts = {
            uri: `https://api.twitter.com/1.1/direct_messages/events/new.json`,
            method: 'POST',
            oauth: {
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
                token: accessToken,
                token_secret: accessSecret
            },
            body: {
                event: payload
            },
            json: true,
            resolveWithFullResponse: true
        };
        try {
            const res: request.RequestPromise = await request(opts);
            const result: TwitterDirectMessage = (res.body as any).event;
            return result;
        }
        catch(e) {
            return null;
        }
    }
}
