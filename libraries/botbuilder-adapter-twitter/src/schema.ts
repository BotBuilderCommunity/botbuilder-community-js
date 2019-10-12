import * as Twitter from 'twitter';

/**
 * @module botbuildercommunity/adapter-twitter
 */

export interface TwitterSettings extends Twitter.AccessTokenOptions {
    consumer_key: string;
    consumer_secret: string;
}
