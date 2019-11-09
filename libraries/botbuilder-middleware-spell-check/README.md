# Spell Check Middleware

The Spell Check Middleware offers Bot Framework middleware components for the Cognitive Services Bing Spell Check API. You will need an Azure account, as well as a Cognitive Services resource created on Azure. Take a look at the [Bing Spell Check API documentation](https://azure.microsoft.com/en-us/services/cognitive-services/spell-check/) for details.

## Installing

    npm install @botbuildercommunity/middleware-spell-check --save

## Usage

All middleware is created and use in the same way. For example, for spell check, import the `SpellCheck` class from the package, and add it to your bot adapter:

```typescript
import { SpellCheck } from '@botbuildercommunity/middleware-spell-check';

adapter.use(new SpellCheck(YOUR_BING_SPELL_CHECK_KEY));
```

When used, the `turnState` on the `TurnContext` will have a property named `suggestion` which is the actual suggestion. Furthermore `turnState` will have a property `token` which is the phrase which has been classified by the service to be replaced by the suggestion. A full example can be seen in the [`sample`](../../samples/middleware-spell-check/index.js) bot test file.

Supported middleware classes include:

* `SpellCheck`

Each class takes the one required parameter like in the example usage above.

In each case, properties are added to the `turnState` of the `TurnContext` You can retrieve them in your bot via:

* `context.turnState.get("token")` //This is the token which you could replace by `suggestion`
* `context.turnState.get("suggestion")` //This is the suggestion which the `token` could be replaced with
