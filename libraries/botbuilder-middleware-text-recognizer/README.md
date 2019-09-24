# Text Recognizer Middleware

The Text Recognizer Middleware library is a compliment to the Text Recognizer dialog prompts. These middleware components can be used to identify certain text sequences that you might want to alter prior to appearing on the chat window. For example, turning a URL into an actual link, or turning a hashtag into a link that points to a Twitter search.

## Installing

    npm install @botbuildercommunity/middleware-text-recognizer --save

## Usage

All middleware is created and used in the same way. For example, for social media recognition, import the `SocialMediaRecognizer` class from the package, and add it to your bot adapter:

    import { SocialMediaRecognizer } from "@botbuildercommunity/middleware-text-recognizer";

    adapter.use(new SocialMediaRecognizer());

When used, the `turnState` on the `TurnContext` will have a property named `mentionEntities`, which will be an array of strings with the `@` syntax elements.

Supported middleware classes include:

| Class | Property/Properties on `turnState` |
| ---- | ----------- |
| `EmailRecognizer` | `context.turnState.get("emailEntities")` |
| `URLRecognizer` | `context.turnState.get("urlEntities")` |
| `PhoneRecognizer` | `context.turnState.get("phoneNumberEntities")` |
| `SocialMediaRecognizer` | `context.turnState.get("mentionEntities")` or `context.turnState.get("hastagEntities")` |

In each case, the `turnState` of the `TurnContext` contains an array with the various recognized entities.
