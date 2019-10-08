const { BotFrameworkAdapter } = require("botbuilder");
const restify = require("restify");
const { config } = require("dotenv");
const { SentimentAnalysis } = require("@botbuildercommunity/middleware-google-language");

config();

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

adapter.use(new SentimentAnalysis());

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === "message") {
            await context.sendActivity(`You said "${context.activity.text} with a sentiment of ${context.turnState.get("sentimentScore")}"`);
        } else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    });
});
