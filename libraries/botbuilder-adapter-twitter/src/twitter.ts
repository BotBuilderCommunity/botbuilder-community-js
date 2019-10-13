import { Activity, ActivityTypes, BotAdapter, TurnContext, ConversationReference, ResourceResponse, WebRequest, WebResponse } from 'botbuilder';
import * as Twitter from 'twitter';
import { TwitterSettings } from './schema';
import { retrieveBody } from './util';

/**
 * @module botbuildercommunity/adapter-twitter
 */

export class TwitterAdapter extends BotAdapter {

    protected readonly settings: TwitterSettings;
    protected readonly client: any;
    protected readonly channel: string = 'twitter';

    public constructor(settings: TwitterSettings) {
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
                        const message = this.parseActivity(activity);
                        const res: any = await new Promise((resolve, reject): any => {
                            this.client.post('statuses/update', message, function(error: string, tweet: string, response: any): void {
                                if(error) {
                                    reject(error);
                                }
                                resolve(response);
                            });
                        });
                        responses.push({ id: res.id });
                    } catch (error) {
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
        throw new Error('Method not supported by Twitter API.');
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

    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {

        const message = await retrieveBody(req);

        if (message == null) {
            res.status(400);
            res.end();
        }

        const activity: Partial<Activity> = {
            id: message.id,
            timestamp: new Date(),
            channelId: this.channel,
            conversation: {
                id: message.id,
                isGroup: false,
                conversationType: null,
                tenantId: null,
                name: ''
            },
            from: {
                id: message.user.id,
                name: message.user.screen_name
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
            label: message.id,
            valueType: null,
            type: null
        };

        if (activity.type === ActivityTypes.Message) {

            if(message.entities.media != null && message.entities.media.length > 0) {
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
                            throw new Error(`Medium doesn't have an associated content type.`);
                    }
                    const attachment = {
                        contentType: contentType,
                        contentUrl: medium.media_url_https
                    };
                    activity.attachments.push(attachment);
                }
            }
        }

        const context: TurnContext = this.createContext(activity);
        context.turnState.set('httpStatus', 200);
        await this.runMiddleware(context, logic);
        res.status(context.turnState.get('httpStatus'));
        if (context.turnState.get('httpBody')) {
            res.send(context.turnState.get('httpBody'));
        } else {
            res.end();
        }
    }

    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }

    protected createTwitterClient(settings: TwitterSettings): Twitter {
        return new Twitter(settings);
    }

    protected parseActivity(activity: Partial<Activity>): any {

        const message = { };

        message['status'] = activity.text;
        message['in_reply_to_status_id'] = activity.conversation.id;

        const mention = activity.recipient.id;

        if(!message['status'].startsWith(mention)) {
            message['status'] = `$@${ mention } ${ message['status'] }`;
        }

        if (activity.attachments && activity.attachments.length > 0) {
            const attachment = activity.attachments[0];
            message['attachment_url'] = attachment.contentUrl;
        }

        return message;
    }
}
