const { BotFrameworkAdapter, ConversationState, MemoryStorage } = require("botbuilder");
const restify = require("restify");
const { EmailBot } = require("./bot");

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

const emailBot = new EmailBot(conversationState);

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await emailBot.onTurn(context);
    });
});
