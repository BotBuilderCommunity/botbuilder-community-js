# Watson NLU Middleware

The Watson NLU Middleware offers Bot Framework middleware components for the IBM Watson NLU API. You will need an IBM Cloud account. Take a look at the [IBM Watson NLU API documentation](https://www.ibm.com/watson/services/natural-language-understanding/) for details.

## Installing

    npm install @botbuildercommunity/middleware-watson-nlu --save

## Usage

All middleware is created and used in the same way. For example, for emotion detection, import the `EmotionDetection` class from the package, and add it to your bot adapter:

```typescript
import { EmotionDetection } from '@botbuildercommunity/middleware-watson-nlu';

adapter.use(new EmotionDetection(WATSON_API_KEY, WATSON_ENDPOINT, WATSON_OPTIONS));
```

The `WATSON_OPTIONS` parameter is optional.

When used, the `turnState` on the `TurnContext` will have a property named `emotionDetection`, which is an object containing emotions as properties, with scores as their values. An example can be seen in the [`app-watson.js`](example/app-watson.js) bot test file.

Supported middleware classes include:

* `CategoryExtraction`
* `ConceptExtraction`
* `EmotionDetection`
* `EntityExtraction`
* `KeyPhrases`
* `SentimentAnalysis`

Each class takes the two required parameters in the example usage above (with the WATSON_OPTIONS parameter being optional).

In each case, properties are added to the `turnState` of the `TurnContext`. You can retrieve them in your bot via:

* `context.turnState.get('categoryEntities')`
* `context.turnState.get('conceptEntities')`
* `context.turnState.get('emotionDetection')`
* `context.turnState.get('textEntities')`
* `context.turnState.get('keyPhrases')`
* `context.turnState.get('sentimentScore')`
