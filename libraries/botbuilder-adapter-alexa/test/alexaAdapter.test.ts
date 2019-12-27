import { AdapterAlexa } from '../src';
import { notEqual, rejects, equal, deepEqual } from 'assert';
import { Activity, WebRequest, WebResponse } from 'botbuilder';
import { TurnContext, ResourceResponse } from 'botbuilder-core';
import { RequestEnvelope, IntentRequest, ResponseEnvelope } from 'ask-sdk-model';

describe('Tests for Alexa Adapter', (): void => {
    let alexaAdapter: AdapterAlexa;
    const emptyActivity: Partial<Activity> = {};
    
    function turnContext(activity: Partial<Activity>): TurnContext {
        return new TurnContext(alexaAdapter, activity);
    }

    before((): void => {
        alexaAdapter = new AdapterAlexa();
    });

    it('should create instance of Alexa Adapter', (): void => {
        notEqual(alexaAdapter, undefined);
    });

    it('should not update activities', async (): Promise<void> => {
        await rejects(async (): Promise<void> => {
            await alexaAdapter.updateActivity(turnContext(emptyActivity), emptyActivity);
        });
    });

    it('should not update activities', async (): Promise<void> => {
        await rejects(async (): Promise<void> => {
            await alexaAdapter.deleteActivity(turnContext(emptyActivity), emptyActivity);
        });
    });

    describe('sendActivites', (): void => {
        it('should send empty resources', async (): Promise<void> => {
            const responses: ResourceResponse[] = await alexaAdapter.sendActivities(turnContext(emptyActivity), [emptyActivity]);
            deepEqual(responses, []);
        });
    });

    describe('processActivity', (): void => {
        const alexaRequestEnvelope: RequestEnvelope = {
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
        const alexaResponseEnvelope: ResponseEnvelope = {
            version: alexaRequestEnvelope.version,
            response: {
                outputSpeech: {
                    type: 'PlainText',
                    text: 'Hello World!'
                }
            }
        };
        let alexaRequest: WebRequest;
        let alexaResponse: WebResponse;

        beforeEach((): void => {
            alexaRequest = {
                headers: {},
                on: (): void => {}
            };
            alexaResponse = {
                end(): void {},
                send(): void {},
                status(): void {}
            };
        });
        
        it('should receive alexa request', async (): Promise<void> => {
            alexaRequest.body = alexaRequestEnvelope;
            await alexaAdapter.processActivity(alexaRequest, alexaResponse, async (context: TurnContext): Promise<void> => {
                equal(context.activity.channelId, 'alexa');
                equal(context.activity.text, (alexaRequestEnvelope.request as IntentRequest).intent.name);
            });
        });
    });
});