import * as request from 'request-promise';

/**
 * @module botbuildercommunity/adapter-twitter
 */

export class TwitterTokenManager {
    public constructor() {

    }
    public static async getBearerToken(consumerKey: string, consumerSecret: string): Promise<string> {
        const base: string = Buffer.from(`${ consumerKey }:${ consumerSecret }`).toString('base64');
        const opts = {
            uri: 'https://api.twitter.com/oauth2/token',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${ base }`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: 'grant_type=client_credentials',
            resolveWithFullResponse: true
        };
            
        const res: request.RequestPromise = await request(opts);
        const body = JSON.parse(res.body as string);
        return body.access_token;
    }
    
}
