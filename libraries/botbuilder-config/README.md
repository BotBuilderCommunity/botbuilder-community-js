# BotBuilder Configuration Parser (Node.JS)

Configuration helper for consuming and decrypting Microsoft Bot Framework bot files.

[![Build Status](https://travis-ci.org/szul/botbuilder-config.svg?branch=master)](https://travis-ci.org/szul/botbuilder-config)

> Note: This repository and package pre-dates the `botframework-config` package that the Microsoft team has under development. This package was designed to fill that gap at the time. Future plans for this package intent to build on top of standard Bot Framework configuration in order to make things easier to configure, consume, decrypt, and work with.

## Installation

To install:

    npm install botbuilder-config --save

## Usage

### JavaScript

To import the module:

    let { BotConfig } = require("botbuilder-config");

To instantiate the configuration:

    let c = new BotConfig({ botFilePath: "PATH_TO_BOT_FILE", secret: "SECRET" });

### TypeScript

To import the module:

    import { BotConfig } from "botbuilder-config";

To instantiate the configuration:

    let c = new BotConfig({ botFilePath: "PATH_TO_BOT_FILE", secret: "SECRET" });

> Both the bot file path and the secret are optional properties of a `BotConfigurationOptions` parameter. If the bot file is not specified, it will look in the current working directory of the bot. If the secret is not specified, it will assume that the bot file does not have any encrypted properties.

### Services

To access a bot service:

    let qna = c.QnAMaker(); //returns an object with all the properties of the QnA maker service in the bot file.
    qna.endpoint; //Access the "endpoint" property of the QnA Maker service.

Given the above instantiation (where `c` is the `BotConfig` object), you can access each service by calling the method that matches the service:

* `c.Endpoint()`
* `c.AzureBotService()`
* `c.QnAMaker()`
* `c.LUIS()`
* `c.Dispatch()`

**What if I have more than one of the same service?** You can specify an optional `name` parameter to the service method such as `c.QnAMaker("MY_SERVICE_NAME")` that matches the name property of the service in your bot file. If not, it will return the first service of that type that it finds.

### Encryption

You could load and access the bot file by simply loading the bot file as JSON into your application. The advantage of this library is that it will decrypt your properties, if you have encrypted them with a secret.

    let c = new BotConfig({ botFilePath: "PATH_TO_BOT_FILE", secret: "SECRET" });
    let s = c.decrypt(c.QnAMaker().subscriptionKey)
    console.log(s); //"s" will be decrypted;

You can also decrypt everything ahead of time.

    let c = new BotConfig({ botFilePath: "PATH_TO_BOT_FILE", secret: "SECRET" });
    let s = c.QnAMaker().subscriptionKey
    console.log(s); //"s" will be decrypted;
