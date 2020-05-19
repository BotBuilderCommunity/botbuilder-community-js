import { ui as AlexaUI } from 'ask-sdk-model';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export class AlexaCardFactory {

    public static simpleCard(
        title: string,
        content: string
    ): AlexaUI.SimpleCard {
        return {
            type: 'Simple',
            title: title,
            content: content
        };
    }

    public static standardCard(
        title?: string,
        text?: string,
        image?: AlexaUI.Image
    ): AlexaUI.StandardCard {
        return {
            type: 'Standard',
            title,
            text,
            image
        };
    }

    public static askForPermissionsConsentCard(
        permissions: string[]
    ): AlexaUI.AskForPermissionsConsentCard {
        return {
            type: 'AskForPermissionsConsent',
            permissions
        };
    }

    public static linkAccountCard(): AlexaUI.LinkAccountCard {
        return {
            'type': 'LinkAccount'
        };
    }

}