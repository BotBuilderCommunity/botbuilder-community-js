# Bot Builder Community - JavaScript Extensions

This repository is part of the Bot Builder Community Project and contains Bot Builder Extensions for the JavaScript SDK, including middleware, dialogs, helpers and more. Other repos within the Bot Builder Community Project exist for extensions for [.NET](https://github.com/BotBuilderCommunity/botbuilder-community-dotnet), [Python](https://github.com/BotBuilderCommunity/botbuilder-community-python), [Java](https://github.com/BotBuilderCommunity/botbuilder-community-java) and [tools](https://github.com/BotBuilderCommunity/botbuilder-community-tools) - you can find our other repos under [our GitHub organisation for the project](https://github.com/BotBuilderCommunity/).

## Packages

The following Bot Framework compatible packages are available to install within your chatbot application.

| Name | Description | NPM |
| ---- | ----------- | ----- |
| [botbuilder-dialog-prompts](libraries/botbuilder-dialog-prompts/README.md) | A variety of prompts using the Microsoft text recognizer suite | [![NPM Version](https://img.shields.io/badge/npm-0.2.4-red.svg)](https://www.npmjs.com/package/@botbuildercommunity/dialog-prompts) |

## Middleware

The following Bot Framework compatible packages are available to install within your chatbot application as middleware.

| Name | Description | NPM |
| ---- | ----------- | ------- |
| [botbuilder-storage](libraries/botbuilder-storage/README.md) | Use alternative storage, such as Azure Table Storage in your bot | ![NPM Version](https://img.shields.io/badge/npm-0.2.7-red.svg) |
| [botbuilder-text-analytics-middleware](libraries/botbuilder-text-analytics-middleware/README.md) | Use Cogntive Services Text Analytics API for sentiment analysis, language detection, key phrases, and entity extraction | [![NPM Version](https://img.shields.io/badge/npm-0.2.5-red.svg)](https://www.npmjs.com/package/@botbuildercommunity/text-analytics-middleware) |
| [botbuilder-spell-check-middleware](libraries/botbuilder-spell-check-middleware/README.md) | Use Cogntive Services Spell Check API to detect misspellings and correct these | [![NPM Version](https://img.shields.io/badge/npm-0.2.4-red.svg)](https://www.npmjs.com/package/@botbuildercommunity/spell-check-middleware) |
| [botbuilder-text-recognizer-middleware](libraries/botbuilder-text-recognizer-middleware/README.md) | Use the Microsoft Text Recognizer Suite for recognizing certain text sequences | ![NPM Version](https://img.shields.io/badge/npm-0.2.3-red.svg) |

> The Azure Table Storage package has been deprecated from Microsoft's `botbuilder-js` repository, and is being taken over by the community.

## Adapters

The following Bot Framework compatible packages are available as alternative adapters for creating chatbots.

| Name | Description | NPM |
| ---- | ----------- | ------- |
| [botbuilder-adapters](libraries/botbuilder-adapters/README.md) | Use alternative adapters in your chatbot | ![NPM Version](https://img.shields.io/badge/npm-0.2.4-red.svg) |

The following packages are available from [Botkit](https://github.com/howdyai/botkit), and work with both the Bot Framework and Botkit:

| Name | Description | NPM |
| ---- | ----------- | ------- |
| [botbuilder-adapter-slack](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-slack#readme) | A platform adapter for Slack | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-slack.svg)
| [botbuilder-adapter-webex](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-webex#readme) | A platform adapter for Webex Teams| ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-webex.svg)
| [botbuilder-adapter-hangouts](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-hangouts#readme) | A platform adapter for Google | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-hangouts.svg)
| [botbuilder-adapter-twilio-sms](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-twilio-sms#readme) | A platform adapter for Twilio SMS | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-twilio-sms.svg)
| [botbuilder-adapter-facebook](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-facebook#readme) | A platform adapter for Facebook Messenger | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-facebook.svg)
