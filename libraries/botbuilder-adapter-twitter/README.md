# Twitter Adapter

This is part of the [Bot Builder Community Extensions](https://github.com/BotBuilderCommunity/botbuilder-community-js) project which contains various pieces of middleware, recognizers and other components for use with the Bot Builder JavaScript SDK v4.

> You will need a Twitter Developer account to use this adapter. You will also need to create a Twitter Application in the Twitter Developer Dashboard, and you will need to create a Twitter Activity API account.

The Twitter adapter for the Microsoft Bot Framework allows you to add an additional endpoint to your bot for use with Twitter status updates and direct messages (DM's).

This adapter supports the following capabilities of Twitter messaging:

* Send and receive tweets
* Send and receive Direct Messages
* Multimedia attachments

## Installation

To install:

```powershell
npm install @botbuildercommunity/adapter-twitter --save
```

## Usage

You will need to acquire your keys and tokens from Twitter. The following environment variables should be in your `.env` file:

    TWITTER_CONSUMER_KEY=<Your Consumer Key from Your App>
    TWITTER_CONSUMER_SECRET=<Your Consumer Secret from Your App>
    TWITTER_ACCESS_TOKEN=<Your Access Token from Your App>
    TWITTER_TOKEN_SECRET=<Your Access Token Secret from Your App>
    TWITTER_ACTIVITY_ENV=<The Name You Gave to Your Twitter Environment>
    TWITTER_WEBHOOK_URL=<The API Endpoint You Create to Handle Twitter Messages>

### Adapter Setup

Create your adapter like you would create any other adapter:

```javascript
const twitterAdapter = new TwitterAdapter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});
```

Then create an API endpoint to listen for Twitter activity:

```javascript
server.post("/api/twitter/messages", (req, res) => {
    twitterAdapter.processActivity(req, res, async (context) => {
        console.log(context);
        if(context.activity.type === 'message') {
            await context.sendActivity('Hello from the Twitter adapters.');
        }
    });
});
```

In the above code, this endpoint will be hit when somebody tweets at the account associated with your keys. It'll also be hit when somebody sends you a direct message. If the tweet is a public tweet, the message in `sendActivity()` will prepend the `@username` of the person who sent the tweet to your bot. If the tweet is a direct message, it'll send the response via direct message.

### Attachments

Attachments sent via `sendActivity()` will be attached to the Twitter message. If you bot is sent attachments, you will find them at `context.activity.attachments`.

## Registering Your Webhook and Subscribing Your App

The Twitter Activity API requires you to register a webhook (where they will send incoming messages), as well as subscribing to an account to receive messages about. This adapter has some static methods that support working with webhooks and subscriptions. You can see the [sample](../../sample/adapter-twitter/index.js) for a working example of how to construct your endpoints.

### Webhook Management

* `TwitterWebhookManager.processWebhook(req: WebRequest, consumerSecret: string): TwitterResponseToken`

* `TwitterWebhookManager.registerWebhook(client: Twitter, env: string, callbackUrl: string): Promise<number>`

* `TwitterWebhookManager.listWebhooks(consumerKey: string, consumerSecret: string, env: string): Promise<TwitterWebhookResponse[]>`

* `TwitterWebhookManager.removeWebhook(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string, webhookID: number): Promise<boolean>`

* `TwitterWebhookManager.updateWebhook(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string, webhookID: number): Promise<boolean>`

### Subscription Management



## Testing with ngrok

## Troubleshooting

* My access is denied.
