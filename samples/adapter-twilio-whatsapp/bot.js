const { ActivityHandler, ActivityTypes } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(`You said '<i>${context.activity.text}</i>'`);

            // Default message
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

            // Did the user send their location?
            if (context.activity.attachments && context.activity.attachments.length > 0) {
                for (const attachment of context.activity.attachments) {
                    if (attachment.contentType === 'application/json' && attachment.content.type === 'GeoCoordinates') {
                        console.log('Received location!');
                        await context.sendActivity(`Received a location.
                            ${attachment.content.name} (${attachment.content.latitude}:${attachment.content.longitude})`);
                    }
                }
            }

            // Send a random location
            if (context.activity.text === 'location') {
                const replyWithLocation = {
                    type: ActivityTypes.Message,
                    text: 'Microsoft Nederland',
                    channelData: {
                        persistentAction: 'geo:52.3037702,4.7501761|Microsoft NL'
                    }
                };
    
                await context.sendActivity(replyWithLocation);
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
