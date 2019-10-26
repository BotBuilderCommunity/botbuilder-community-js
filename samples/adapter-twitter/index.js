//@ts-check

const { BotFrameworkAdapter } = require("botbuilder");
const restify = require("restify");
const  { config } = require("dotenv");
//const { TwitterAdapter, processWebhook, manageSubscription, listSubscriptions, registerWebhook, listWebhooks } = require("../../libraries/botbuilder-adapter-twitter/lib/index");
const { TwitterAdapter, processWebhook, manageSubscription, listSubscriptions, registerWebhook, listWebhooks } = require("@botbuildercommunity/adapter-twitter");

config();

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

const twitterAdapter = new TwitterAdapter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        console.log(context.activity.text);
    });
});

server.post("/api/twitter/messages", (req, res) => {
    console.log('server.post: /api/twitter/messages: ');
    console.log(req);
    twitterAdapter.processActivity(req, res, async (context) => {
        console.log('processActivity: context: ');
        console.log(context);
        /*
        if(context.activity.text != null) {
            await context.sendActivity("Posting a tweet from the adapter");
        }
        */
    });
});

/*
 * This endpoint is hit by Twitter with the crc_token.
 * Twitter's Activity API expects a formatted response in return.
 * The TwitterAdapter has utility methods to handle this.
 * The `processWebhook()` method checks for the crc_token and creates the appropriate response.
 * This response data should be sent via the Restify or Express response. 
 */
server.get('/api/twitter/messages', (req, res) => {
    console.log('server.get: /api/twitter/messages: ');
    console.log(req);
    try {
        const webHookResponse = processWebhook(req, process.env.TWITTER_CONSUMER_SECRET);
        console.log(webHookResponse);
        res.send(webHookResponse);
    }
    catch(e) {
        res.status(500);
        res.send({ error: e });
    }
});

/*
 * This endpoint is for registering the webhook URL where Twitter will send the messages.
 * This is only for an example. If this is a production application, you should secure this.
 */
server.get('/api/twitter/webhook', async (req, res) => {
    try {
        const webhookID = await registerWebhook(twitterAdapter.client, process.env.TWITTER_ACTIVITY_ENV, process.env.TWITTER_WEBHOOK_URL);
        res.send({ webhookID: webhookID });
    }
    catch(e) {
        res.status(500);
        res.send({ error: e });
    }
});

/*
 * This endpoint is for listing the webhooks associated with your Twitter Activity API
 * This is only for an example. If this is a production application, you should secure this.
 */
server.get('/api/twitter/webhook/list', async (req, res) => {
    try {
        const webhooks = await listWebhooks(process.env.TWITTER_CONSUMER_KEY, process.env.TWITTER_CONSUMER_SECRET, process.env.TWITTER_ACTIVITY_ENV);
        res.send({ webhooks: webhooks });
    }
    catch(e) {
        res.status(500);
        res.send({ error: e });
    }
});

/*
 * This endpoint is for kicking off the subscription process.
 * It will first check that the current credentials in your enviroment are registered to use
 * the Activity API. If not, it will subscribe that account.
 * If this was a production application, you'd probably want better security on this endpoint.
 */
server.get('/api/twitter/subscription', async (req, res) => {
    console.log('server.get: /api/twitter/subscription: ');
    console.log(req);
    try {
        const result = await manageSubscription(
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            process.env.TWITTER_ACCESS_TOKEN,
            process.env.TWITTER_TOKEN_SECRET,
            process.env.TWITTER_ACTIVITY_ENV);
        res.send({ success: result });
    }
    catch(e) {
        res.status(500);
        res.send({ error: e });
    }
});

/*
 * This endpoint is for listing the subscriptions associated with your Twitter Activity API
 * This is only for an example. If this is a production application, you should secure this.
 */
server.get('/api/twitter/subscription/list', async (req, res) => {
    try {
        const subs = await listSubscriptions(
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            process.env.TWITTER_ACTIVITY_ENV
        );
        res.send({ subs: subs });
    }
    catch(e) {
        res.status(500);
        res.send({ error: e });
    }
});

server.get('/', (req, res) => {
    res.send({ message: 'This service is up.' });
});
