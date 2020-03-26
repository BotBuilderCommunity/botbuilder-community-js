# Twilio WhatsApp Adapter (beta)
This is part of the [Bot Builder Community Extensions](https://github.com/BotBuilderCommunity/botbuilder-community-js) project which contains various pieces of middleware, recognizers and other components for use with the Bot Builder JavaScript SDK v4.

The Twilio WhatsApp adapter for the Microsoft Bot Framework allows you to add an additional endpoint to your bot for use with Twilio WhatsApp. The goal of this adapter is to support WhatsApp via Twilio as seamlessly as possible. All supported features on WhatsApp are mapped to the default Bot Framework SDK.

>To send messages with WhatsApp in production, you have to wait for WhatsApp to formally approve your account. But, that doesn't mean you have to wait to start building. [Twilio Sandbox for WhatsApp](https://www.twilio.com/console/messaging/whatsapp) lets you test your app in a developer environment.

This adapter supports the limited capabilities of Twilio WhatsApp, including;

* Send and receive text messages
* Send and receive text messages with attachments (`image`, `audio`, `video`, `document`, `location`)
* Send proactive notifications
* Track message deliveries (`sent`, `delivered` and `read` receipts)
* User authentication via OAuth (provided by Azure Bot Service)

## Status
__Currently the Twilio WhatsApp channel is in beta.__
>Products in Beta may occasionally fall short of speed or performance benchmarks, have gaps in functionality, and contain bugs.

>APIs are stable and unlikely to change as the product moves from Beta to Generally Available (GA). We will do our best to minimize any changes and their impact on your applications. Products in Beta are not covered by Twilio's SLA's and are not recommended for production applications.

## Installation

To install:

    npm install @botbuildercommunity/adapter-twilio-whatsapp --save

## Usage

1. Use your existing Twilio account or create a new Twilio account.
2. Go to the [Twilio Sandbox for WhatsApp](https://www.twilio.com/console/messaging/whatsapp) and follow the first steps.
3. At the `Configure your Sandbox` step, add your endpoint URLs. Those URLs will be defined by the snippet below, by default the URL will be `[your-bot-url]/api/whatsapp/messages`.
_The `status callback url` is optional and should only be used if you want to track deliveries of your messages._
4. Go to your [Dashboard](https://www.twilio.com/console/sms/dashboard) and click on `Show API Credentials`.
5. Implement the snippet below and add your Account SID, Auth Token, your phone number and the endpoint URL you configured in the sandbox.
6. Give it a try! Your existing bot should be able to operate on the WhatsApp channel via Twilio.

```javascript
const { TwilioWhatsAppAdapter } = require('@botbuildercommunity/adapter-twilio-whatsapp');

const whatsAppAdapter = new TwilioWhatsAppAdapter({
    accountSid: '', // Account SID
    authToken: '', // Auth Token
    phoneNumber: '', // The From parameter consisting of whatsapp: followed by the sending WhatsApp number (using E.164 formatting)
    endpointUrl: '' // Endpoint URL you configured in the sandbox, used for validation
});

// WhatsApp endpoint for Twilio
server.post('/api/whatsapp/messages', (req, res) => {
    whatsAppAdapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await bot.run(context);
    });
});
```

## Advanced

* [Send and receive attachments](#send-and-receive-attachments)
* [Send and receive location messages](#send-and-receive-location-messages)
* [Send proactive notifications](#send-proactive-notifications)
* [Implement channel-specific functionality](#implement-channel-specific-functionality)
* [Monitor the status of your WhatsApp outbound message](#monitor-the-status-of-your-whatsapp-outbound-message)
* [User authentication within a conversation](#user-authentication-within-a-conversation)

### Send and receive attachments
The Bot Framework SDK supports the task of sending rich messages to the user. The Twilio WhatsApp adapter is using the same principles as the Bot Framework SDK. ([official documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-add-media-attachments?view=azure-bot-service-4.0&tabs=javascript)).

Attachments to WhatsApp messages can be of many different file types, including JPG, MP3, and PDF. [Read more about the supported file types in the Twilio FAQ](https://support.twilio.com/hc/en-us/articles/360017961894-Sending-and-Receiving-Media-with-WhatsApp-Messaging-on-Twilio-Beta-). The file type can be found by looking at the `contentType` property of the attachment.

**Example**
```javascript
const reply = {
    type: 'message',
    text: 'This is a message with an attachment.',
    attachments: [
        {
            contentType: 'image/png',
            contentUrl: 'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png'
        }
    ]
};

await context.sendActivity(reply);
```

>_You can send media messages up to 5 MB in size. At this time, Twilio will not transcode media for outgoing WhatsApp messages, so if you need to send a media object that is larger than 5 MB, please reduce the file size before sending it to Twilio._

### Send and receive location messages
Twilio WhatsApp offers the ability to send and receive [location messages](https://www.twilio.com/docs/sms/whatsapp/api#location-messages-with-whatsapp).

#### Sending
Location messages can be sent in two ways. By using a JSON attachment or by sending the location directly via channelData.

**Attachment**
```javascript
const replyWithLocation = {
    type: 'message',
    text: `Microsoft Nederland`,
    attachments: [
        {
            contentType: 'application/json',
            content: {
                elevation: null,
                type: 'GeoCoordinates',
                latitude: 52.3037702,
                longitude: 4.7501761,
                name: 'Schiphol'
            }
        }
    ]
};

await context.sendActivity(replyWithLocation);
```

**ChannelData**
```javascript
const replyWithLocation = {
    type: 'message',
    text: 'name', // The name of the location being sent (Location must exist in Google maps for the hyperlink to work on Mac/Windows WhatsApp client)
    channelData: {
        persistentAction: 'geo:{latitude},{longitude}|{label}'
    }
};

await context.sendActivity(replyWithLocation);
```

#### Receiving
```javascript
if (context.activity.attachments && context.activity.attachments.length > 0) {
    for (attachment of context.activity.attachments) {
        if (attachment.contentType === 'application/json' && attachment.content.type === 'GeoCoordinates') {
            console.log('Received location!');
            await context.sendActivity('Received a location' +
            `${attachment.name} (${attachment.content.name}) (${attachment.content.latitude},${attachment.content.longitude})`);
        }
    }
}
```

### Send proactive notifications
Proactive notifications are supported using the same principles as the Bot Framework SDK. Read more about how to [send proactive notifications to users](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0&tabs=csharp).

A WhatsApp session begins with a user initiated message to your app. Sessions are valid for 24 hours after the most recently received message, during which time you can communicate with them using free form messages. In order to send a message outside the 24 hour Session window, you must use a pre-approved template (see [Sending Notifications](https://www.twilio.com/docs/sms/whatsapp/api#sending-notifications) section).

**Example**
```javascript
// Capture conversation reference
conversationReference = TurnContext.getConversationReference(context.activity);

// Send pro-active message
await whatsAppAdapter.continueConversation(conversationReference, async (turnContext) => {
    await turnContext.sendActivity(`Proactive message!`);
});
```

### Implement channel-specific functionality
The Twilio WhatsApp channel is using `whatsapp` as the channel id. Within the TurnContext, you can use the following snippet to detect if the request is coming from the Twilio WhatsApp channel and to implement your custom logic.
`if (context.activity.channelId === 'whatsapp')`

Using the `channelData` object on new message activities is currently only supported for passing `persistentAction`, which can be used to send location messages.

### Monitor the status of your WhatsApp outbound message
If you configure the `status callback url` in Twilio Configuration, multiple status events will be broadcasted to your bot. You can use this functionality to [monitor the status of your WhatsApp outbound message](https://www.twilio.com/docs/sms/whatsapp/api#monitor-the-status-of-your-whatsapp-outbound-message). Possible values include: 'messageRead', 'messageDelivered', 'messageSent', 'messageQueued', 'messageFailed'.

Within the TurnContext you are able to differentiate between the events by reading the value of `context.activity.type`. If you are using an `ActivityHandler`, you should use the `onUnrecognizedActivityType` method.

**Example**
```javascript
if (context.activity.type === WhatsAppActivityTypes.MessageRead) {}
```

### User authentication within a conversation
It is possible to use the native [Bot Service OAuth functionality](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-authentication?view=azure-bot-service-4.0) by passing in the optional `BotFrameworkAdapterSettings` object. Sample code for adding OAuth to your bot can be found [here](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-authentication?view=azure-bot-service-4.0&tabs=javascript).

```javascript
const whatsAppAdapter = new TwilioWhatsAppAdapter({
    accountSid: '', // Account SID
    authToken: '', // Auth Token
    phoneNumber: '', // The From parameter consisting of whatsapp: followed by the sending WhatsApp number (using E.164 formatting)
    endpointUrl: '' // Endpoint URL you configured in the sandbox, used for validation
}, {
    appId: '', // MicrosoftAppId
    appPassword: '' // MicrosoftAppPassword
});
```
