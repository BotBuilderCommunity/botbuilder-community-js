# Activity Type Middleware

This middleware package is a Node.JS port of the [C# Activity Type middleware component](https://github.com/BotBuilderCommunity/botbuilder-community-dotnet/tree/develop/libraries/Bot.Builder.Community.Middleware.HandleActivityType) from the Bot Builder Community. It intercepts messages based on the activity type so that you can automatically handle certain types outside of the standard dialog flow.

## Installing

    npm install @botbuildercommunity/middleware-activity-type --save

## Usage

```typescript
import { HandleActivityType } from '@botbuildercommunity/middleware-activity-type';

adapter.use(new HandleActivityType(ActivityTypes.Message, async (context, next) => {
    await context.sendActivity('Hello, middleware!');
}));
```
