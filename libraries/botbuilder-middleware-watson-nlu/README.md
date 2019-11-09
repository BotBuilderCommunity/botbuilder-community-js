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

When used, the `turnState` on the `TurnContext` will have a property named `emotionDetection`, which is an object containing emotions as properties, with scores as their values. An example can be seen in the [`sample`](../../samples/middleware-watson-nlu/index.js) bot test file.

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

### Emotion Detection

The package includes additional helper functionality for emotion detection to speed your bot development.

#### Setting Targets

Watson's NLU allows you to set specific target keywords for emotional analysis. You can do this by setting a configuration value for targets to a string array:

```typescript
import { EmotionDetection } from '@botbuildercommunity/middleware-watson-nlu';

const emotionDetection = new EmotionDetection(WATSON_API_KEY, WATSON_ENDPOINT, WATSON_OPTIONS);
emotionDetection.set('targets', ['mercury', 'venus', 'mars']);

adapter.use(emotionDetection);
```

> Note that as of this release of Watson's NLU component, setting targets _expects_ one of those targets to be present, and will throw an exception otherwise.

If you set targets, you can access the emotion objects for each of those targets off of the array that gets set in the `TurnState`:

```typescript
const targets = context.turnState.get('emotionTargets');
```

In the above code snippet, `targets` is an array of objects containing the target names and an emotion object per target. It may look something like this:

```typescript
[
    {
        text: 'venus',
        emotion: {
            sadness: 0.044599,
            joy: 0.779204,
            fear: 0.020602,
            disgust: 0.016107,
            anger: 0.020998
        }
    },
    {
        text: 'mars',
        emotion: {
            sadness: 0.044599,
            joy: 0.779204,
            fear: 0.020602,
            disgust: 0.016107,
            anger: 0.020998
        }
    }
]
```

#### Setting the Document

You can also choose to turn off document level analysis by setting the document configuration property to `false`.

```typescript
import { EmotionDetection } from '@botbuildercommunity/middleware-watson-nlu';

const emotionDetection = new EmotionDetection(WATSON_API_KEY, WATSON_ENDPOINT, WATSON_OPTIONS);
emotionDetection.set('document', false);
emotionDetection.set('targets', ['mercury', 'venus', 'mars']);

adapter.use(emotionDetection);
```

#### Static Helper Methods

Since emotion detection returns an object of key/value pairs, we've built a handful of static helper methods off of the `EmotionDetection` class to better enable you to parse and rank results.

* `getEmotions(result: nlup.EntitiesResult | nlup.KeywordsResult): nlup.EmotionScores`

Takes either an `EntitiesResult` or `KeywordsResult` object returned from Watson's NLU and returns an `EmotionScores` object.

* `rankEmotionKeys(emotionScores: nlup.EmotionScores): string[]`

Takes an `EmotionScores` objects and returns a string array of the emotion keys (i.e., names of the emotions) in order of relevance.

* `rankEmotions(emotionScores: nlup.EmotionScores): Emotion[]`

Takes an `EmotionScores` objects and returns a `Emotion` array in order of relevance. The `Emotion` object is an object with a `name` and `score` property.

* `topEmotion(emotionScores: nlup.EmotionScores): string`

Takes an `EmotionScores` object and returns the name of the emotion that is most relevant.

* `topEmotionScore(emotionScores: nlup.EmotionScores): Emotion`

Takes an `EmotionScores` object and returns an `Emotion` object representing the most relevant emotion.

* `calculateDifference(emotionScores: nlup.EmotionScores, firstEmotion?: string, secondEmotion?: string): number`

If called with only the `EmotionScores` object, will return the difference between the top two emotions. If the other two parameters are provided, it'll return the difference between the two specified.

* `calculateVariance(emotionScores: nlup.EmotionScores): number`

Takes an `EmotionScores` object and returns the variance between all emotion scores.

##### Usage

Since these are static methods, you call them directly off of the `EmotionDetection` class. For example:

```typescript
const emotion: string = EmotionDetection.topEmotion(EMOTIONSCORES_OBJECT);
```

### Entity Extraction

The package includes additional helper functionality for entity extraction to speed your bot development.

#### Setting Emotions and Sentiment

Watson's NLU allows you to specify boolean values to turn on emotion detection and sentiment analysis for individual entities. You can set these configuration values using the `set()` method on the middleware:

```typescript
import { EntityExtraction } from '@botbuildercommunity/middleware-watson-nlu';

const entityExtraction = new EntityExtraction(WATSON_API_KEY, WATSON_ENDPOINT, WATSON_OPTIONS);
entityExtraction.set('emotion', true);
entityExtraction.set('sentiment', true);

adapter.use(entityExtraction);
```

#### Static Helper Methods

We've built a handful of static helper methods off of the `EntityExtraction` class to better enable you to parse and rank results.

* `getEntities(entitiesResult: nlup.EntitiesResult[], type?: string): string[]`

Takes an array of `EntitiesResult` and returns an array of strings which are the text entities that have been extracted.

* `rankEntityKeys(entitiesResult: nlup.EntitiesResult[], ranking: RANKING = RANKING.RELEVANCE): string[]`

Takes an array of `EntitiesResult` objects and an option ranking choice (either relevance or confidence) and returns a string array of the entities in order of ranking.

* `rankEntities(entitiesResult: nlup.EntitiesResult[], ranking: RANKING = RANKING.RELEVANCE): nlup.EntitiesResult[]`

Takes an array of `EntitiesResult` objects and returns an ordered array of `EntitiesResult` objects. As above, your ranking can be either according to relevance or confidence.

* `topEntity(entitiesResult: nlup.EntitiesResult[], ranking: RANKING = RANKING.RELEVANCE): string`

Takes an array of `EntitiesResult` objects and an optional ranking and returns the text of the entity ranked the highest.

* `topEntityResult(entitiesResult: nlup.EntitiesResult[], ranking: RANKING = RANKING.RELEVANCE): nlup.EntitiesResult`

Takes an array of `EntitiesResult` objects and an optional ranking and returns an `EntitiesResult` object representing the highest ranking item.

##### Usage

Since these are static methods, you call them directly off of the `EntityExtraction` class. For example:

```typescript
const entity: string = EntityExtraction.topEntity(ENTITYRESULT_OBJECT);
```

### Keywords/Key Phrases

The package includes additional helper functionality for handling key phrases to speed your bot development.

#### Setting Emotions and Sentiment

Watson's NLU allows you to specify boolean values to turn on emotion detection and sentiment analysis for individual keywords and phrases. You can set these configuration values using the `set()` method on the middleware:

```typescript
import { KeyPhrases } from '@botbuildercommunity/middleware-watson-nlu';

const keyPhrases = new KeyPhrases(WATSON_API_KEY, WATSON_ENDPOINT, WATSON_OPTIONS);
keyPhrases.set('emotion', true);
keyPhrases.set('sentiment', true);

adapter.use(keyPhrases);
```

#### Static Helper Methods

We've built a handful of static helper methods off of the `KeyPhrases` class to better enable you to parse and rank results.

* `rankKeywordKeys(keywordsResult: nlup.KeywordsResult[]): string[]`

Takes an array of `KeywordsResult` objects and returns a string array of the keywords in order of relevance.

* `rankKeywords(keywordsResult: nlup.KeywordsResult[]): nlup.KeywordsResult[]`

Takes an array of `KeywordsResult` objects and returns an ordered array of `KeywordsResult` objects by relevance.

* `topKeyword(keywordsResult: nlup.KeywordsResult[]): string`

Takes an array of `KeywordsResult` objects and returns the text of the keyword ranked the highest.

* `topKeywordResult(keywordsResult: nlup.KeywordsResult[]): nlup.KeywordsResult`

Takes an array of `KeywordsResult` objects and returns a `KeywordsResult` object representing the highest ranking item.

##### Usage

Since these are static methods, you call them directly off of the `KeywordsResult` class. For example:

```typescript
const keyword: string = KeywordsResult.topKeyword(KEYWORDRESULT_OBJECT);
```
