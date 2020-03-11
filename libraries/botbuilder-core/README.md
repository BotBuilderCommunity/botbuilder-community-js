# BotBuilder Community Core

This package should not be used directly in your Bot Framework chatbot. Instead, it is used in other packages to minimize code repetition.

## CustomWebAdapter

The CustomWebAdapter adds two extra functions to the default `BotAdapter`. `retrieveBody` could be used to retrieve the body of a HTTP request and it will automatically serialize JSON and url-encoded content. `delay` could be used as a helper function for the delay activity.

It is possible to use the [Bot Service OAuth functionality](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-authentication?view=azure-bot-service-4.0) by passing in the optional `BotFrameworkAdapterSettings` object. If you want to implement your own OAuth functionality in `YourOwnAdapter`, you could override the existing OAuth functions found in `IUserTokenProvider`. Sample code for adding OAuth to your bot can be found [here](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-authentication?view=azure-bot-service-4.0&tabs=javascript).

```typescript
import { CustomWebAdapter } from '@botbuildercommunity/core';

export class YourOwnAdapter extends CustomWebAdapter {

    protected readonly yourOwnAdapterSettings: YourOwnAdapterSettings;

    public constructor(yourOwnAdapterSettings: YourOwnAdapterSettings, botFrameworkAdapterSettings?: BotFrameworkAdapterSettings) {
        // Add optional botFrameworkAdapterSettings to enable OAuth on custom adapters
        super(botFrameworkAdapterSettings);
    }

    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        const body = this.retrieveBody(req);
        ...
    }

    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = [];

        for (let i = 0; i < activities.length; i++) {
            const activity: Partial<Activity> = activities[i];

            switch (activity.type) {
                case 'delay':
                    await delay(activity.value);
                    responses.push({} as ResourceResponse);
                    break;
                    ...
            }
        }
    }
}
```
