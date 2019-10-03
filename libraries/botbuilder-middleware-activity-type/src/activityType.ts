import { ActivityTypes, Middleware, TurnContext } from 'botbuilder';

/**
 * @module botbuildercommunity/middleware-activity-type
 */

export class HandleActivityType implements Middleware {
    private activityType: string;
    private callback: Function;
    public constructor(activityType: ActivityTypes, callback: (context: TurnContext) => Promise<void>) {
        this.activityType = activityType;
        this.callback = callback;
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type === this.activityType) {
            await this.callback(context);
        }
        await next();
    }
}
