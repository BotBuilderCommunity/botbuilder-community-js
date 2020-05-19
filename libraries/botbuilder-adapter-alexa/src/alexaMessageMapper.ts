import { AlexaCardFactory } from './alexaCardFactory';
import { AlexaAdapterSettings } from './alexaAdapter';
import { AlexaActivityTypes } from './alexaSchema';
import { AlexaAdapter } from './alexaAdapter';
import { RequestEnvelope, Response, interfaces as AlexaInterfaces, ui as AlexaUI, Directive } from 'ask-sdk-model';
import { Activity, InputHints, ActivityTypes } from 'botbuilder';
import { escapeXmlCharacters, getLocale, getUserId, getIntentName, getRequestType, getApiAccessToken } from 'ask-sdk-core';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export class AlexaMessageMapper {

    /**
     * Transform Alexa Request to Bot Framework Activity
     * @param alexaRequestBody Request to transform
     */
    public static alexaRequestToActivity(alexaRequestBody: RequestEnvelope): Partial<Activity> {

        const message = alexaRequestBody.request;
        const system: AlexaInterfaces.system.SystemState = alexaRequestBody.context.System;

        // Handle events
        const activity: Partial<Activity> = {
            id: message.requestId,
            timestamp: new Date(message.timestamp),
            channelId: AlexaAdapter.channel,
            conversation: {
                id: alexaRequestBody.session.sessionId,
                isGroup: false,
                conversationType: message.type,
                tenantId: null,
                name: ''
            },
            from: {
                id: getUserId(alexaRequestBody), // TODO Or use personId when speaker is recognized??
                name: 'user'
            },
            recipient: {
                id: system.application.applicationId,
                name: 'bot'
            },
            locale: getLocale(alexaRequestBody),
            text: (message.type === AlexaActivityTypes.IntentRequest ? getIntentName(alexaRequestBody) : ''),
            channelData: alexaRequestBody,
            localTimezone: null,
            callerId: null,
            serviceUrl: `${ system.apiEndpoint }?token=${ getApiAccessToken(alexaRequestBody) }`,
            listenFor: null,
            label: null,
            valueType: null,
            type: getRequestType(alexaRequestBody)
        };


        // TODO Handle isNewSession??

        // Set Activity Type
        switch (message.type) {
            case AlexaActivityTypes.LaunchRequest:
                activity.type = ActivityTypes.ConversationUpdate;
                activity.membersAdded = [
                    {
                        id: getUserId(alexaRequestBody),
                        name: '',
                        role: 'user'
                    }
                ];
                break;

            case AlexaActivityTypes.SessionEndedRequest:
                activity.type = ActivityTypes.EndOfConversation;
                break;

            case AlexaActivityTypes.IntentRequest:
                activity.type = ActivityTypes.Message;
                break;

            default:
                activity.type = ActivityTypes.Event;
                activity.name = alexaRequestBody.request.type;
        }

        return activity;

    }

    /**
     * Transform Bot Framework Activity to a Alexa Response Message.
     * @param activity Activity to transform
     */
    public static activityToAlexaResponse(activity: Partial<Activity>, settings: AlexaAdapterSettings): Response {

        // Create response
        const response: Response = {};

        // Add SSML or text response
        if (activity.speak) {
            if (!activity.speak.startsWith('<speak>') && !activity.speak.endsWith('</speak>')) {
                activity.speak = `<speak>${ escapeXmlCharacters(activity.speak) }</speak>`;
            }

            response.outputSpeech = {
                type: 'SSML',
                ssml: activity.speak
            };
        } else {
            response.outputSpeech = {
                type: 'PlainText',
                text: activity.text
            };
        }

        // TODO: Handle reprompt

        if (activity?.attachments) {

            const card = this.attachmentsToAlexaCards(activity);
            if (card) {
                response.card = card;
            }

            const directives = this.attachmentToAlexaDirectives(activity);
            if (directives?.length > 0) {
                response.directives = directives;
            }

        }

        // TODO: Add sessionAttributes
        // TODO: Needs validation?
        // const sessionAttributes = context.turnState.get('AlexaSessionAttributes');

        // TODO: Parse AMAZON intents

        // Tranform inputHint to shouldEndSession
        switch (activity.inputHint) {
            case InputHints.IgnoringInput:
                response.shouldEndSession = true;
                break;
            case InputHints.ExpectingInput:
                response.shouldEndSession = false;
                // TODO Handle reprompt
                response.reprompt = null;
                //TODO HANDLE response.Response.Reprompt = new Reprompt(activity.Text);
                break;
            case InputHints.AcceptingInput:
                break;
            default:
                response.shouldEndSession = settings.shouldEndSessionByDefault;
                break;
        }

        return response;
    }

    /**
     * Convert the first valid attachment to Alexa Card
     * @param activity 
     */
    public static attachmentsToAlexaCards(activity: Partial<Activity>): AlexaUI.Card {

        // TODO no any
        for (const attachment of activity.attachments as any) {
            // Parse native cards
            if (attachment.type && ['Simple', 'Standard', 'AskForPermissionsConsent', 'LinkAccount'].includes(attachment.type)) {
                return attachment;
            }

            // Transform HeroCard to StandardCard
            if (attachment.type === 'application/vnd.microsoft.card.hero') {
                return AlexaCardFactory.standardCard(attachment.title, null, attachment?.images[0]);
            }

            // Transform ThumbnailCard to StandardCard + Image
            if (attachment.type === 'application/vnd.microsoft.card.thumbnail') {
                return AlexaCardFactory.standardCard(attachment.title, null, attachment?.images[0]);
            }

            // Transform SignInCard & OAuthCard to LinkAccount Card
            if (attachment.type === 'application/vnd.microsoft.card.signin' || attachment.type === 'application/vnd.microsoft.card.oauth') {
                return AlexaCardFactory.linkAccountCard();
            }

        }

    }

    /**
     * Convert attachments to Alexa Directives
     * @param activity 
     */
    public static attachmentToAlexaDirectives(activity: Partial<Activity>): Directive[] {

        const directives = [];

        // TODO no any
        for (const attachment of activity.attachments as any) {
            if (attachment.type &&
                [
                    'BodyTemplate1',
                    'BodyTemplate2',
                    'BodyTemplate3',
                    'BodyTemplate4',
                    'BodyTemplate5',
                    'BodyTemplate6',
                    'BodyTemplate7',
                    'ListTemplate1',
                    'ListTemplate2',
                ].includes(attachment.type)) {

                directives.push(attachment);
            }

            return directives;
        }

    }

}