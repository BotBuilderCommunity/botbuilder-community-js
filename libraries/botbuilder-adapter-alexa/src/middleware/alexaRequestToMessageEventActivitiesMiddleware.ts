import { AlexaAdapter } from './../alexaAdapter';
import { AlexaActivityTypes } from '../alexaSchema';
import { Middleware, TurnContext } from 'botbuilder';
import { RequestEnvelope } from 'ask-sdk-model';
import { getSlotValue } from 'ask-sdk-core';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export interface AlexaRequestToMessageEventActivitiesMiddlewareSettings {
    /**
     * Intent Slot Name
     * Defaults to 'phrase'
     */
    intentSlotName: string;
}

export class AlexaRequestToMessageEventActivitiesMiddleware implements Middleware {

    protected readonly settings: AlexaRequestToMessageEventActivitiesMiddlewareSettings;

    public constructor(settings: AlexaRequestToMessageEventActivitiesMiddlewareSettings) {
        const defaultSettings: AlexaRequestToMessageEventActivitiesMiddlewareSettings = {
            intentSlotName: 'phrase'
        };

        this.settings = { ...defaultSettings, ...settings };
    }

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {

        if (context.activity.channelId !== AlexaAdapter.channel) {
            return await next();
        }

        const alexaRequest: RequestEnvelope = context.activity.channelData;

        if (alexaRequest.request.type !== AlexaActivityTypes.IntentRequest) {
            return await next();
        }

        const intentValue = getSlotValue(alexaRequest, this.settings.intentSlotName);
        context.activity.text = intentValue;

        // Catch Amazon intents
        if (!intentValue) {
            context.activity.text = alexaRequest.request.intent.name;
        }

        await next();
    }

}