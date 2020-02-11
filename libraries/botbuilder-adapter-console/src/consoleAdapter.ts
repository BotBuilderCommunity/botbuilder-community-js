import { Activity, ActivityTypes, BotAdapter, ConversationReference, ResourceResponse, TurnContext } from 'botbuilder';
import { createInterface, ReadLine, ReadLineOptions } from 'readline';

/**
 * @module botbuildercommunity/adapter-console
 */

export class ConsoleAdapter extends BotAdapter {

    private _nextID = 0;
    private readonly _ref: ConversationReference;
    private readonly _lineOptions: ReadLineOptions = {
        input: process.stdin,
        output: process.stdout,
        terminal: false
    };

    public constructor() {
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
                isGroup: false,
                tenantId: null,
                conversationType: null
            },
            serviceUrl: ''
        };
    }

    public processActivity(callback: (context: TurnContext) => Promise<void>): void {
        const read: ReadLine = createInterface(this._lineOptions);
        read.on('line', (text: string): void => {
            const activity: Partial<Activity> = TurnContext.applyConversationReference(
                {
                    type: 'message',
                    id: (this._nextID++).toString(),
                    timestamp: new Date(),
                    text: text
                },
                this._ref,
                true);
            this.runMiddleware(new TurnContext(this, activity), callback).catch((err: Error): void => {
                throw new Error(err.toString());
            });
        });
    }

    public continueConversation(ref: ConversationReference, callback: (context: TurnContext) => Promise<void>): Promise<void> {
        const activity: Partial<Activity> = TurnContext.applyConversationReference({}, ref, true);

        return this.runMiddleware(new TurnContext(this, activity), callback).catch((err: Error): void => {
            throw new Error(err.toString());
        });
    }

    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = [];

        for (let i = 0; i < activities.length; i++) {
            const activity: Partial<Activity> = activities[i];

            responses.push({} as ResourceResponse);
            switch (activity.type) {
                case ActivityTypes.Message:
                    console.log((activity.text != null) ? activity.text : '');
                    break;
                default:
                    console.log(`The [${ activity.type }] is not supported with the Console Adapter.`);
            }
        }

        return responses;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        return Promise.reject(new Error('The method [updateActivity] is not supported by the Console Adapter.'));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        return Promise.reject(new Error('The method [deleteActivity] is not supported by the Console Adapter.'));
    }

}