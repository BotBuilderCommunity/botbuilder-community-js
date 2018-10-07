const { NumberWithUnitPrompt, NumberWithUnitPromptType } = require("../lib/index");
const { BotFrameworkAdapter, ConversationState, MemoryStorage } = require("botbuilder");
const { Dialog, DialogSet, WaterfallDialog, NumberPrompt } = require("botbuilder-dialogs");
const restify = require("restify");

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

const conversationState = new ConversationState(new MemoryStorage());
const dialogs = new DialogSet(conversationState.createProperty("dialogState"));

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        const dc = await dialogs.createContext(context);
        await dc.continueDialog();
        if (context.activity.text != null && context.activity.text === "prompt me") {
            await dc.beginDialog("email");
        }
        if (context.activity.type === "message") {
            await context.sendActivity(`You said "${context.activity.text} with a sentiment of ${context.turnState.get("sentimentScore")}"`);
        } else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    });
});

dialogs.add(new WaterfallDialog("email", [
    async (step) => {
        return await step.prompt("numberPrompt");
    },
    async (step) => {
        await step.context.sendActivity(`Your email is: ${step.result}`);
        return await step.endDialog();
    }
]));

console.log(new NumberWithUnitPrompt("numberPrompt", NumberWithUnitPromptType.Currency) instanceof Dialog);
console.log(new NumberPrompt("numberPrompt2") instanceof Dialog);

dialogs.add(new NumberWithUnitPrompt("numberPrompt"));
