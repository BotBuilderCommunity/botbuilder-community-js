const { ActivityHandler } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(`You said '<i>${context.activity.text}</i>'`);

            const replyWithAttachment = {
                type: ActivityTypes.Message,
                text: `This bot is built with the Microsoft Bot Framework via the Twilio Whatsapp channel (beta)!`,
                attachments: [
                    {
                        contentType: 'image/png',
                        contentUrl: 'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png'
                    }
                ]
            };

            await context.sendActivity(replyWithAttachment);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
