import { Activity, ActivityTypes, BotAdapter, TurnContext, ConversationReference, ResourceResponse, WebRequest, WebResponse } from 'botbuilder';
import * as Twitter from 'twitter';
import { TwitterAdapterSettings, TwitterMessage, TwitterActivityAPIMessage, TwitterActivityAPIDirectMessage, TwitterActivityType, TwitterDirectMessage } from './schema';
import { TwitterDirectMessageManager } from './twitterDirectMessage';
import { retrieveBody as rb } from './util';

/**
 * @module botbuildercommunity/adapter-twitter
 */


function createTwitterClient(settings: TwitterAdapterSettings): Twitter {
    return new Twitter(settings);
}

/*
 * The below functions are abstracted out so that they can be replaced by `rewire` during
 * mock unit testing. The `rewire` package looks like it'll replace `require()` generated
 * variables, but not `import` syntax. Need to update this in a future PR, but don't want to
 * halt progress on the adapter.
 */
async function retrieveBody(req: WebRequest): Promise<TwitterActivityAPIMessage & TwitterActivityAPIDirectMessage> {
    return await rb(req);
}

function getWebRequest(req: WebRequest): WebRequest {
    return req;
}

function getWebResponse(resp: WebResponse): WebResponse {
    return resp;
}

export class TwitterAdapter extends BotAdapter {

    public client: Twitter;
    protected readonly settings: TwitterAdapterSettings;
    protected readonly channel: string = 'twitter';

    public constructor(settings: TwitterAdapterSettings) {
        super();
        this.settings = settings;
        try {
            this.client = this.createTwitterClient(settings);
        }
        catch (e) {
            throw new Error(`Error creating Twitter client: ${ e.message }.`);
        }
    }

    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = [];
        for (let i = 0; i < activities.length; i++) {
            const activity: Partial<Activity> = activities[i];

            switch (activity.type) {
                case ActivityTypes.Message:
                    if (!activity.conversation || !activity.conversation.id) {
                        throw new Error(`Activity doesn't contain a conversation id.`);
                    }
                    try {
                        const message: TwitterMessage | TwitterDirectMessage = this.parseActivity(activity);
                        let res: Twitter.ResponseData;
                        if(activity.conversation.conversationType === TwitterActivityType.DIRECTMESSAGE) {
                            res = await TwitterDirectMessageManager.sendDirectMessage(
                                this.settings.consumer_key,
                                this.settings.consumer_secret,
                                this.settings.access_token_key,
                                this.settings.access_token_secret,
                                message as TwitterDirectMessage
                            );
                        }
                        else {
                            res = await this.client.post('statuses/update', message);
                        }
                        const id = (res as any).id_str || (res as any).id;
                        responses.push({ id: id });
                    }
                    catch (error) {
                        throw new Error(`Error parsing activity: ${ error.message }.`);
                    }
                    break;
                default:
                    responses.push({} as ResourceResponse);
                    console.warn(`Unsupported activity type: '${ activity.type }'.`);
                    break;
            }
        }
        return responses;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        throw new Error('Method not supported by the Twitter API.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw new Error('Method not supported by the Twitter API.');
    }

    public async continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promise<void>): Promise<void> {
        const request: Partial<Activity> = TurnContext.applyConversationReference(
            { type: 'event', name: 'continueConversation' },
            reference,
            true
        );
        const context: TurnContext = this.createContext(request);
        return this.runMiddleware(context, logic);
    }

    public async processActivity(request: WebRequest, response: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        //If not a unit test, this just returns itself
        const req = getWebRequest(request);
        const res = getWebResponse(response);

        const body = await retrieveBody(req);

        let message: TwitterMessage = { } as any;
        let directMessage: TwitterDirectMessage = { } as any;
        let messageType: TwitterActivityType;
        let selfMessage = false;

        try {
            if(body.tweet_create_events !== undefined && body.tweet_create_events.length > 0) {
                message = body.tweet_create_events[0];
                if(message.user.screen_name === this.settings.screen_name) {
                    selfMessage = true;
                }
                messageType = TwitterActivityType.TWEET;
            }
            else if(body.direct_message_events !== undefined && body.direct_message_events.length > 0) {
                directMessage  = body.direct_message_events[0];
                message = body.direct_message_events[0].message_create.message_data;
                const users: any[] = (body as any).users;
                const keys: string[] = Object.keys((body as any).users);
                for(const user of keys) {
                    const obj = users[user];
                    if(obj.screen_name === this.settings.screen_name) {
                        if(body.direct_message_events[0].message_create.sender_id === obj.id) {
                            selfMessage = true;
                        }
                    }
                    if(body.direct_message_events[0].message_create.sender_id === obj.id) {
                        (directMessage as any).sender_id = obj.id;
                        (directMessage as any).sender_name = obj.screen_name;
                    }
                    if(body.direct_message_events[0].message_create.target.recipient_id === obj.id) {
                        (directMessage as any).recipient_id = obj.id;
                        (directMessage as any).recipient_name = obj.screen_name;
                    }
                }
                messageType = TwitterActivityType.DIRECTMESSAGE;
            }
            else {
                message = body as any;
                selfMessage = true;
            }
        }
        catch(e) {
            res.status(500);
            res.send(`Failed to retrieve message body: ${ e }`);
            res.end();
        }

        if (message === null) {
            res.status(400);
            res.end();
        }

        const activity = this.getActivityFromTwitterMessage(message, directMessage, messageType);
        if(selfMessage) {
            activity.type = ActivityTypes.Trace;
        }
        const context: TurnContext = this.createContext(activity);
        context.turnState.set('httpStatus', 200);
        await this.runMiddleware(context, logic);
        res.status(context.turnState.get('httpStatus'));
        if (context.turnState.get('httpBody')) {
            res.send(context.turnState.get('httpBody'));
        }
        else {
            res.end();
        }
    }

    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }

    protected createTwitterClient(settings: TwitterAdapterSettings): Twitter {
        return createTwitterClient(settings);
    }

    protected parseActivity(activity: Partial<Activity>): TwitterMessage | TwitterDirectMessage {
        if(activity.conversation.conversationType === TwitterActivityType.DIRECTMESSAGE) {
            return this.createDirectMessage(activity);
        }
        return this.createTweet(activity);
    }

    protected createDirectMessage(activity: Partial<Activity>): TwitterDirectMessage {
        const message: TwitterDirectMessage = { } as any;
        message.type = 'message_create';
        message.message_create = {
            target: {
                recipient_id: activity.recipient.id
            },
            message_data: {
                id: activity.id as any as number,
                id_str: activity.id,
                in_reply_to_status_id: activity.conversation.id,
                in_reply_to_screen_name: activity.recipient.name,
                text: activity.text
            }
        };
        if (activity.attachments && activity.attachments.length > 0) {
            const attachment = activity.attachments[0];
            message.message_create.message_data.attachment_url = attachment.contentUrl;
        }
        return message;
    }

    protected createTweet(activity: Partial<Activity>): TwitterMessage {
        const message: TwitterMessage = { } as any;

        message.status = activity.text;
        if(activity.conversation.id.indexOf('-') === -1) {
            message.in_reply_to_status_id = activity.conversation.id;
        }
        const mention = activity.recipient.name;
        if(mention !== null && !message.status.startsWith(mention)) {
            message.status = `@${ mention } ${ message.status }`;
        }

        if (activity.attachments && activity.attachments.length > 0) {
            const attachment = activity.attachments[0];
            message.attachment_url = attachment.contentUrl;
        }
        return message;
    }

    protected getActivityFromTweet(message: TwitterMessage, messageType: TwitterActivityType): Partial<Activity> {
        return {
            id: (message.id_str !== undefined) ? message.id_str : message.id as any as string,
            timestamp: new Date(),
            channelId: this.channel,
            conversation: {
                id: (message.id_str !== undefined) ? message.id_str : message.id as any as string,
                isGroup: false,
                conversationType: messageType,
                tenantId: null,
                name: ''
            },
            from: {
                id: (message.user !== undefined) ? message.user.id as any as string : null,
                name: (message.user !== undefined) ? message.user.screen_name : null
            },
            recipient: {
                id: message.in_reply_to_screen_name,
                name: message.in_reply_to_screen_name
            },
            text: message.text,
            channelData: message,
            localTimezone: null,
            callerId: null,
            serviceUrl: null,
            listenFor: null,
            label: message.id as any as string,
            valueType: null,
            type: (messageType != null) ? ActivityTypes.Message : null
        };
    }

    protected getActivityFromDirectMessage(message: TwitterMessage, directMessage: TwitterDirectMessage, messageType: TwitterActivityType): Partial<Activity> {
        return {
            id: directMessage.id as any as string,
            timestamp: new Date(),
            channelId: this.channel,
            conversation: {
                id: directMessage.id as any as string,
                isGroup: false,
                conversationType: messageType,
                tenantId: null,
                name: ''
            },
            from: {
                id: (directMessage as any).sender_id,
                name: (directMessage as any).sender_name,
            },
            recipient: {
                id: (directMessage as any).recipient_id,
                name: (directMessage as any).recipient_name
            },
            text: message.text,
            channelData: message,
            localTimezone: null,
            callerId: null,
            serviceUrl: null,
            listenFor: null,
            label: directMessage.id as any as string,
            valueType: null,
            type: (messageType != null) ? ActivityTypes.Message : null
        };
    }

    protected getActivityFromTwitterMessage(message: TwitterMessage, directMessage: TwitterDirectMessage, messageType: TwitterActivityType): Partial<Activity> {

        const activity = (messageType === TwitterActivityType.DIRECTMESSAGE)
            ? this.getActivityFromDirectMessage(message, directMessage, messageType)
            : this.getActivityFromTweet(message, messageType);
        
        if (activity.type === ActivityTypes.Message) {
        
            if(message.entities !== undefined
                    && message.entities.media !== undefined
                    && message.entities.media.length > 0) {
        
                const media = message.entities.media;
                activity.attachments = [];
                for (const medium of media) {
                    let contentType: string;
                    /*
                     * Likely need to do a little more parsing of the content/mime type.
                     */
                    switch(medium.type) {
                        case 'photo':
                            contentType = 'image/png';
                            break;
                        case 'video':
                            contentType = 'video/mpeg';
                            break;
                        case 'animated_gif':
                            contentType = 'image/gif';
                            break;
                        default:
                            break;
                    }
                    const attachment = {
                        contentType: contentType,
                        contentUrl: medium.media_url_https
                    };
                    activity.attachments.push(attachment);
                }
            }
        }
        return activity;
    }

}
