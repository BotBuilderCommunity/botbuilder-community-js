//@ts-check

const { ConversationState, MemoryStorage, TestAdapter } = require("botbuilder");
const { DialogSet, DialogTurnStatus } = require("botbuilder-dialogs");
const { EmailPrompt } = require("../lib/email");
const { GUIDPrompt } = require("../lib/guid");

describe('Email dialog prompt tests', function() {
    this.timeout(5000);
    it('should call EmailPrompt using when user initiates conversation.', async () => {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'What is your email address?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new EmailPrompt('prompt'));

        await adapter.test('Hello', 'What is your email address?')
            .send('My email is michael@szul.us')
            .assertReply('michael@szul.us');
    });
});

describe('GUID dialog prompt tests', function() {
    this.timeout(5000);
    it('should call GuidPrompt using when user initiates conversation.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'What is your Azure subscription?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new GUIDPrompt('prompt'));

        await adapter.send('Hello')
            .assertReply('What is your Azure subscription?')
            .send('My Azure subscription GUID is c3125047-eaac-4755-82bf-a164c0699973')
            .assertReply('c3125047-eaac-4755-82bf-a164c0699973');
    });
});
