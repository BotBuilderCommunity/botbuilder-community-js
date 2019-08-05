# Console Adapter
The console adapter lets you create a chatbot that works from the command line. This was built-in functionality in SDK v3, but was absent from the SDK v4 library. The console bot is limited in which functionality it can implement from the base adapter.

## Installation
To install:

    npm install @botbuildercommunity/adapter-console --save

## Usage
Include it in your bot:

```typescript
import { ConsoleAdapter } from "@botbuildercommunity/adapter-console";
```
Create the adapter:
```typescript
const adapter: ConsoleAdapter = new ConsoleAdapter();
```

Listen for activities:
```typescript
adapter.processActivity(async (context: TurnContext) => {
    ...
});
```

From there you can pass the `context` to your bot logic's `onTurn()` method.
