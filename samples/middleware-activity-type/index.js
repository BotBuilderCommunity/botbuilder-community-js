const { BotFrameworkAdapter, ActivityTypes } = require("botbuilder");
const { HandleActivityType } = require("@botbuildercommunity/middleware-activity-type");
const restify = require("restify");

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

adapter.use(new HandleActivityType(ActivityTypes.Message, async (context, next) => {
    await context.sendActivity('Hello, middleware!');
}));

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === "message") {
            await context.sendActivity("You sent me a message!");
        }
    });
});
