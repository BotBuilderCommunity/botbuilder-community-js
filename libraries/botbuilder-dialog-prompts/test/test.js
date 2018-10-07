const { DialogSet, WaterfallDialog } = require("botbuilder-dialogs");
const { EmailPrompt } = require("@botbuildercommunity/dialog-prompts");

class EmailBot {
    constructor(conversationState) {
        this.conversationState = conversationState;
        this.dialogState = conversationState.createProperty("dialogState");
        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new WaterfallDialog("email", [
            async (step) => {
                return await step.prompt("emailPrompt", "What is your email address?");
            },
            async (step) => {
                await step.context.sendActivity(`Your email is: ${step.result}`);
                return await step.endDialog();
            }
        ]));
        this.dialogs.add(new EmailPrompt("emailPrompt"));
    }
    async onTurn(context) {
        const dc = await this.dialogs.createContext(context);
        if (!context.responded) {
            await dc.continueDialog();
        }
        if (context.activity.text != null && context.activity.text === "prompt me") {
            await dc.beginDialog("email");
        } else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
        await this.conversationState.saveChanges(context);
    }
}

module.exports.EmailBot = EmailBot;
