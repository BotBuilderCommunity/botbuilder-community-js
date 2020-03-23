/**
 * @module botbuildercommunity/adapter-twilio-whatsapp
 */
import { Activity, ActivityTypes, TurnContext, ConversationReference, ResourceResponse, WebRequest, WebResponse, Attachment, GeoCoordinates, BotFrameworkAdapterSettings } from 'botbuilder';
import * as Twilio from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { CustomWebAdapter } from '@botbuildercommunity/core';

/**
 * Settings used to configure a `TwilioWhatsAppAdapter` instance.
 */
export interface TwilioWhatsAppAdapterSettings {
    /**
     * [Application SID](https://support.twilio.com/hc/en-us/articles/223136607-What-is-an-Application-SID-)
     */
    accountSid: string;
    /**
     * [Auth Token](https://support.twilio.com/hc/en-us/articles/223136027-Auth-Tokens-and-How-to-Change-Them)
     */
    authToken: string;
    /**
     * The From parameter consisting of whatsapp: followed by the sending WhatsApp number (using E.164 formatting).
     * Until your Twilio number has been enabled for the beta, use your [WhatsApp Sandbox number](https://support.twilio.com/hc/en-us/articles/360007721954-Getting-Started-with-Twilio-for-WhatsApp-Beta-#senderID) for sending messages.
     */
    phoneNumber: string;
    /**
     * Full URL of the request URL you specify for your phone number or app, 
     * from the protocol (https...) through the end of the query string (everything after the ?).
     * https://www.twilio.com/docs/usage/security#validating-requests
     */
    endpointUrl: string;
}

/**
 * Defines values for WhatsAppActivityTypes.
 * Possible values include: 'messageRead', 'messageDelivered', 'messageSent', 'messageQueued', 'messageFailed'
 * https://www.twilio.com/docs/sms/whatsapp/api#monitor-the-status-of-your-whatsapp-outbound-message
 * @readonly
 * @enum {string}
 */
export enum WhatsAppActivityTypes {
    MessageRead = 'messageRead',
    MessageDelivered = 'messageDelivered',
    MessageSent = 'messageSent',
    MessageQueued = 'messageQueued',
    MessageFailed = 'messageFailed'
}

/**
 * Bot Framework Adapter for [Twilio Whatsapp](https://www.twilio.com/whatsapp)
 */
export class TwilioWhatsAppAdapter extends CustomWebAdapter {

    protected readonly settings: TwilioWhatsAppAdapterSettings;
    protected readonly client: Twilio.Twilio;
    protected readonly channel: string = 'whatsapp';

    /**
     * Creates a new TwilioWhatsAppAdapter instance.
     * @param settings configuration settings for the adapter.
     */
    public constructor(settings: TwilioWhatsAppAdapterSettings, botFrameworkAdapterSettings?: BotFrameworkAdapterSettings) {
        super(botFrameworkAdapterSettings);

        this.settings = settings;

        if (!this.settings.accountSid || !this.settings.authToken || !this.settings.phoneNumber || !this.settings.endpointUrl) {
            throw new Error(`TwilioWhatsAppAdapter.constructor(): Required TwilioWhatsAppAdapterSettings missing.`);
        }

        // Add required `whatsapp:` prefix if not exists
        if (!this.settings.phoneNumber.startsWith('whatsapp:')) {
            this.settings.phoneNumber = 'whatsapp:' + this.settings.phoneNumber;
        }

        try {
            this.client = this.createTwilioClient(settings.accountSid, settings.authToken);
        } catch (error) {
            throw new Error(`TwilioWhatsAppAdapter.constructor(): ${ error.message }.`);
        }
    }

    /**
     * Sends a set of outgoing activities to the appropriate channel server.
     *
     * @param context Context for the current turn of conversation with the user.
     * @param activities List of activities to send.
     */
    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = [];

        for (let i = 0; i < activities.length; i++) {
            const activity: Partial<Activity> = activities[i];

            switch (activity.type) {
                case 'delay':
                    await this.delay(activity.value);
                    responses.push({} as ResourceResponse);
                    break;
                case ActivityTypes.Message:
                    if (!activity.conversation || !activity.conversation.id) {
                        throw new Error(`TwilioWhatsAppAdapter.sendActivities(): Activity doesn't contain a conversation id.`);
                    }

                    // eslint-disable-next-line no-case-declarations
                    const message = this.parseActivity(activity);

                    try {
                        const res: MessageInstance = await this.client.messages.create(message);
                        responses.push({ id: res.sid });
                    } catch (error) {
                        throw new Error(`TwilioWhatsAppAdapter.sendActivities(): ${ error.message }.`);
                    }

                    break;
                default:
                    responses.push({} as ResourceResponse);
                    console.warn(`TwilioWhatsAppAdapter.sendActivities(): Activities of type '${ activity.type }' aren't supported.`);
            }
        }

        return responses;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        throw new Error('Method not supported by Twilio WhatsApp API.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw new Error('Method not supported by Twilio WhatsApp API.');
    }

    /**
     * Resume a conversation with a user, possibly after some time has gone by.
     *
     * @param reference A `ConversationReference` saved during a previous incoming activity.
     * @param logic A function handler that will be called to perform the bots logic after the the adapters middleware has been run.
     */
    public async continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promise<void>): Promise<void> {
        const request: Partial<Activity> = TurnContext.applyConversationReference(
            { type: 'event', name: 'continueConversation' },
            reference,
            true
        );

        const context: TurnContext = this.createContext(request);

        return this.runMiddleware(context, logic);
    }

    /**
     * Processes an incoming request received by the bots web server into a TurnContext.
     *
     * @param req An Express or Restify style Request object.
     * @param res An Express or Restify style Response object.
     * @param logic A function handler that will be called to perform the bots logic after the received activity has been pre-processed by the adapter and routed through any middleware for processing.
     */
    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {

        // Validate if requests are coming from Twilio
        // https://www.twilio.com/docs/usage/security#validating-requests
        if (!req?.headers['x-twilio-signature'] && !req?.headers['X-Twilio-Signature']) {
            console.warn(`TwilioWhatsAppAdapter.processActivity(): request doesn't contain a Twilio Signature.`);
            res.status(401);
            res.end();
            return;
        }

        const signature = req.headers['x-twilio-signature'] || req.headers['X-Twilio-Signature'];
        const authToken = this.settings.authToken;
        const requestUrl = this.settings.endpointUrl;
        const message = await this.retrieveBody(req);

        if (!message) {
            res.status(400);
            res.end();
            return;
        }

        const isTwilioRequest = this.validateRequest(authToken, signature, requestUrl, message);

        if (!isTwilioRequest) {
            console.warn(`TwilioWhatsAppAdapter.processActivity(): request doesn't contain a valid Twilio Signature.`);

            res.status(403);
            res.end();
            return;
        }

        // Handle events
        const activity: Partial<Activity> = {
            id: message.MessageSid,
            timestamp: new Date(),
            channelId: this.channel,
            conversation: {
                id: message.From,
                isGroup: false, // Supported by WhatsApp, not supported by Twilio API yet.
                conversationType: null,
                tenantId: null,
                name: ''
            },
            from: {
                id: message.From,
                name: '' // Supported by WhatsApp, not supported by Twilio API yet.
            },
            recipient: {
                id: message.To,
                name: ''
            },
            text: message.Body,
            channelData: message,
            localTimezone: null,
            callerId: null,
            serviceUrl: null,
            listenFor: null,
            label: message.MessagingServiceSid,
            valueType: null,
            type: null
        };

        // Detect Activity Type
        if (message.SmsStatus) {
            switch (message.SmsStatus.toLowerCase()) {
                case 'sent':
                    activity.type = WhatsAppActivityTypes.MessageSent;
                    break;
                case 'received':
                    activity.type = ActivityTypes.Message;
                    break;
                case 'delivered':
                    activity.type = WhatsAppActivityTypes.MessageDelivered;
                    break;
                case 'read':
                    activity.type = WhatsAppActivityTypes.MessageRead;
                    break;
                default:
                    console.warn(`TwilioWhatsAppAdapter.processActivity(): SmsStatus of type '${ message.SmsStatus }' is not supported.`);
            }
        }

        if (message.EventType) {
            switch (message.EventType.toLowerCase()) {
                case 'delivered':
                    activity.type = WhatsAppActivityTypes.MessageDelivered;
                    break;
                case 'read':
                    activity.type = WhatsAppActivityTypes.MessageRead;
                    break;
                case 'received':
                    activity.type = ActivityTypes.Message;
                    break;
                default:
                    console.warn(`TwilioWhatsAppAdapter.processActivity(): EventType of type '${ message.EventType }' is not supported.`);
            }
        }

        activity.attachments = [];

        // Message Received
        if (activity.type === ActivityTypes.Message) {

            // Has attachments?
            if (message.NumMedia && parseInt(message.NumMedia) > 0) {

                const amount = parseInt(message.NumMedia);

                for (let i = 0; i < amount; i++) {
                    const attachment: Attachment = {
                        contentType: message['MediaContentType' + i],
                        contentUrl: message['MediaUrl' + i]
                    };
                    activity.attachments.push(attachment);
                }

            }

            // Has location?
            // Latitude=37.7879277&Longitude=-122.3937508&Address=375+Beale+St%2C+San+Francisco%2C+CA+94105
            if (message.Latitude && message.Longitude) {
                const geo: GeoCoordinates = {
                    elevation: null,
                    type: 'GeoCoordinates',
                    latitude: parseFloat(message.Latitude),
                    longitude: parseFloat(message.Longitude),
                    name: message.Address
                };

                const attachment: Attachment = {
                    contentType: 'application/json',
                    content: geo,
                    name: message.Address
                };

                activity.attachments.push(attachment);
            }

        }

        // Create a Conversation Reference
        const context: TurnContext = this.createContext(activity);

        context.turnState.set('httpStatus', 200);
        await this.runMiddleware(context, logic);

        // Send HTTP response back
        res.status(context.turnState.get('httpStatus'));
        if (context.turnState.get('httpBody')) {
            res.send(context.turnState.get('httpBody'));
        } else {
            res.end();
        }
    }

    /**
     * Allows for the overriding of the context object in unit tests and derived adapters.
     * @param request Received request.
     */
    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }

    /**
     * Allows for the overriding of the Twilio object in unit tests and derived adapters.
     * @param accountSid Twilio AccountSid
     * @param authToken Twilio Auth Token
     */
    protected validateRequest(authToken: string, signature: string, requestUrl: string, message: Record<string, any>): boolean {
        return Twilio.validateRequest(authToken, signature, requestUrl, message);
    }

    /**
     * Allows for the overriding of the Twilio object in unit tests and derived adapters.
     * @param accountSid Twilio AccountSid
     * @param authToken Twilio Auth Token
     */
    protected createTwilioClient(accountSid: string, authToken: string): Twilio.Twilio {
        return Twilio(accountSid, authToken);
    }

    /**
     * Transform Bot Framework Activity to a Twilio Message.
     * 
     * @param activity Activity to transform
     */
    protected parseActivity(activity: Partial<Activity>): any {

        // Change formatting to WhatsApp formatting
        if (activity.text) {
            // Bold <b></b>
            activity.text = activity.text.replace(/<b>(.*?)<\/b>/gis, '*$1*');

            //<i></i>
            activity.text = activity.text.replace(/<i>(.*?)<\/i>/gis, '_$1_');

            //<s></s>
            activity.text = activity.text.replace(/<s>(.*?)<\/s>/gis, '~$1~');

            //<code></code>
            activity.text = activity.text.replace(/<code>(.*?)<\/code>/gis, '```$1```');
        }

        // Handle mentions
        // Not supported by current Twilio WhatsApp API yet

        // Create new Message for Twilio
        // @ts-ignore Using any since MessageInstance interface doesn't include `mediaUrl`
        const message: any = {
            body: activity.text,
            from: this.settings.phoneNumber,
            to: activity.conversation.id
        };

        // Handle Persistant Actions (like locations)
        // https://www.twilio.com/docs/sms/whatsapp/api#location-messages-with-whatsapp
        if (activity?.channelData?.persistentAction) {
            if (Array.isArray(activity.channelData.persistentAction)) {
                message.persistentAction = activity.channelData.persistentAction;
            } else {
                message.persistentAction = [activity.channelData.persistentAction];
            }
        }

        // Handle attachments
        // One media attachment is supported per message, with a size limit of 5MB.
        // https://www.twilio.com/docs/sms/whatsapp/api#sending-a-freeform-whatsapp-message-with-media-attachment
        if (activity?.attachments?.length > 0) {
            const attachment = activity.attachments[0];

            switch (attachment.contentType) {
                case 'application/vnd.microsoft.card.signin':
                    // eslint-disable-next-line no-case-declarations
                    const signin = attachment.content;

                    message.body = `${ signin.text }\n\n`;
                    message.body += (signin.buttons[0].title ? `*${ signin.buttons[0].title }*\n` : '');
                    message.body += signin.buttons[0].value;
                    break;

                case 'application/json':
                    if (attachment.content?.type === 'GeoCoordinates') {
                        const geo = attachment.content;
                        message.persistentAction = [`geo:${ geo.latitude },${ geo.longitude }${ (geo.name ? `|${ geo.name }` : '') }`];
                    }
                    break;

                default:
                    // Check if contentUrl is provided
                    if (attachment.contentUrl) {
                        message.mediaUrl = attachment.contentUrl;
                    }
                    else {
                        console.warn(`TwilioWhatsAppAdapter.parseActivity(): Attachment ignored. Attachment without contentUrl is not supported.`);
                    }

                    break;
            }

        }

        // Messages without text or mediaUrl are not valid
        if (!message.body && !message.mediaUrl) {
            throw new Error(`TwilioWhatsAppAdapter.parseActivity(): An activity text or attachment with contentUrl must be specified.`);
        }

        return message;
    }

}
