const { BotFrameworkAdapter } = require("botbuilder");
const { restify } = require("restify");
const { SpellCheck } = require("@botbuildercommunity/middleware-spell-check");

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

adapter.use(new SpellCheck(process.env.SPELL_CHECK_KEY));

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === "message") {
            var suggestion = context.turnState.get("suggestion");
            var token = context.turnState.get("token");
            if (suggestion != null && token != null){
                await context.sendActivity(`You said "${context.activity.text} but didn't you mean ${context.turnState.get("suggestion")} instead of ${context.turnState.get("token")}?"`);
            } else {
                await context.sendActivity(`You said "${context.activity.text}"`);
            }
            
        } else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    });
});
