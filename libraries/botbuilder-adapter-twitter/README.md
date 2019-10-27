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

### Send attachments

## Registering Your Webhook and Subscribing Your App

## Testing with ngrok

## Troubleshooting

* My access is denied.
