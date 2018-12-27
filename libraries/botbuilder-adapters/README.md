# Adapters

This library contains additional adapters to use with the Microsoft Bot Framework.

## Installation

To install:

    npm install @botbuildercommunity/adapters --save

## Usage

Each adapter can be used in much the same way, as its structure is inherited from the base adapter in the Bot Framework.

### Console Adapter

The console adapter lets you create a chatbot that works from the command line. This was built-in functionality in SDK v3, but was absent from the SDK v4 library. The console bot is limited in which functionality it can implement from the base adapter.

Include it in your bot:

    import { ConsoleAdapter } from "@botbuildercommunity/adapters";

Create the adapter:

    const adapter: ConsoleAdapter = new ConsoleAdapter();

Listen for activities:

    adapter.processActivity(async (context: TurnContext) => {
        ...
    });

From there you can pass the `context` to your bot logic's `onTurn()` method.
