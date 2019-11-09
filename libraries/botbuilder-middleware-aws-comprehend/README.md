# AWS Comprehend Middleware

The AWS Comprehend Middleware offers Bot Framework middleware components for the AWS Comprehend API. You will need an AWS  account, as well as a Comprehend resource created on AWS. Take a look at the [Amazon AWS Comprehend documentation](https://aws.amazon.com/comprehend/?nc2=h_m1) for details.

## Installing

    npm install @botbuildercommunity/middleware-aws-comprehend --save

## Authentication

This package assumes that your AWS credentials are set in the environment variables. The following environment variables are required:

    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY

## Usage

All middleware is created and used in the same way. For example, for sentiment analysis, import the `SentimentAnalysis` class from the package, and add it to your bot adapter:

```typescript
import { SentimentAnalysis } from '@botbuildercommunity/middleware-aws-comprehend';

adapter.use(new SentimentAnalysis());
```

When used, the `turnState` on the `TurnContext` will have a property named `sentimentScore` between 0 and 1. A full example can be seen in the [`sample`](../../samples/middleware-aws-comprehend/index.js) bot test file.

> Differences from Cognitive Services and Watson: AWS Comprehend does not return a 0 - 1 response on the sentiment. Instead, it returns 0 - 1 for each possible sentiment. You can access the sentiment through the `sentimentType` property on the `turnState`.

By default, the middleware assumes an East US region and English as the language. You can modify this by passing in `AWSComprehendOptions` to the `SentimentAnalysis`:

```typescript
import { SentimentAnalysis } from '@botbuildercommunity/middleware-aws-comprehend';

adapter.use(new SentimentAnalysis({ apiVersion: '2017-11-27', region: 'us-east-1', lang: 'en' }));
```



Supported middleware classes include:

* `SentimentAnalysis`
* `LanguageDetection`
* `KeyPhrases`
* `EntityExtraction`

In each case, properties are added to the `turnState` of the `TurnContext`. You can retrieve them in your bot via:

* `context.turnState.get('sentimentScore')` //This is a number for `SentimentAnalysis`
* `context.turnState.get('sentimentType')` //This is a string for `SentimentAnalysis`
* `context.turnState.get('language')` //This is a string for `LanguageDetection`
* `context.turnState.get('keyPhrases')` //This is an array of strings for `KeyPhrases`
* `context.turnState.get('textEntities')` //This is an array of strings for `EntityExtraction`
