# Sentiment Analysis Middleware

## Building

    git clone https://github.com/BotBuilderCommunity/botbuilder-community-js.git
    cd botbuilder-community-js/libraries/botbuilder-sentiment-middleware
    npm install

> NPM module coming soon...

## Usage

    import { SentimentAnalysis } from "botbuilder-sentiment-middleware";

    adapter.use(new SentimentAnalysis(YOUR_TEXT_ANALYTICS_KEY, TEXT_ANALYTICS_API_ENDPOINT, SERVICE_CLIENT_OPTIONS));

When used, the `turnState` on the `TurnContext` will have a property named `sentimentScore` between 0 and 1.

> Usage assumes installation in the `node_modules` folder. If you are cloning the repository, you will need to access it via the file path wherever it was installed.
