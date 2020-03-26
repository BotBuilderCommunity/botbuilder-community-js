const { ActivityHandler, ActivityTypes, InputHints } = require('botbuilder');
const { AlexaCardFactory, AlexaContextExtensions } = require('@botbuildercommunity/adapter-alexa');

class EchoBot extends ActivityHandler {

    constructor() {
        super();

        this.onConversationUpdate(async (context, next) => {
            await context.sendActivity({
                text: `You can now start using the Alexa Skill. For example by saying 'card' or 'whisper'.`,
                inputHint: InputHints.ExpectingInput
            });
        });

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

            switch (context.activity.text) {
                // Retrieve token
                case 'token':
                    const tokenResponse = await context.adapter.getUserToken(context);

                    if (tokenResponse) {
                        const tokenPreview = tokenResponse.token.slice(0, 5);
                        await context.sendActivity(`You are logged in, part of your token is ${tokenPreview}.`);
                    } else {
                        await context.sendActivity({
                            text: ` Before I can do x, you need to log in with your Microsoft account. Please visit the Alexa app to link your Microsoft account.`,
                            attachments: [
                                AlexaCardFactory.linkAccountCard()
                            ],
                            inputHint: InputHints.ExpectingInput
                        });
                    }
                    break;

                // Progressive response
                case 'progressive':
                    await AlexaContextExtensions.sendProgressiveResponse(context, 'This is a progressive response. Please wait while we are retrieving your results.');
                    await context.sendActivity('Here is your result!');
                    break;

                // Typing activity shouldn't work, but later messages should be sent.
                case 'typing':
                    await context.sendActivity({ type: ActivityTypes.Typing });
                    await context.sendActivity('I have sent a typing before');
                    break;

                // Wait for input & send multiple text replies
                case 'wait':
                    await context.sendActivities([{
                        text: `Waiting for your reply!`,
                        inputHint: InputHints.ExpectingInput
                    },
                    {
                        text: `Second reply!!`,
                        inputHint: InputHints.ExpectingInput
                    }]);
                    break;

                // Whisper text using SSML & send multiple speech replies
                case 'whisper':
                    await context.sendActivities([{
                        text: `Fallback for channels that don't support speech ;-)`,
                        speak: `<speak>
                            I want to tell you a secret.
                                <amazon:effect name="whispered">I am not a real human.</amazon:effect>.
                            Can you believe it?
                        </speak>`,
                        inputHint: InputHints.ExpectingInput
                    }, {
                        text: `Fallback for channels that don't support speech ;-)`,
                        speak: `<speak>
                            Testjeeee
                        </speak>`,
                        inputHint: InputHints.ExpectingInput
                    }]);
                    break;

                // Send a simple card
                case 'card':
                    await context.sendActivity({
                        text: `You can also send cards via the Alexa Adapter!`,
                        attachments: [
                            AlexaCardFactory.standardCard('Titel!', 'Content')
                        ],
                        inputHint: InputHints.ExpectingInput
                    });
                    break;

                // Default echo response
                default:
                    await context.sendActivity(`Echo: ${context.activity.text}. What's next?`);
                    break;
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
