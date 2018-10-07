const { BotFrameworkAdapter, ConversationState, MemoryStorage } = require("botbuilder");
const restify = require("restify");
const { TestBot } = require("../test");

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

const testBot = new TestBot(conversationState);

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await testBot.onTurn(context);
    });
});
