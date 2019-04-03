//@ts-check

const assert = require("assert");
const { ConversationState, MemoryStorage, TestAdapter } = require("botbuilder");
const { DialogSet, DialogTurnStatus } = require("botbuilder-dialogs");
const { EmailPrompt } = require("../lib/email");
const { GUIDPrompt } = require("../lib/guid");
const { InternetProtocolPrompt, InternetProtocolPromptType } = require("../lib/internet");
const { NumberWithTypePrompt, NumberWithTypePromptType } = require("../lib/numberWithType");
const { NumberWithUnitPrompt, NumberWithUnitPromptType } = require("../lib/numberWithUnit");
const { PhoneNumberPrompt } = require("../lib/phone");
const { SocialMediaPrompt, SocialMediaPromptType } = require("../lib/socialMedia");

describe('Email dialog prompt tests', function() {
    this.timeout(5000);
    it('should call EmailPrompt when user initiates conversation.', async () => {
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
    it('should call GuidPrompt using user initiates conversation.', function (done) {
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

        adapter.send('Hello')
            .assertReply('What is your Azure subscription?')
            .send('My Azure subscription GUID is c3125047-eaac-4755-82bf-a164c0699973')
            .assertReply('c3125047-eaac-4755-82bf-a164c0699973')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
});


describe('Internet protocol dialog prompt tests', function() {
    this.timeout(5000);
    it('should call InternetProtocolPrompt for IP Addresses when user initiates conversation.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'What is your DNS?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new InternetProtocolPrompt('prompt', InternetProtocolPromptType.IPAddress));

        adapter.send('Hello')
            .assertReply('What is your DNS?')
            .send("I'm using Google's DNS of 8.8.8.8")
            .assertReply('8.8.8.8')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
    it('should call InternetProtocolPrompt for URL when user initiates conversation.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'What is your favorite web site?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new InternetProtocolPrompt('prompt', InternetProtocolPromptType.URL));

        adapter.send('Hello')
            .assertReply('What is your favorite web site?')
            .send('My favorite web site is https://codepunk.io')
            .assertReply('https://codepunk.io')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
});

describe('Number with Type dialog prompt tests', function() {
    this.timeout(5000);
    it('should call NumberWithTypePrompt for ordinal numbers when user initiates conversation.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'What place did you finish in?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberWithTypePrompt('prompt', NumberWithTypePromptType.Ordinal));

        adapter.send('Hello')
            .assertReply('What place did you finish in?')
            .send('I finished in 1st place.')
            .assertReply('1')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
    it('should call NumberWithTypePrompt for percentages when user initiates conversation.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'What percentage of time do you spend coding?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberWithTypePrompt('prompt', NumberWithTypePromptType.Percentage));

        adapter.send('Hello')
            .assertReply('What percentage of time do you spend coding?')
            .send('About 110% of the time!')
            .assertReply('110')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
});

describe('Number with Unit dialog prompt tests', function() {
    this.timeout(5000);
    it('should call NumberWithUnitPrompt for currency when user initiates conversation.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'How much is a coffee?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
                await turnContext.sendActivity(`unit: ${reply.unit}, value: ${reply.value}`);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberWithUnitPrompt('prompt', NumberWithUnitPromptType.Currency));

        adapter.send('Hello')
            .assertReply('How much is a coffee?')
            .send('$5.25')
            .assertReply('unit: Dollar, value: 5.25')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
    it('should call NumberWithUnitPrompt for dimensions when user initiates conversation.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'How far did you run today?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
                await turnContext.sendActivity(`unit: ${reply.unit}, value: ${reply.value}`);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberWithUnitPrompt('prompt', NumberWithUnitPromptType.Dimension));

        adapter.send('Hello')
            .assertReply('How far did you run today?')
            .send('I ran close to five miles')
            .assertReply('unit: Mile, value: 5')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
    it('should call NumberWithUnitPrompt for ages when user initiates conversation.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'How old are you?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
                await turnContext.sendActivity(`unit: ${reply.unit}, value: ${reply.value}`);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberWithUnitPrompt('prompt', NumberWithUnitPromptType.Age));

        adapter.send('Hello')
            .assertReply('How old are you?')
            .send("I'm now 40 years old")
            .assertReply('unit: Year, value: 40')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
    it('should call NumberWithUnitPrompt for temperature when user initiates conversation.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'What do you want to set the thermostat to?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
                await turnContext.sendActivity(`unit: ${reply.unit}, value: ${reply.value}`);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberWithUnitPrompt('prompt', NumberWithUnitPromptType.Temperature));

        adapter.send('Hello')
            .assertReply('What do you want to set the thermostat to?')
            .send('Set it at an even 72 degrees.')
            .assertReply('unit: Degree, value: 72')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
});

describe('Phone number dialog prompt tests', function() {
    this.timeout(5000);
    it('should call PhoneNumberPrompt when user initiates conversation.', async () => {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'What is your phone number?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new PhoneNumberPrompt('prompt'));

        await adapter.test('Hello', 'What is your phone number?')
            .send('My phone number 609-560-5662')
            .assertReply('609-560-5662');
    });
});

describe('Social media dialog prompt tests', function() {
    this.timeout(5000);
    it('should call SocialMediaPrompt for mentions when user initiates conversation.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Who should I send a tweet to?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new SocialMediaPrompt('prompt', SocialMediaPromptType.Mention));

        adapter.send('Hello')
            .assertReply('Who should I send a tweet to?')
            .send('Send a message to @szul.')
            .assertReply('@szul')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
    it('should call SocialMediaPrompt for hashtags when user initiates conversation.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'What are some of your favorite trends?');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new SocialMediaPrompt('prompt', SocialMediaPromptType.Hashtag));

        adapter.send('Hello')
            .assertReply('What are some of your favorite trends?')
            .send('Trends? Does #WM35 count?')
            .assertReply('#WM35')
            .then(() => done())
            .catch((e) => {
                assert.equal(e, null);
                done();
            });
    });
});
