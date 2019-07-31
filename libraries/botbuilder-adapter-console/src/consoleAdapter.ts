import { Activity, BotAdapter, ConversationReference, ResourceResponse, TurnContext } from 'botbuilder';
import { createInterface, ReadLine, ReadLineOptions } from 'readline';

/**
 * @module botbuildercommunity/adapter-console
 */

export class ConsoleAdapter extends BotAdapter {
    private _nextID: number = 0;
    private readonly _ref: ConversationReference;
    private readonly _lineOptions: ReadLineOptions = {
        input: process.stdin,
        output: process.stdout,
        terminal: false
    };
    constructor() {
        super();
        this._ref = {
            channelId: 'console',
            user: {
                id: 'user',
                name: 'User'
            },
            bot: {
                id: 'console-adapter-bot',
                name: 'Console Adapter Bot'
            },
            conversation: {
                id: 'conversation',
                name: 'Conversation',
                isGroup: false
            },
            serviceUrl: ''
        } as ConversationReference;
    }

    public processActivity(callback: (context: TurnContext) => Promise<void>): void {
        const read: ReadLine = createInterface(this._lineOptions);
        read.on('line', (text: string) => {
            const activity: Partial<Activity> = TurnContext.applyConversationReference(
                {
                    type: 'message',
                    id: (this._nextID++).toString(),
                    timestamp: new Date(),
                    text: text
                },
                this._ref,
                true);
            this.runMiddleware(new TurnContext(this, activity), callback).catch((err: Error) => {
                throw new Error(err.toString());
            });
        });
    }

    public continueConversation(ref: ConversationReference, callback: (context: TurnContext) => Promise<void>): Promise<void> {
        const activity: Partial<Activity> = TurnContext.applyConversationReference({}, ref, true);

        return this.runMiddleware(new TurnContext(this, activity), callback).catch((err: Error) => {
            throw new Error(err.toString());
        });
    }

    public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        return new Promise((resolve: any): void => {
            function next(i: number): void {
                if (i < activities.length) {
                    const activity: Partial<Activity> = activities[i];
                    responses.push(<ResourceResponse>{});
                    switch (activity.type) {
                        case 'message':
                            /*
                             * The Bot Framework Adapter uses a ClientConnector object to reply/send conversation.
                             * Since the Console Bot does not connect to an endpoint or REST API, we can't use that (code below).
                             * Not sure if there is a better way to return this Promise that isn't an empty object array.
                            if (activity.replyToId) {
                                responses.push(await client.conversations.replyToActivity(
                                    activity.conversation.id,
                                    activity.replyToId,
                                    activity as Activity
                                ));
                            } else {
                                responses.push(await client.conversations.sendToConversation(
                                    activity.conversation.id,
                                    activity as Activity
                                ));
                            }
                            */
                            console.log((activity.text != null) ? activity.text : '');
                            break;
                        default:
                            console.log(`The [${activity.type}] is not supported with the Console Adapter.`);
                            break;
                    }
                    next(i + 1);
                } else {
                    resolve(responses);
                }
            }
            const responses: ResourceResponse[] = [];
            next(0);
        });
    }

    public updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        return Promise.reject(new Error('The method [updateActivity] is not supported by the Console Adapter.'));
    }

    public deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        return Promise.reject(new Error('The method [deleteActivity] is not supported by the Console Adapter.'));
    }

}
