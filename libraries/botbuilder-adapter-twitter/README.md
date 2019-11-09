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
    TWITTER_APPLICATION_USERNAME=<The Twitter Account Screen Name of Your Bot>
    TWITTER_ACTIVITY_ENV=<The Name You Gave to Your Twitter Environment>
    TWITTER_WEBHOOK_URL=<The API Endpoint You Create to Handle Twitter Messages>

> Your Twitter screen name for your bot and your application (Twitter app) name need to be the same.

### Adapter Setup

Create your adapter like you would create any other adapter:

```javascript
const twitterAdapter = new TwitterAdapter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET,
    screen_name: process.env.TWITTER_APPLICATION_USERNAME
});
```

Then create an API endpoint to listen for Twitter activity:

```javascript
server.post("/api/twitter/messages", (req, res) => {
    twitterAdapter.processActivity(req, res, async (context) => {
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

The `processWebhook()` method takes the current web request and the consumer secret, and creates the appropriate response for when Twitter accesses your endpoint to verify the webhook.

* `TwitterWebhookManager.registerWebhook(client: Twitter, env: string, callbackUrl: string): Promise<number>`

The `registerWebhook()` method takes a Twitter client (accessible via the Twitter adapters `client` property), the Twitter application's environment, and the webhook URL that you want Twitter to hit when somebody interacts with your Twitter bot.

* `TwitterWebhookManager.listWebhooks(consumerKey: string, consumerSecret: string, env: string): Promise<TwitterWebhookResponse[]>`

The `listWebhooks()` method takes a consumer key, a consumer secret, and the Twitter application's environment, and returns a list of webhooks associated with the Twitter account connected to those keys. This list is a array of objects continued the webhook ID's and associated callback URLs.

* `TwitterWebhookManager.removeWebhook(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string, webhookID: number): Promise<boolean>`

The `removeWebhook()` method takes a consumer key, consumer secret, access token, access secret, Twitter application environment, and webhook ID, and then removes that webhook from your list of registered webhooks.

* `TwitterWebhookManager.updateWebhook(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string, webhookID: number): Promise<boolean>`

The `updateWebhook()` method takes a consumer key, a consumer secret, an access token, an access secret, the Twitter applications' environment, and a webhook ID, and it refresh the connectivity between the webhook and Twitter in the event that the webhook was unreachable, and Twitter listed it as inactive.

### Subscription Management

* `TwitterSubscriptionManager.manageSubscription(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string): Promise<boolean>`

The `manageSubscription()` method takes a consumer key, a consumer secret, an access token, and access secret, and the Twitter applications, environment, and return true if either a subscription was found for this application, or if the subscription was not found, it will attempt to register the subscription, and will return true, if successful, or false, if not.

* `TwitterSubscriptionManager.hasSubscription(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string): Promise<boolean>`

The `hasSubscription()` method takes a consumer key, a consumer secret, an access token, and access secret, and the Twitter application's environment, and returns true if the current subscription is registered with the webhook.

* `TwitterSubscriptionManager.addSubscription(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string, env: string): Promise<boolean>`

The `addSubscription()` method takes a consumer key, a consumer secret, and access token, an access secret, and a Twiter application's environment, and return true if the subscription was successfully added.

* `TwitterSubscriptionManager.removeSubscription(consumerKey: string, consumerSecret: string, env: string, userID: string): Promise<boolean>`

The `removeSubscription()` method takes a consumer key, a consumer secret, a Twitter application environment, and the user ID (not username) of the Twitter account you wish to remove. It returns true if successful.

* `TwitterSubscriptionManager.listSubscriptions(consumerKey: string, consumerSecret: string, env: string): Promise<number[]>`

The `listSubscription()` method takes a consumer key, a consumer secret, and a Twitter application environment, and return a number array of user ID's representing the ID's of the subscribed users.

### Token Management

* `TwitterTokenManager.getBearerToken(consumerKey: string, consumerSecret: string): Promise<string>`

The `getBearerToken()` method takes a consumer key and a consumer secret and returns a string representation of an authorization bearer token for web requests requiring that form of authentication.

## Testing with ngrok

Working with the Twitter Activity API (which is what the Bot Builder Community Twitter Adapter uses to receive messages) requires a registered endpoint for Twitter to hit. The best way develop locally while satisfying this request is to use a service like [ngrok](https://ngrok.io). With ngrok, you can run an application locally that directs the ngrok web application to forward traffic through a tunnel to your localhost. Once the application is download, run it by using the command:

```powershell
ngrok http 3978
```

The ngrok application will then provide you with a URL (in the terminal window) that will redirect traffic through a tunnel to your localhost. Use this URL as your `TWITTER_WEBHOOK_URL`. When somebody sends a Direct Message or `@`-reply to your Twitter bot, it'll forward it to your localhost, and you can debug.

> With the free version of ngrok, you will get a new endpoint every time you start the service, so you will be consistently changing your `TWITTER_WEBHOOK_URL`, and will have to deregister and reregister your webhooks and subscriptions. If you want to avoid this, you can upgrade to a paid plan.

## Troubleshooting

* My access is denied.

If, while working with your Twitter account and the Bot Builder Community Twitter Adapter, you receive an access denied message when attempting to add or check on a subscription, make sure you've set your permissions correctly for your Twitter application, and then regenerate your access tokens and access secret.
