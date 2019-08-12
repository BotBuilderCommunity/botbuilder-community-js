[![Build Status](https://dev.azure.com/BotBuilder-Community/js/_apis/build/status/BotBuilderCommunity.botbuilder-community-js?branchName=master)](https://dev.azure.com/BotBuilder-Community/js/_build/latest?definitionId=3&branchName=master)

# Bot Builder Community - JavaScript Extensions

This repository is part of the Bot Builder Community Project and contains Bot Builder Extensions for the JavaScript SDK, including middleware, dialogs, helpers and more. Other repos within the Bot Builder Community Project exist for extensions for [.NET](https://github.com/BotBuilderCommunity/botbuilder-community-dotnet), [Python](https://github.com/BotBuilderCommunity/botbuilder-community-python), [Java](https://github.com/BotBuilderCommunity/botbuilder-community-java) and [tools](https://github.com/BotBuilderCommunity/botbuilder-community-tools) - you can find our other repos under [our GitHub organisation for the project](https://github.com/BotBuilderCommunity/).

To see a list of current extensions available for the Bot Builder JavaScript SDK, use the links below to jump to a section.

* [Storage](#storage)
* [Dialogs & Prompts](#dialogs-and-prompts)
* [Middleware](#middleware)
* [Adapters](#adapters)

## Installation

Each extension, such as middleware or recognizers, is available individually from NPM in the `@botbuildercommunity` scope. See each individual component description for installation details and links.

## Contributing and Reporting Issues

We welcome and encourage contributions to this project, in the form of bug fixes, enhancements or new extensions. Please fork the repo and raise a PR if you have something you would like us to review for inclusion. If you want to discuss an idea first then the best way to do this right now is to raise a GitHub issue or reach out to one of us on Twitter.

## Storage

The following alternative storage implementations are currently available;

| Name | Description | NPM |
| ---- | ----------- | ----- |
| [@botbuildercommunity/storage](libraries/botbuilder-storage/README.md) | Use alternative storage, such as Azure Table Storage in your bot. | ![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/storage.svg) |

> The Azure Table Storage package has been deprecated from Microsoft's `botbuilder-js` repository, and is being taken over by the community.

## Dialogs and Prompts
The following dialogs are currently available;

| Name | Description | NPM |
| ---- | ----------- | ----- |
| [@botbuildercommunity/dialog-prompts](libraries/botbuilder-dialog-prompts/README.md) | A variety of prompts using the [Microsoft Recognizers Text](https://github.com/microsoft/Recognizers-Text) suite, such as currency, temperature, age and dimension.  | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/dialog-prompts.svg)](https://www.npmjs.com/package/@botbuildercommunity/dialog-prompts) |

## Middleware

The following pieces of middleware are currently available;

| Name | Description | NPM |
| ---- | ----------- | ------- |
| [@botbuildercommunity/middleware-text-analytics](libraries/botbuilder-middleware-text-analytics/README.md) | Use Cognitive Services Text Analytics API for sentiment analysis, language detection, key phrases and entity extraction. | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/middleware-text-analytics.svg)](https://www.npmjs.com/package/@botbuildercommunity/middleware-text-analytics) |
| [@botbuildercommunity/middleware-watson-nlu](libraries/botbuilder-middleware-watson-nlu/README.md) | Use IBM Watson's NLU for sentiment analysis, key phrases, categories, concepts, emotion detection, and entity extraction. | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/middleware-watson-nlu.svg)](https://www.npmjs.com/package/@botbuildercommunity/middleware-watson-nlu) |
| [@botbuildercommunity/spell-check-middleware](libraries/botbuilder-spell-check-middleware/README.md) | Use Cognitive Services Spell Check API to detect misspellings and correct these. | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/spell-check-middleware.svg)](https://www.npmjs.com/package/@botbuildercommunity/spell-check-middleware) |
| [@botbuildercommunity/middleware-text-recognizer](libraries/botbuilder-middleware-text-recognizer/README.md) | Use the [Microsoft Recognizers Text](https://github.com/microsoft/Recognizers-Text) Suite for recognizing certain text sequences. | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/middleware-text-recognizer.svg)](https://www.npmjs.com/package/@botbuildercommunity/middleware-text-recognizer) |

## Adapters

The following adapters can be used to expose your bot on additional channels not supported by the Azure Bot Service, such as Webex and Google Hangouts.

| Name | Description | NPM |
| ---- | ----------- | ------- |
| [@botbuildercommunity/adapter-console](libraries/botbuilder-adapter-console/README.md) | A platform adapter for the console / terminal | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/adapter-console.svg)](https://www.npmjs.com/package/@botbuildercommunity/adapter-console) |
| [@botbuildercommunity/adapter-twilio-whatsapp](libraries/botbuilder-adapter-twilio-whatsapp/README.md) | A platform adapter for Twilio WhatsApp | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/adapter-twilio-whatsapp.svg)](https://www.npmjs.com/package/@botbuildercommunity/adapter-twilio-whatsapp) |

The following packages are available from [Botkit](https://github.com/howdyai/botkit), and work with both the Bot Framework and Botkit:

| Name | Description | NPM |
| ---- | ----------- | ------- |
| [botbuilder-adapter-slack](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-slack#readme) | A platform adapter for Slack | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-slack.svg)
| [botbuilder-adapter-webex](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-webex#readme) | A platform adapter for Webex Teams| ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-webex.svg)
| [botbuilder-adapter-hangouts](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-hangouts#readme) | A platform adapter for Google | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-hangouts.svg)
| [botbuilder-adapter-twilio-sms](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-twilio-sms#readme) | A platform adapter for Twilio SMS | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-twilio-sms.svg)
| [botbuilder-adapter-facebook](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-facebook#readme) | A platform adapter for Facebook Messenger | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-facebook.svg)
