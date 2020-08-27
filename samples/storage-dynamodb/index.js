const { BotFrameworkAdapter, ConversationState } = require("botbuilder");
const { DialogSet, WaterfallDialog, TextPrompt } = require("botbuilder-dialogs");
const restify = require("restify");
const { DynamoDBStorage } = require("@botbuildercommunity/storage-dynamodb");

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const storage = new DynamoDBStorage(
    process.env.tableName,
    process.env.region,
    {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    }
);

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
