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
                    const message = this.parseActivity(activity);
                    try {
                        /*
                         * We'll probably need to send the `in_reply_to_status_id` since the bot will be
                         * in conversation with another user.
                         */
                        const res: any = await new Promise((resolve, reject) => {
                            this.client.post('statuses/update', { status: message }, function(error: string, tweet: string, response: any) {
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

    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        throw new Error('Method not supported by the Twitter API.');
    }

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
            id: message.MessageSid,
            timestamp: new Date(),
            channelId: this.channel,
            conversation: {
                id: message.From,
                isGroup: false,
                conversationType: null,
                tenantId: null,
                name: ''
            },
            from: {
                id: message.From,
                name: ''
            },
            recipient: {
                id: message.To,
                name: ''
            },
            text: message.Body,
            channelData: message,
            localTimezone: null,
            callerId: null,
            serviceUrl: null,
            listenFor: null,
            label: message.MessagingServiceSid,
            valueType: null,
            type: null
        };

        if (activity.type === ActivityTypes.Message) {

            //Does it have an attachment?

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

        /*
         * Create Twitter message
         */

        if (activity.attachments && activity.attachments.length > 0) {
            const attachment = activity.attachments[0];
        }
        return { };
    }

}
