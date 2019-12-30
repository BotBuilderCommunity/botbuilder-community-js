import { AdapterAlexa } from '../src';
import { TurnContext, WebRequest, WebResponse, ActivityTypes } from 'botbuilder';
import { RequestEnvelope, ResponseEnvelope } from 'ask-sdk-model';
import { equal, deepEqual, ok } from 'assert';

describe('simple alexa request', (): void => {
    it('should reply with plain text response', async (): Promise<void> => {
        const alexaAdapter: AdapterAlexa = new AdapterAlexa();
        const alexaRequest: RequestEnvelope = {
            version: '1.0',
            context: {
                System: {
                    application: {
                        applicationId: 'id'
                    },
                    user: {
                        userId: 'user'
                    },
                    apiEndpoint: 'alexa.amazon.com'
                }
            },
            request: {
                type: 'IntentRequest',
                requestId: '1234',
                timestamp: 'time',
                dialogState: 'COMPLETED',
                intent: {
                    name: 'myIntent',
                    confirmationStatus: 'NONE'
                }
            }
        };
        const req: WebRequest = {
            headers: {},
            body: alexaRequest,
            on: (): void => {}
        };
        const alexaResponse: ResponseEnvelope = {
            version: '1.0',
            response: {
                outputSpeech: {
                    type: 'PlainText',
                    text: 'Hello Alexa!'
                }
            }
        };
        let endCalled = false;
        const res: WebResponse = {
            status: (status: number): void => {
                equal(status, 200);
            },
            send: (body: any): void => {
                deepEqual(body, alexaResponse);
            },
            end: (): void => {
                endCalled = true;
            },
        };
        await alexaAdapter.processActivity(req, res, async (context: TurnContext): Promise<void> => {
            await context.sendActivity('Hello Alexa!');
        }).then((): void => {
            ok(endCalled);
        });
    });

    it('should reply with plain text response', async (): Promise<void> => {
        const alexaAdapter: AdapterAlexa = new AdapterAlexa();
        const alexaRequest: RequestEnvelope = {
            version: '1.0',
            context: {
                System: {
                    application: {
                        applicationId: 'id'
                    },
                    user: {
                        userId: 'user'
                    },
                    apiEndpoint: 'alexa.amazon.com'
                }
            },
            request: {
                type: 'SessionEndedRequest',
                requestId: '1234',
                timestamp: 'time',
                reason: 'USER_INITIATED'
            }
        };
        const req: WebRequest = {
            headers: {},
            body: alexaRequest,
            on: (): void => {}
        };
        const alexaResponse: ResponseEnvelope = {
            version: '1.0',
            response: {
                shouldEndSession: true
            }
        };
        let endCalled = false;
        const res: WebResponse = {
            status: (status: number): void => {
                equal(status, 200);
            },
            send: (body: any): void => {
                deepEqual(body, alexaResponse);
            },
            end: (): void => {
                endCalled = true;
            },
        };
        await alexaAdapter.processActivity(req, res, async (context: TurnContext): Promise<void> => {
            await context.sendActivity({
                type: ActivityTypes.EndOfConversation
            });
        }).then((): void => {
            ok(endCalled);
        });
    });
});