/**
 * @module botbuildercommunity/adapter-twitter
 */

export interface TwitterUser {
    id: number;
    screen_name: string;
}

/*
 * Message properties below are in snake case because expected Twitter parameters.
 */
export interface TwitterMessage {
    id?: number;
    id_str?: string;
    status: string;
    in_reply_to_status_id?: string;
    in_reply_to_screen_name: string;
    attachment_url?: string;
    text: string;
    user: TwitterUser;
    entities: any;
}
