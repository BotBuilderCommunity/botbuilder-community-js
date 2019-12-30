import { AdapterAlexa } from '../src';
import { notEqual, rejects, equal, deepEqual } from 'assert';
import { Activity, WebRequest, WebResponse } from 'botbuilder';
import { TurnContext, ResourceResponse, ActivityTypes } from 'botbuilder-core';
import { RequestEnvelope, IntentRequest, LaunchRequest, SessionEndedReason, SessionEndedRequest } from 'ask-sdk-model';

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
        const activity: Partial<Activity> = {
            id: 'test'
        };

        it('should list resource responses', async (): Promise<void> => {
            const responses: ResourceResponse[] = await alexaAdapter.sendActivities(turnContext(activity), [activity]);
            deepEqual(responses, [{id: 'test'}]);
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
        
        it('should convert intent request to message activity', async (): Promise<void> => {
            alexaRequest.body = alexaRequestEnvelope;
            await alexaAdapter.processActivity(alexaRequest, alexaResponse, async (context: TurnContext): Promise<void> => {
                equal(context.activity.channelId, 'alexa');
                equal(context.activity.text, (alexaRequestEnvelope.request as IntentRequest).intent.name);
                equal(context.activity.type, ActivityTypes.Message);
            });
        });

        it('should convert session ended request to end conversation activity', async (): Promise<void> => {
            const sessionEndRequest: SessionEndedRequest = {
                'type': 'SessionEndedRequest',
                'requestId': '123',
                'timestamp': 'time',
                'reason': 'USER_INITIATED'
            }
            alexaRequest.body = alexaRequestEnvelope;
            alexaRequest.body.request = sessionEndRequest;
            await alexaAdapter.processActivity(alexaRequest, alexaResponse, async (context: TurnContext): Promise<void> => {
                equal(context.activity.type, ActivityTypes.EndOfConversation);
            });
        });
        
        it('should return 404 if no response activities are created for conversation', async (): Promise<void> => {
            alexaRequest.body = alexaRequestEnvelope;
            alexaResponse.status = (status: number): void => {
                equal(status, 404);
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            await alexaAdapter.processActivity(alexaRequest, alexaResponse, async (_context: TurnContext): Promise<void> => {});
        });
    });
});