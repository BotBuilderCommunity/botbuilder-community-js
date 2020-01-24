# Dialog Prompts

This is a (currently experimental) suite of dialog prompts that uses Microsoft's recognizer text suite to recognize certain types of input during a dialog prompt. Microsoft's Bot Framework team has implemented a handful of prompts using recognizers from the recognizer text suite. This library is meant to fill the gaps.

> Currently, this library and subsequent NPM are experimental. Please use at your own risk. Feel free to test, debug, and submit pull requests if you come across any issues.

## Installation

You can install this library via NPM:

    npm install @botbuildercommunity/dialog-prompts --save

## Number with Unit

The number with unit prompt allows you to prompt for four different unit types:

* Currency
* Temperature
* Age
* Dimension

```javascript
dialogs.add(new NumberWithUnitPrompt('numberPrompt', NumberWithUnitPromptType.Currency);
```

It returns a `NumberWithUnitResult`. You can see the interface below.

```typescript
export interface NumberWithUnitResult
{
    unit: string
    , value: any
}
```

## Number with Type

Number with type allows you to accept numbers from the follow type enum:

* Ordinal
* Percentage

```javascript
dialogs.add(new NumberWithTypePrompt('numberPrompt', NumberWithTypePrompt.Ordinal);
```

## Phone Number

The `PhoneNumberPrompt` will extract a phone number from a message from the user.

## Email Address

The `EmailPrompt` will extract an email address from a message from the user.

## Internet Protocols

The `InternetProtocolPrompt` will extract one of the following types based on which `InternetProtocolPromptType` enum value is passed in:

* IPAddress
* URL

## Social Media

The `SocialMediaPrompt` will extract one of the following types based on which `SocialMediaPromptType` enum value is passed in:

* Mention
* Hashtag

## GUID

The `GUIDPrompt` will extract a GUID from a message from the user.

## Adaptive Card

* Includes validation for specified required input fields
* Displays custom message if user replies via text and not card input
* Ensures input is only valid if it comes from the appropriate card (not one shown previous to prompt)

### Usage

```js
// Load an adaptive card
const cardJson = require('./adaptiveCard.json');
const card = CardFactory.adaptiveCard(cardJson);

// Configure settings - All optional
const promptSettings = {
    card: card,
    inputFailMessage: 'Please fill out the adaptive card',
    requiredInputIds: [
        'inputA',
        'inputB',
    ],
    missingRequiredInputsMessage: 'The following inputs are required',
    attemptsBeforeCardRedsiplayed: 5,
    promptId: 'myCustomId'
}

// Initialize the prompt
const adaptiveCardPrompt = new AdaptiveCardPrompt('adaptiveCardPrompt', null, promptSettings);

// Add the prompt to your dialogs
dialogSet.add(adaptiveCardPrompt);

// Call the prompt
return await stepContext.prompt('adaptiveCardPrompt');

// Use the result
const result = stepContext.result;
```

### Adaptive Cards

Card authors describe their content as a simple JSON object. That content can then be rendered natively inside a host application, automatically adapting to the look and feel of the host. For example, Contoso Bot can author an Adaptive Card through the Bot Framework, and when delivered to Cortana, it will look and feel like a Cortana card. When that same payload is sent to Microsoft Teams, it will look and feel like Microsoft Teams. As more host apps start to support Adaptive Cards, that same payload will automatically light up inside these applications, yet still feel entirely native to the app. Users win because everything feels familiar. Host apps win because they control the user experience. Card authors win because their content gets broader reach without any additional work.

The Bot Framework provides support for Adaptive Cards.  See the following to learn more about Adaptive Cards.

- [Adaptive card](http://adaptivecards.io)
- [Send an Adaptive card](https://docs.microsoft.com/en-us/azure/bot-service/nodejs/bot-builder-nodejs-send-rich-cards?view=azure-bot-service-3.0&viewFallbackFrom=azure-bot-service-4.0#send-an-adaptive-card)

### Getting Input Data From Adaptive Cards

In a `TextPrompt`, the user response is returned in the `Activity.Text` property, which only accepts strings. Because Adaptive Cards can contain multiple inputs, the user response is sent as a JSON object in `Activity.Value`, like so:

```json
const activity = {
    [...]
    "value": {
        "inputA": "response A",
        "inputB": "response B",
        [...etc]
    }
}
```

Because of this, it can be a little difficult to gather user input using an Adaptive Card within a dialog. The `AdaptiveCardPrompt` allows you to do so easily and returns the JSON object user response in `stepContext.result`.
