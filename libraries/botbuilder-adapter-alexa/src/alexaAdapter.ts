import { AlexaContextExtensions } from './alexaContextExtensions';
import { AlexaMessageMapper } from './alexaMessageMapper';
import { Activity, ActivityTypes, BotAdapter, TurnContext, ConversationReference, ResourceResponse, WebRequest, WebResponse } from 'botbuilder';
import { RequestEnvelope, ResponseEnvelope } from 'ask-sdk-model';
import { SkillRequestSignatureVerifier, TimestampVerifier } from 'ask-sdk-express-adapter';

/**
 * @module botbuildercommunity/adapter-alexa
 */

/**
 * Settings used to configure a `AlexaAdapter` instance.
 */
export interface AlexaAdapterSettings {
    /**
     * https://developer.amazon.com/en-US/docs/alexa/echo-button-skills/keep-session-open.html
     * @default true
     */
    shouldEndSessionByDefault?: boolean;

    /**
     * @default false
     */
    tryConvertFirstActivityAttachmentToAlexaCard?: boolean;

    /**
     * This prevents a malicious developer from configuring a skill with your endpoint and then using that skill to send requests to your service.
     * https://developer.amazon.com/en-US/docs/alexa/custom-skills/handle-requests-sent-by-alexa.html
     * @default true
     */
    validateIncomingAlexaRequests?: boolean;
}

/**
 * Bot Framework Adapter for Alexa
 */
export class AlexaAdapter extends BotAdapter {

    public static readonly channel: string = 'alexa';

    protected readonly settings: AlexaAdapterSettings;

    /**
     * Creates a new AlexaAdapter instance.
     * @param settings configuration settings for the adapter.
     */
    public constructor(settings?: AlexaAdapterSettings) {
        super();

        const defaultSettings: AlexaAdapterSettings = {
            shouldEndSessionByDefault: true,
            tryConvertFirstActivityAttachmentToAlexaCard: false,
            validateIncomingAlexaRequests: true
        };

        this.settings = { ...defaultSettings, ...settings };
    }

    /**
     * Sends a set of outgoing activities to the appropriate channel server.
     *
     * @param context Context for the current turn of conversation with the user.
     * @param activities List of activities to send.
     */
    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = [];
        const messageActivities: Partial<Activity>[] = [];

        for (let i = 0; i < activities.length; i++) {
            const activity: Partial<Activity> = activities[i];

            switch (activity.type) {
                case 'delay':
                    AlexaContextExtensions.sendProgressiveResponse(context, `<break time="${ typeof activity.value === 'number' ? activity.value : 1000 }ms"/>`);
                    responses.push({} as ResourceResponse);
                    break;
                case ActivityTypes.Message:
                    if (!activity.conversation || !activity.conversation.id) {
                        throw new Error(`AlexaAdapter.sendActivities(): Activity doesn't contain a conversation id.`);
                    }

                    // eslint-disable-next-line no-case-declarations
                    messageActivities.push(activity);
                    responses.push({ id: activity.id });

                    break;
                default:
                    responses.push({} as ResourceResponse);
                    console.warn(`AlexaAdapter.sendActivities(): Activities of type '${ activity.type }' aren't supported.`);
            }
        }

        const activity = this.processOutgoingActivities(messageActivities);
        const alexaResponse = AlexaMessageMapper.activityToAlexaResponse(activity, this.settings);

        // Create Alexa response
        const responseEnvelope: ResponseEnvelope = {
            version: '1.0',
            response: alexaResponse
        };

        context.turnState.set('httpBody', responseEnvelope);

        return responses;
    }

    /**
     * Concatenates outgoing activities into a single activity. If any of the activities being processed
     * contains an outer SSML speak tag within the value of the Speak property, these are removed from the individual activities and a <speak>
     * tag is wrapped around the resulting concatenated string. An SSML strong break tag is added between activity
     * content. For more infomation about the supported SSML for Alexa see 
     * [Speech Synthesis Markup Language (SSML) Reference](https://developer.amazon.com/en-US/docs/alexa/custom-skills/speech-synthesis-markup-language-ssml-reference.html#break)
     * @param activities 
     */
    public processOutgoingActivities(activities: Partial<Activity>[]): Partial<Activity> {

        if (activities.length === 0) {
            throw new Error(`AlexaAdapter.sendActivities(): No message activities present.`);
        }

        const finalActivity = activities[0];

        for (let i = 1; i < activities.length; i++) {
            const activity = activities[i];

            // Merge text
            if (activity.text) {
                finalActivity.text = finalActivity.text + ' ' + activity.text;
            }

            // Merge speech
            if (activity.speak) {

                finalActivity.speak = finalActivity.speak + '<break strength="strong"/>' + activity.speak;
            }

            // Merge attachments
            if (activity.attachments?.length > 0) {
                finalActivity.attachments = [...finalActivity.attachments, ...activity.attachments];
            }

        }

        if (finalActivity.speak) {
            finalActivity.speak = finalActivity.speak.replace(/<speak>/ig, '');
            finalActivity.speak = finalActivity.speak.replace(/<\/speak>/ig, '');
            finalActivity.speak = `<speak>${ finalActivity.speak }</speak>`;
        }

        return finalActivity;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        throw new Error('Method not supported by Alexa API.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw new Error('Method not supported by Alexa API.');
    }

    /**
     * TODO IMPLEMENT https://developer.amazon.com/en-US/docs/alexa/smapi/proactive-events-api.html
     * @param reference 
     * @param logic 
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

        const alexaRequestBody: RequestEnvelope = await retrieveBody(req);

        if (this.settings.validateIncomingAlexaRequests) {
            // Verify if request is a valid request from Alexa
            // https://developer.amazon.com/docs/custom-skills/host-a-custom-skill-as-a-web-service.html#verify-request-sent-by-alexa
            try {
                await new SkillRequestSignatureVerifier().verify(JSON.stringify(alexaRequestBody), req.headers);
                await new TimestampVerifier().verify(JSON.stringify(alexaRequestBody));
            }
            catch (error) {
                console.warn(`AlexaAdapter.processActivity(): ${ error.toString() }`);
                res.status(400);
                res.send(`${ error.toString() }`);
                return;
            }
        }

        const activity = AlexaMessageMapper.alexaRequestToActivity(alexaRequestBody);

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

}

/**
 * Retrieve body from WebRequest
 * @private
 * @param req incoming web request
 */
function retrieveBody(req: WebRequest): Promise<any> {
    return new Promise((resolve: any, reject: any): void => {

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
                    req.body = JSON.parse(requestData);

                    resolve(req.body);
                } catch (err) {
                    reject(err);
                }
            });
        }
    });
}