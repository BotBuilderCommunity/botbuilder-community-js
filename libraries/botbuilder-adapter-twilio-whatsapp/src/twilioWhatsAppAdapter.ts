import { Activity, ActivityTypes, BotAdapter, TurnContext, ConversationReference, ResourceResponse, WebRequest, WebResponse, TokenResponse } from 'botbuilder';
import * as Twilio from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { parse } from 'qs';
import {
    AppCredentials,
    JwtTokenValidation,
    MicrosoftAppCredentials,
    SimpleCredentialProvider,
    TokenApiClient,
    TokenApiModels
} from "botframework-connector";
import { USER_AGENT } from 'botbuilder/src/botFrameworkAdapter';


/**
 * @module botbuildercommunity/adapter-twilio-whatsapp
 */

const OAUTH_ENDPOINT = "https://api.botframework.com";
const US_GOV_OAUTH_ENDPOINT = "https://api.botframework.azure.us";

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

    /**
     * The ID assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
     */
    appId: string;

    /**
     * The password assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
     */
    appPassword: string;

    /**
     * Optional. The tenant to acquire the bot-to-channel token from.
     */
    channelAuthTenant?: string;

    /**
     * Optional. The OAuth API endpoint for your bot to use.
     */
    oAuthEndpoint?: string;

    /**
     * Optional. The channel service option for this bot to validate connections from Azure or other channel locations.
     */
    channelService?: string;
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
export class TwilioWhatsAppAdapter extends BotAdapter {

    protected readonly settings: TwilioWhatsAppAdapterSettings;
    protected readonly client: Twilio.Twilio;
    protected readonly channel: string = 'whatsapp';

    // OAuth Properties
    protected readonly credentials: AppCredentials;
    protected readonly credentialsProvider: SimpleCredentialProvider;
    /**
     * Creates a new TwilioWhatsAppAdapter instance.
     * @param settings configuration settings for the adapter.
     */
    public constructor(settings?: Partial<TwilioWhatsAppAdapterSettings>) {
        super();

        this.settings = {
            appId: "",
            appPassword: "",
            accountSid: "",
            authToken: "",
            phoneNumber: "",
            endpointUrl: "",
            ...settings
        };

        this.credentials = new MicrosoftAppCredentials(
            this.settings.appId,
            this.settings.appPassword || "",
            this.settings.channelAuthTenant
        );

        this.credentialsProvider = new SimpleCredentialProvider(
            this.credentials.appId,
            this.settings.appPassword || ""
        );

        // Add required `whatsapp:` prefix if not exists
        if (!this.settings.phoneNumber.startsWith("whatsapp:")) {
            this.settings.phoneNumber = "whatsapp:" + this.settings.phoneNumber;
        }

        try {
            this.client = this.createTwilioClient(
                this.settings.accountSid,
                this.settings.authToken
            );
        } catch (error) {
            throw new Error(
                `TwilioWhatsAppAdapter.constructor(): ${error.message}.`
            );
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
                    await delay(typeof activity.value === 'number' ? activity.value : 1000);
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
                        throw new Error(`TwilioWhatsAppAdapter.sendActivities(): ${error.message}.`);
                    }

                    break;
                default:
                    responses.push({} as ResourceResponse);
                    console.warn(`TwilioWhatsAppAdapter.sendActivities(): Activities of type '${activity.type}' aren't supported.`);
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
        if (!req.headers && (!req.headers['x-twilio-signature'] || !req.headers['X-Twilio-Signature'])) {
            console.warn(`TwilioWhatsAppAdapter.processActivity(): request doesn't contain a Twilio Signature.`);
            res.status(401);
            res.end();
        }

        const signature = req.headers['x-twilio-signature'] || !req.headers['X-Twilio-Signature'];
        const authToken = this.settings.authToken;
        const requestUrl = this.settings.endpointUrl;
        const message = await retrieveBody(req);

        if (!message) {
            res.status(400);
            res.end();
        }

        const isTwilioRequest = Twilio.validateRequest(authToken, signature, requestUrl, message);

        if (!isTwilioRequest) {
            console.warn(`TwilioWhatsAppAdapter.processActivity(): request doesn't contain a valid Twilio Signature.`);

            res.status(401);
            res.end();
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
                    console.warn(`TwilioWhatsAppAdapter.processActivity(): SmsStatus of type '${message.SmsStatus}' is not supported.`);
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
                    console.warn(`TwilioWhatsAppAdapter.processActivity(): EventType of type '${message.EventType}' is not supported.`);
            }
        }

        // Message Received
        if (activity.type === ActivityTypes.Message) {

            // Has attachments?
            if (message.NumMedia && parseInt(message.NumMedia) > 0) {

                activity.attachments = [];
                const amount = parseInt(message.NumMedia);

                for (let i = 0; i < amount; i++) {
                    const attachment = {
                        contentType: message['MediaContentType' + i],
                        contentUrl: message['MediaUrl' + i]
                    };
                    activity.attachments.push(attachment);
                }

            }

        }

        // Create a Conversation Reference
        const context: TurnContext = this.createContext(activity);

        context.turnState.set('httpStatus', 200);
        await this.runMiddleware(context, logic);

        // send http response back
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

        // Handle locations
        // Not supported by current Twilio WhatsApp API yet

        // Create new Message for Twilio
        // @ts-ignore Using any since MessageInstance interface doesn't include `mediaUrl`
        const message: any = {
            body: activity.text,
            from: this.settings.phoneNumber,
            to: activity.conversation.id,
            mediaUrl: undefined
        };

        // Handle attachments
        // One media attachment is supported per message, with a size limit of 5MB.
        // https://www.twilio.com/docs/sms/whatsapp/api#sending-a-freeform-whatsapp-message-with-media-attachment
        if (activity.attachments && activity.attachments.length > 0) {
            const attachment = activity.attachments[0];

            // Check if contentUrl is provided
            if (attachment.contentUrl) {
                message.mediaUrl = attachment.contentUrl;
            } else {
                console.warn(`TwilioWhatsAppAdapter.parseActivity(): Attachment ignored. Attachment without contentUrl is not supported.`);
            }
        }

        // Messages without text or mediaUrl are not valid
        if (!message.body && !message.mediaUrl) {
            throw new Error(`TwilioWhatsAppAdapter.parseActivity(): A activity text or attachment with contentUrl must be specified.`);
        }

        return message;
    }

    /**
     * Asynchronously attempts to retrieve the token for a user that's in a login flow.
     *
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param magicCode Optional. The validation code the user entered.
     *
     * @returns A [TokenResponse](xref:botframework-schema.TokenResponse) object that contains the user token.
     */
    public async getUserToken(
        context: TurnContext,
        connectionName: string,
        magicCode?: string
    ): Promise<TokenResponse> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(
                `TwilioWhatsappAdatper.getUserToken(): missing from or from.id`
            );
        }
        if (!connectionName) {
            throw new Error(
                "getUserToken() requires a connectionName but none was provided."
            );
        }
        // this.checkEmulatingOAuthCards(context);
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl();
        const client: TokenApiClient = this.createTokenApiClient(url);

        const result: TokenApiModels.UserTokenGetTokenResponse = await client.userToken.getToken(
            userId,
            connectionName,
            { code: magicCode, channelId: context.activity.channelId }
        );
        if (!result || !result.token || result._response.status == 404) {
            return undefined!;
        } else {
            return result as TokenResponse;
        }
    }

    /**
     * Asynchronously signs out the user from the token server.
     *
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param userId The ID of user to sign out.
     */
    public async signOutUser(
        context: TurnContext,
        connectionName: string,
        userId?: string
    ): Promise<void> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(
                `BotFrameworkAdapter.signOutUser(): missing from or from.id`
            );
        }
        if (!userId) {
            userId = context.activity.from.id;
        }

        const url: string = this.oauthApiUrl();
        const client: TokenApiClient = this.createTokenApiClient(url);
        await client.userToken.signOut(userId, {
            connectionName: connectionName,
            channelId: context.activity.channelId
        });
    }

    public async getSignInLink(
        context: TurnContext,
        connectionName: string
    ): Promise<string> {
        const conversation: Partial<ConversationReference> = TurnContext.getConversationReference(
            context.activity
        );
        const url: string = this.oauthApiUrl();
        const client: TokenApiClient = this.createTokenApiClient(url);
        const state: any = {
            ConnectionName: connectionName,
            Conversation: conversation,
            MsAppId: (client.credentials as AppCredentials).appId
        };

        const finalState: string = Buffer.from(JSON.stringify(state)).toString(
            "base64"
        );

        return (
            await client.botSignIn.getSignInUrl(finalState, {
                channelId: context.activity.channelId
            })
        )._response.bodyAsText;
    }

    /**
     * Asynchronously gets Aad tokens
     *
     * @param context The context object for the turn.
     * @param userId Optional. If present, the ID of the user to retrieve the token status for.
     *      Otherwise, the ID of the user who sent the current activity is used.
     * @param includeFilter Optional. A comma-separated list of connection's to include. If present,
     *      the `includeFilter` parameter limits the tokens this method returns.
     *
     * @returns The [TokenStatus](xref:botframework-connector.TokenStatus) objects retrieved.
     */
    public async getAadTokens(
        context: TurnContext,
        connectionName: string,
        resourceUrls: string[]
    ): Promise<{
        [propertyName: string]: TokenResponse;
    }> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(
                `BotFrameworkAdapter.getAadTokens(): missing from or from.id`
            );
        }
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl();
        const client: TokenApiClient = this.createTokenApiClient(url);

        return (
            await client.userToken.getAadTokens(
                userId,
                connectionName,
                { resourceUrls: resourceUrls },
                { channelId: context.activity.channelId }
            )
        )._response.parsedBody as { [propertyName: string]: TokenResponse };
    }

    /**
     * Gets the OAuth API endpoint.
     *
     * @remarks
     * Override this in a derived class to create a mock OAuth API endpoint for unit testing.
     */
    protected oauthApiUrl(): string {
        return this.settings.oAuthEndpoint
            ? this.settings.oAuthEndpoint
            : JwtTokenValidation.isGovernment(
                this.settings.channelService
                    ? this.settings.channelService
                    : ""
            )
                ? US_GOV_OAUTH_ENDPOINT
                : OAUTH_ENDPOINT;
    }

    /**
     * Creates an OAuth API client.
     *
     * @param serviceUrl The client's service URL.
     *
     * @remarks
     * Override this in a derived class to create a mock OAuth API client for unit testing.
     */
    protected createTokenApiClient(serviceUrl: string): TokenApiClient {
        const client = new TokenApiClient(this.credentials, {
            baseUri: serviceUrl,
            userAgent: USER_AGENT
        });
        return client;
    }

}

/**
 * Retrieve body from WebRequest
 * @private
 * @param req incoming web request
 */
function retrieveBody(req: WebRequest): Promise<any> {
    return new Promise((resolve: any, reject: any): void => {

        const type = req.headers['content-type'] || req.headers['Content-Type'];

        if (req.body) {
            try {
                resolve(req.body);
            } catch (err) {
                reject(err);
            }
        } else {
            let requestData = '';
            req.on('data', (chunk: string): void => {
                requestData += chunk;
            });
            req.on('end', (): void => {
                try {
                    if (type.includes('application/x-www-form-urlencoded')) {
                        req.body = parse(requestData);
                    } else {
                        req.body = JSON.parse(requestData);
                    }

                    resolve(req.body);
                } catch (err) {
                    reject(err);
                }
            });
        }
    });
}

// Copied from `botFrameworkAdapter.ts` to support {type: 'delay' } activity.
function delay(timeout: number): Promise<void> {
    return new Promise((resolve): void => {
        setTimeout(resolve, timeout);
    });
}