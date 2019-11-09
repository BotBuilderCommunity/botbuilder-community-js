# Google Cloud Platform Natural Language API Middleware

The Google Cloud Platform Natural Language API Middleware offers Bot Framework middleware components for the Google Cloud Platform Natural Language API. You will need an Google Cloud  account.

## Installing

    npm install @botbuildercommunity/middleware-google-language --save

## Authentication

This package assumes that you have a Google Cloud Platform account. Your Google Cloud key needs to be stored on the filesystem (it's in a JSON file), and a `GOOGLE_APPLICATION_CREDENTIALS` environment variable should point to that file. See [Google's quickstart guide](https://cloud.google.com/natural-language/docs/quickstart-client-libraries) for more information.

## Usage

All middleware is created and used in the same way. For example, for sentiment analysis, import the `SentimentAnalysis` class from the package, and add it to your bot adapter:

```typescript
import { SentimentAnalysis } from '@botbuildercommunity/middleware-google-cloud';

adapter.use(new SentimentAnalysis());
```

When used, the `turnState` on the `TurnContext` will have a property named `sentimentScore` between 0 and 1. A full example can be seen in the [`sample`](../../samples/middleware-google-language/index.js) bot test file.

Supported middleware classes include:

* `SentimentAnalysis`
* `CategoryExtraction`
* `EntityExtraction`

In each case, properties are added to the `turnState` of the `TurnContext`. You can retrieve them in your bot via:

* `context.turnState.get('sentimentScore')` //This is a number for `SentimentAnalysis`
* `context.turnState.get('categoryEntities')` //This is an array of object containing a `name` property and a `confidence` property for `CategoryExtraction`
* `context.turnState.get('textEntities')` //This is an array of strings for `EntityExtraction`

> Note that the `CategoryExtraction` middleware component might not return any values if the text is too little, or if the classification cannot find a match.
