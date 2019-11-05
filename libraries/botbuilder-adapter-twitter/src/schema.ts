import * as Twitter from 'twitter';

/**
 * @module botbuildercommunity/adapter-twitter
 */

/*
 * Message properties below are in snake case because of expected Twitter parameters.
 */

export interface TwitterAdapterSettings extends Twitter.AccessTokenOptions {
    screen_name: string;
}

export interface TwitterUser {
    id: number;
    screen_name: string;
}

export enum TwitterActivityType {
    TWEET = 'tweet',
    DIRECTMESSAGE = 'directMessage'
}

export interface TwitterMessage {
    id?: number;
    id_str?: string;
    status?: string;
    in_reply_to_status_id?: string;
    in_reply_to_screen_name?: string;
    attachment_url?: string;
    text: string;
    user?: TwitterUser;
    entities?: any;
}

export interface TwitterMessageCreate {
    target: any;
    sender_id?: number;
    source_app_id?: number;
    message_data: TwitterMessage;
}

export interface TwitterDirectMessage {
    type: string;
    id: number;
    created_timestamp: number;
    message_create: TwitterMessageCreate;
}

export interface TwitterActivityAPIMessage {
    for_user_id: number;
    tweet_create_events: TwitterMessage[];
}

export interface TwitterActivityAPIDirectMessage {
    for_user_id: number;
    direct_message_events: TwitterDirectMessage[];
}

export interface TwitterResponseToken {
    response_token: string;
}

export interface TwitterWebhookResponse {
    id: number;
    url: string;
    valid: boolean;
    created_at: Date;
}

export interface TwitterSubscriptionResponse {
    environment: string;
    application_id: number;
    subscriptions: TwitterSubscription[];
}

export interface TwitterSubscription {
    user_id: number;
}
