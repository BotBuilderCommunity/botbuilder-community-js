import { getApiAccessToken, escapeXmlCharacters } from 'ask-sdk-core';
import { RequestEnvelope } from 'ask-sdk-model';
import { TurnContext } from 'botbuilder';
import fetch from 'node-fetch';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export class AlexaContextExtensions {

    /**
     * Your skill can send progressive responses to keep the user engaged while your skill prepares a full 
     * response to the user's request. A progressive response is interstitial SSML content (including text-to-speech 
     * and short audio) that Alexa plays while waiting for your full skill response.
     * @param context 
     * @param content 
     */
    public static async sendProgressiveResponse(context: TurnContext, content: string): Promise<any> {

        const alexaRequest = this.getAlexaRequestBody(context);
        const apiAccessToken = getApiAccessToken(alexaRequest);
        const requestId = alexaRequest.request.requestId;
        const apiEndpoint = alexaRequest.context.System.apiEndpoint;

        // TODO abstract request part to a helper class
        const request = await fetch(`${ apiEndpoint }/v1/directives`, {
            method: 'POST',
            body: JSON.stringify({
                header: {
                    requestId: requestId
                },
                directive: {
                    type: 'VoicePlayer.Speak',
                    speech: `<speak>${ escapeXmlCharacters(content) }</speak>` // TODO use SSML validators + helpers
                }
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiAccessToken
            },
        });

        const result = request.body;

        return result;
    }

    /**
     * Retrieve full Alexa Request Body
     * @param context 
     */
    public static getAlexaRequestBody(context: TurnContext): RequestEnvelope {
        if (context?.activity?.channelData) {
            return context.activity.channelData;
        } else {
            return null;
        }
    }

    /**
     * Does the current device have a display?
     * @param context boolean
     */
    public static deviceHasDisplay(context: TurnContext): boolean {
        const alexaRequest = this.getAlexaRequestBody(context);
        const hasDisplay = ('Display' in alexaRequest?.context?.System?.device?.supportedInterfaces);

        return hasDisplay;
    }

    /**
     * Does the current device have an audio player?
     * @param context boolean
     */
    public static deviceHasAudioPlayer(context: TurnContext): boolean {
        const alexaRequest = this.getAlexaRequestBody(context);
        const hasAudioPlayer = ('AudioPlayer' in alexaRequest?.context?.System?.device?.supportedInterfaces);

        return hasAudioPlayer;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static sendPermissionConsentRequestActivity(context: TurnContext, message: string, permissions: string[]): boolean {
        return false;
    }

    public static setSessionAttributes(context: TurnContext, sessionAttributes: {}): void {
        context.turnState.set('AlexaSessionAttributes', sessionAttributes);
    }

    public static getSessionAttributes(context: TurnContext): {} {
        const alexaRequest = this.getAlexaRequestBody(context);

        return alexaRequest?.session?.attributes;
    }

    public static setRepromptSpeech(context: TurnContext, repromptSpeech: string): void {
        context.turnState.set('AlexaReprompt', repromptSpeech);
    }

}
