import * as Twitter from 'twitter';

/**
 * @module botbuildercommunity/adapter-twitter
 */

/*
 * Settings below are in snake case because expected Twitter parameters.
 */
export interface TwitterAdapterSettings extends Twitter.AccessTokenOptions {
    consumer_key: string;
    consumer_secret: string;
}

/*
 * Message properties below are in snake case because expected Twitter parameters.
 */
export interface TwitterMessage {
    id?: number;
    id_str?: string;
    status: string;
    in_reply_to_status_id?: string;
    attachment_url?: string;
}
