/**
 * @module botbuildercommunity/adapter-twitter
 */

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
