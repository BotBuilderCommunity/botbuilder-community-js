# Sentiment Analysis Middleware

## Installing

    npm install @botbuildercommunity/sentiment-middleware --save

## Usage

    import { SentimentAnalysis } from "@botbuildercommunity/sentiment-middleware";

    adapter.use(new SentimentAnalysis(YOUR_TEXT_ANALYTICS_KEY, TEXT_ANALYTICS_API_ENDPOINT, SERVICE_CLIENT_OPTIONS));

> Note that TEXT_ANALYTICS_API_ENDPOINT will be the Cognitive Services endpoint root. For example: https://eastus.api.cognitive.microsoft.com

When used, the `turnState` on the `TurnContext` will have a property named `sentimentScore` between 0 and 1. A full example can be seen in the [`bot.js`](test/bot.js) bot test file.
