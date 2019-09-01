# AWS Comprehend Middleware

The AWS Comprehend Middleware offers Bot Framework middleware components for the AWS Comprehend API. You will need an AWS  account, as well as a Comprehend resource created on AWS. Take a look at the [Amazon AWS Comprehend documentation](https://aws.amazon.com/comprehend/?nc2=h_m1) for details.

## Installing

    npm install @botbuildercommunity/middleware-aws-comprehend --save

## Usage

All middleware is created and used in the same way. For example, for sentiment analysis, import the `SentimentAnalysis` class from the package, and add it to your bot adapter:

```typescript
import { SentimentAnalysis } from '@botbuildercommunity/middleware-aws-comprehend';

adapter.use(new SentimentAnalysis(___, ___, OPTIONS));
```

The `OPTIONS` parameter is optional.

When used, the `turnState` on the `TurnContext` will have a property named `sentimentScore` between 0 and 1. A full example can be seen in the [`app-aws.js`](example/app-aws.js) bot test file.

Supported middleware classes include:

* `SentimentAnalysis`
* `LanguageDetection`
* `KeyPhrases`
* `EntityExtraction`

Each class takes the two required parameters in the example usage above (with the OPTIONS parameter being optional).

In each case, properties are added to the `turnState` of the `TurnContext`. You can retrieve them in your bot via:

* `context.turnState.get('sentimentScore')` //This is a number for `SentimentAnalysis`
* `context.turnState.get('language')` //This is a string for `LanguageDetection`
* `context.turnState.get('keyPhrases')` //This is an array of strings for `KeyPhrases`
* `context.turnState.get('textEntities')` //This is an array of `EntityRecord` types` for `EntityExtraction`
