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
    public async continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promise<void>): Promise<void> { }

    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw new Error(`deleteActivity is not implemented for ${AdapterAlexa.name}`)
    }

    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const resourceResponses: ResourceResponse[] = [];

        return resourceResponses;
    }

    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        throw new Error(`updateActivity is not implemented for ${AdapterAlexa.name}`)
    }

    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        const alexaRequest: RequestEnvelope = req.body;
        const activity: Partial<Activity> = {
            channelId: "alexa"
        }

        if (getRequestType(alexaRequest) === 'IntentRequest') {
            const intentRequest: IntentRequest = <IntentRequest>alexaRequest.request;
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