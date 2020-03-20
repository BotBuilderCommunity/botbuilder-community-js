import { escapeXmlCharacters } from 'ask-sdk-core';

/**
 * @module botbuildercommunity/adapter-alexa
 */

export * from './alexaAdapter';
export * from './alexaCardFactory';
export * from './alexaContextExtensions';
export * from './alexaSchema';
export * from './middleware/alexaRequestToMessageEventActivitiesMiddleware';

export { escapeXmlCharacters };