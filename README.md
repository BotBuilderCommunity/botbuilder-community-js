[![Build Status](https://dev.azure.com/BotBuilder-Community/js/_apis/build/status/BotBuilderCommunity.botbuilder-community-js?branchName=master)](https://dev.azure.com/BotBuilder-Community/js/_build/latest?definitionId=3&branchName=master) [![](https://img.shields.io/static/v1?logo=npm&label=npm&message=@botbuildercommunity)](https://www.npmjs.com/org/botbuildercommunity)

# Bot Builder Community - JavaScript Extensions

This repository is part of the Bot Builder Community Project and contains Bot Builder Extensions for the JavaScript SDK, including middleware, dialogs, helpers and more. Other repos within the Bot Builder Community Project exist for extensions for [.NET](https://github.com/BotBuilderCommunity/botbuilder-community-dotnet), [Python](https://github.com/BotBuilderCommunity/botbuilder-community-python), [Java](https://github.com/BotBuilderCommunity/botbuilder-community-java) and [tools](https://github.com/BotBuilderCommunity/botbuilder-community-tools) - you can find our other repos under [our GitHub organisation for the project](https://github.com/BotBuilderCommunity/).

To see a list of current extensions available for the Bot Builder JavaScript SDK, use the links below to jump to a section.

* [Storage](#storage)
* [Dialogs & Prompts](#dialogs-and-prompts)
* [Middleware](#middleware)
* [Adapters](#adapters)

## Installation

Each extension, such as middleware or recognizers, is available individually from NPM in the [`@botbuildercommunity`](https://www.npmjs.com/org/botbuildercommunity) scope. See each individual component description for installation details and links.

## Contributing and Reporting Issues

We welcome and encourage contributions to this project, in the form of bug fixes, enhancements or new extensions. Please fork the repo and raise a PR if you have something you would like us to review for inclusion. If you want to discuss an idea first then the best way to do this right now is to raise a GitHub issue or reach out to one of us on Twitter.

## Storage

The following alternative storage implementations are currently available;

| Name | Description | Sample? | NPM |
| ---- | ----------- | ------- | --- |
| [Azure Table storage](libraries/botbuilder-storage-azure-table/README.md) | Use Azure Table Storage in your bot. | | ![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/storage-azure-table.svg) |
| [DynamoDB storage](libraries/botbuilder-storage-dynamodb/README.md) | Use DynamoDB storage implementation in your bot. | | ![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/storage-dynamodb.svg) |
| [MongoDB storage](libraries/botbuilder-storage-mongodb/README.md) | Use MongoDB storage implementation in your bot. | | ![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/storage-mongodb.svg) |
| [MS SQL storage](libraries/botbuilder-storage-mssql/README.md) | Use Microsoft SQL Server storage implementation in your bot. | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/storage-mssql) | ![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/storage-mssql.svg) |

> The Azure Table Storage package has been deprecated from Microsoft's `botbuilder-js` repository, and is being taken over by the community.

## Dialogs and Prompts

The following dialogs are currently available;

| Name | Description | Sample? | NPM |
| ---- | ----------- | ------- | --- |
| [Dialog prompts](libraries/botbuilder-dialog-prompts/README.md) | A variety of prompts using the [Microsoft Recognizers Text](https://github.com/microsoft/Recognizers-Text) suite, such as currency, temperature, age and dimension.  | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/dialog-prompts) | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/dialog-prompts.svg)](https://www.npmjs.com/package/@botbuildercommunity/dialog-prompts) |

## Middleware

The following pieces of middleware are currently available;

| Name | Description | Sample? | NPM |
| ---- | ----------- | ------- | --- |
| [Activity Type middleware](libraries/botbuilder-middleware-activity-type/README.md) | Simple middleware component for intercepting and automatically handling messages based on activity type. | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/middleware-activity-type) | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/middleware-activity-type.svg)](https://www.npmjs.com/package/@botbuildercommunity/middleware-activity-type) |
| [AWS Comprehend middleware](libraries/botbuilder-middleware-aws-comprehend/README.md) | Use Amazon's AWS Comprehend for sentiment analysis, key phrases, language detection, and entity extraction. | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/middleware-aws-comprehend) | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/middleware-aws-comprehend.svg)](https://www.npmjs.com/package/@botbuildercommunity/middleware-aws-comprehend) |
| [Google Language middleware](libraries/botbuilder-middleware-google-language/README.md) | Use Google Cloud Platform's Natural Language API for sentiment analysis, categories, and entity extraction. | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/middleware-google-language) | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/middleware-google-language.svg)](https://www.npmjs.com/package/@botbuildercommunity/middleware-google-language) |
| [Spell Check middleware](libraries/botbuilder-middleware-spell-check/README.md) | Use Cognitive Services Spell Check API to detect misspellings and correct these. | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/middleware-spell-check) | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/middleware-spell-check.svg)](https://www.npmjs.com/package/@botbuildercommunity/middleware-spell-check) |
| [Text Analytics middleware](libraries/botbuilder-middleware-text-analytics/README.md) | Use Cognitive Services Text Analytics API for sentiment analysis, language detection, key phrases and entity extraction. | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/middleware-text-analytics) | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/middleware-text-analytics.svg)](https://www.npmjs.com/package/@botbuildercommunity/middleware-text-analytics) |
| [Text Recognizer middleware](libraries/botbuilder-middleware-text-recognizer/README.md) | Use the [Microsoft Recognizers Text](https://github.com/microsoft/Recognizers-Text) Suite for recognizing certain text sequences. | | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/middleware-text-recognizer.svg)](https://www.npmjs.com/package/@botbuildercommunity/middleware-text-recognizer) |
| [Watson NLU middleware](libraries/botbuilder-middleware-watson-nlu/README.md) | Use IBM Watson's NLU for sentiment analysis, key phrases, categories, concepts, emotion detection, and entity extraction. | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/middleware-watson-nlu) | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/middleware-watson-nlu.svg)](https://www.npmjs.com/package/@botbuildercommunity/middleware-watson-nlu) |

## Adapters

The following adapters can be used to expose your bot on additional channels not supported by the Azure Bot Service, such as Twilio WhatsApp and Twitter.

| Name | Description | Sample? | NPM |
| ---- | ----------- | ------- | --- |
| [Alexa Adapter](libraries/botbuilder-adapter-alexa/README.md) (preview) | A platform adapter for Amazon Alexa. Includes broad support for Alexa Skills capabilities, including devices with displays, Alexa Cards, access to user profile data and the ability to send Progressive Responses. | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/adapter-alexa) | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/adapter-alexa.svg)](https://www.npmjs.com/package/@botbuildercommunity/adapter-alexa) |
| [Console adapter](libraries/botbuilder-adapter-console/README.md) | A platform adapter for the console / terminal. | | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/adapter-console.svg)](https://www.npmjs.com/package/@botbuildercommunity/adapter-console) |
| [Twilio WhatsApp adapter](libraries/botbuilder-adapter-twilio-whatsapp/README.md) | A platform adapter for Twilio WhatsApp. Includes support for proactive messaging, sending attachments and sending location messages. | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/adapter-twilio-whatsapp) | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/adapter-twilio-whatsapp.svg)](https://www.npmjs.com/package/@botbuildercommunity/adapter-twilio-whatsapp) |
| [Twitter adapter](libraries/botbuilder-adapter-twitter/README.md) | A platform adapter for Twitter. Supports Twitter status updates and direct messages (DM's). | [Sample](https://github.com/BotBuilderCommunity/botbuilder-community-js/tree/master/samples/adapter-twitter) | [![NPM Version](https://img.shields.io/npm/v/@botbuildercommunity/adapter-twitter.svg)](https://www.npmjs.com/package/@botbuildercommunity/adapter-twitter) |

The following packages are available from [Botkit](https://github.com/howdyai/botkit), and work with both the Bot Framework and Botkit.

| Name | Description | NPM |
| ---- | ----------- | ------- |
| [botbuilder-adapter-facebook](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-facebook#readme) | A platform adapter for Facebook Messenger | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-facebook.svg)
| [botbuilder-adapter-hangouts](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-hangouts#readme) | A platform adapter for Google | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-hangouts.svg)
| [botbuilder-adapter-slack](https://github.com/howdyai/botkit/tree/main/packages/botbuilder-adapter-slack#readme) | A platform adapter for Slack | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-slack.svg)
| [botbuilder-adapter-twilio-sms](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-twilio-sms#readme) | A platform adapter for Twilio SMS | ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-twilio-sms.svg)
| [botbuilder-adapter-webex](https://github.com/howdyai/botkit/tree/master/packages/botbuilder-adapter-webex#readme) | A platform adapter for Webex Teams| ![NPM Version](https://img.shields.io/npm/v/botbuilder-adapter-webex.svg)
