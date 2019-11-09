# Text Analytics Middleware

The Text Analytics Middleware offers Bot Framework middleware components for the Cognitive Services Text Analytics API. You will need an Azure account, as well as a Cognitive Services resource created on Azure. Take a look at the [Microsoft Text Analytics API documentation](https://azure.microsoft.com/en-us/services/cognitive-services/text-analytics/) for details.

## Installing

    npm install @botbuildercommunity/middleware-text-analytics --save

## Usage

All middleware is created and used in the same way. For example, for sentiment analysis, import the `SentimentAnalysis` class from the package, and add it to your bot adapter:

```typescript
import { SentimentAnalysis } from '@botbuildercommunity/middleware-text-analytics';

adapter.use(new SentimentAnalysis(YOUR_TEXT_ANALYTICS_KEY, TEXT_ANALYTICS_API_ENDPOINT, SERVICE_CLIENT_OPTIONS));
```

The `CLIENT_OPTIONS` parameter is optional.

> Note that the TEXT_ANALYTICS_API_ENDPOINT will be the Cognitive Services endpoint root. For example: https://eastus.api.cognitive.microsoft.com

When used, the `turnState` on the `TurnContext` will have a property named `sentimentScore` between 0 and 1. A full example can be seen in the [`sample`](../../samples/middleware-text-analytics/index.js) bot test file.

Supported middleware classes include:

* `SentimentAnalysis`
* `LanguageDetection`
* `KeyPhrases`
* `EntityExtraction`

Each class takes the two required parameters in the example usage above (with the SERVICE_CLIENT_OPTIONS parameter being optional).

In each case, properties are added to the `turnState` of the `TurnContext`. You can retrieve them in your bot via:

* `context.turnState.get('sentimentScore')` //This is a number for `SentimentAnalysis`
* `context.turnState.get('language')` //This is a string for `LanguageDetection`
* `context.turnState.get('keyPhrases')` //This is an array of strings for `KeyPhrases`
* `context.turnState.get('textEntities')` //This is an array of `EntityRecord` types` for `EntityExtraction`
