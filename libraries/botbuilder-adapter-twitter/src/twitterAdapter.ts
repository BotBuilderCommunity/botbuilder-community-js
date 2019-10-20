import { Activity, ActivityTypes, BotAdapter, TurnContext, ConversationReference, ResourceResponse, WebRequest, WebResponse } from 'botbuilder';
import * as Twitter from 'twitter';
import { TwitterMessage, TwitterAdapterSettings } from './schema';
import { retrieveBody as rb, hasSubscription, addSubscription } from './util';

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
async function retrieveBody(req: WebRequest): Promise<TwitterMessage> {
    return await rb(req);
}

function getWebRequest(req: WebRequest): WebRequest {
    return req;
}

function getWebResponse(resp: WebResponse): WebResponse {
    return resp;
}

export class TwitterAdapter extends BotAdapter {

    protected readonly settings: TwitterAdapterSettings;
    protected readonly client: Twitter;
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
                        const message: TwitterMessage = this.parseActivity(activity);
                        const res: Twitter.ResponseData = await this.client.post('statuses/update', message);
                        responses.push({ id: res.id_str });
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

    public async processActivity(request: WebRequest, response: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {

        //If not a unit test, this just returns itself
        const req = getWebRequest(request);
        const res = getWebResponse(response);

        /*
         * Not sure if we can handle this is a single request.
         * We're going to find out.
         */

        const message = await retrieveBody(req);

        if (message === null) {
            res.status(400);
            res.end();
        }

        console.error('This needs to consume a webhook response');
        //This needs to be the Activity API, not what's specified below.
        const activity: Partial<Activity> = {
            id: message.id_str,
            timestamp: new Date(),
            channelId: this.channel,
            conversation: {
                id: message.id_str,
                isGroup: false,
                conversationType: null,
                tenantId: null,
                name: ''
            },
            from: {
                id: message.user.id as any as string,
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
            label: message.id as any as string,
            valueType: null,
            type: null
        };

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

    public ensureSubscription(client: Twitter, settings: TwitterAdapterSettings): void {
        //Will have to store the check. Only need this once for lazy development.
        if(!hasSubscription(client, settings.username)) {
            addSubscription(client, settings.username, settings.activityEnv);
        }
    }

    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }

    protected createTwitterClient(settings: TwitterAdapterSettings): Twitter {
        return createTwitterClient(settings);
    }

    protected parseActivity(activity: Partial<Activity>): TwitterMessage {

        const message: TwitterMessage = { } as any;

        message.status = activity.text;
        message.in_reply_to_status_id = activity.conversation.id;

        const mention = activity.recipient.id;

        if(!message.status.startsWith(mention)) {
            message.status = `@${ mention } ${ message.status }`;
        }

        if (activity.attachments && activity.attachments.length > 0) {
            const attachment = activity.attachments[0];
            message.attachment_url = attachment.contentUrl;
        }

        return message;
    }

}
