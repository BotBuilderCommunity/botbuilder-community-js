const { BotFrameworkAdapter, ConversationState, MemoryStorage } = require("botbuilder");
const { DialogSet, DialogContext, WaterfallDialog, WaterfallStepContext, TextPrompt, DialogTurnResult } = require("botbuilder-dialogs");
const restify = require("restify");
const { MSSQLStorage } = require("../lib/index");

require("dotenv").config();

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

const storage = new MSSQLStorage({ 
    user: process.env.dbuser,
    password: process.env.dbpassword,
    server: process.env.dbserver,
    database: process.env.dbname,
    table: process.env.dbtable
});

const conversationState = new ConversationState(storage);

const dialogs = new DialogSet(conversationState.createProperty("dialogState"));

dialogs.add(new WaterfallDialog("hello", [
    async (step) => {
        return await step.prompt("textPrompt", "Hello. How are you doing today?");
    },
    async (step) => {
        return await step.context.sendActivity("That's great!");
    }
]));

dialogs.add(new TextPrompt("textPrompt"));

server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        const dialogContext = await dialogs.createContext(context);
        const cd = await dialogContext.continueDialog();
        if(context.activity.type === "message") {
            if(!context.responded) {
                await dialogContext.beginDialog("hello");
            }
        }
        await conversationState.saveChanges(context);
    });
});
