import {
    BotAdapter,
    ConversationReference,
    TurnContext,
    Activity,
    ResourceResponse,
    WebRequest,
    WebResponse
} from 'botbuilder';
import { RequestEnvelope, IntentRequest } from 'ask-sdk-model';
import { getRequestType } from 'ask-sdk-core';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export class AdapterAlexa extends BotAdapter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async continueConversation(_reference: Partial<ConversationReference>, _logic: (revocableContext: TurnContext) => Promise<void>): Promise<void> { }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async deleteActivity(_context: TurnContext, _reference: Partial<ConversationReference>): Promise<void> {
        throw new Error(`deleteActivity is not implemented for ${ AdapterAlexa.name }`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async sendActivities(_context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const resourceResponses: ResourceResponse[] = [];

        for (const activity of activities) {
            resourceResponses.push({
                id: activity.id || ''
            });
        }

        return resourceResponses;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async updateActivity(_context: TurnContext, _activity: Partial<Activity>): Promise<void> {
        throw new Error(`updateActivity is not implemented for ${ AdapterAlexa.name }`);
    }

    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        const alexaRequest: RequestEnvelope = req.body;
        const activity: Partial<Activity> = {
            channelId: 'alexa'
        };

        if (getRequestType(alexaRequest) === 'IntentRequest') {
            const intentRequest: IntentRequest = alexaRequest.request as IntentRequest;
            activity.text = intentRequest.intent.name;
        }

        const context: TurnContext = this.createContext(activity);
        await this.runMiddleware(context, logic);
    }

    /**
     * Allows for the overriding of the context object in unit tests and derived adapters.
     * @param request Received request.
     */
    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this as any, request);
    }
}