# Google Cloud Natural Language Middleware

The Google Cloud Natural Language Middleware offers Bot Framework middleware components for the Google Cloud Natural Language API. You will need an Google Cloud  account.

## Installing

    npm install @botbuildercommunity/middleware-google-language --save

## Authentication

This package assumes that your Google Cloud credentials are set in the environment variables. The following environment variables are required:

## Usage

All middleware is created and used in the same way. For example, for sentiment analysis, import the `SentimentAnalysis` class from the package, and add it to your bot adapter:

```typescript
import { SentimentAnalysis } from '@botbuildercommunity/middleware-google-cloud';

adapter.use(new SentimentAnalysis());
```

When used, the `turnState` on the `TurnContext` will have a property named `sentimentScore` between 0 and 1. A full example can be seen in the [`app-google.js`](example/app-google.js) bot test file.

Supported middleware classes include:

* `SentimentAnalysis`
* `LanguageDetection`
* `KeyPhrases`
* `EntityExtraction`

In each case, properties are added to the `turnState` of the `TurnContext`. You can retrieve them in your bot via:

* `context.turnState.get('sentimentScore')` //This is a number for `SentimentAnalysis`
* `context.turnState.get('language')` //This is a string for `LanguageDetection`
* `context.turnState.get('keyPhrases')` //This is an array of strings for `KeyPhrases`
* `context.turnState.get('textEntities')` //This is an array of strings for `EntityExtraction`
