const { notEqual, rejects, equal, deepEqual, skip } = require('assert');
const { AlexaAdapter } = require("../lib/alexaAdapter");
const { TurnContext, ActivityTypes } = require('botbuilder');

describe('AlexaAdapter', function () {

    const emptyActivity = {};

    function turnContext(activity) {
        return new TurnContext(alexaAdapter, activity);
    }

    it('should create instance of Alexa Adapter with default settings', () => {
        alexaAdapter = new AlexaAdapter()
        notEqual(alexaAdapter, undefined);
        equal(alexaAdapter.settings.shouldEndSessionByDefault, true);
        equal(alexaAdapter.settings.tryConvertFirstActivityAttachmentToAlexaCard, false);
    });

    it('should create instance of Alexa Adapter with custom settings', () => {
        alexaAdapter = new AlexaAdapter({ shouldEndSessionByDefault: false, tryConvertFirstActivityAttachmentToAlexaCard: true })
        notEqual(alexaAdapter, undefined);
        equal(alexaAdapter.settings.shouldEndSessionByDefault, false);
        equal(alexaAdapter.settings.tryConvertFirstActivityAttachmentToAlexaCard, true);
    });

    it('should not update activities', async () => {
        alexaAdapter = new AlexaAdapter()
        await rejects(async () => {
            await alexaAdapter.updateActivity(turnContext(emptyActivity), emptyActivity);
        });
    });

    it('should not update activities', async () => {
        alexaAdapter = new AlexaAdapter()
        await rejects(async () => {
            await alexaAdapter.deleteActivity(turnContext(emptyActivity), emptyActivity);
        });
    });

    describe('sendActivities', () => {
        alexaAdapter = new AlexaAdapter()

        const activity = {
            id: 'test',
            type: 'message',
            conversation: {
                id: 'test'
            }
        };

        it('should list resource responses', async () => {
            const responses = await alexaAdapter.sendActivities(turnContext(activity), [activity]);
            deepEqual(responses, [{ id: 'test' }]);
        });
    });

    describe('processActivity', () => {
        alexaAdapter = new AlexaAdapter()

        const alexaRequestEnvelope = {
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
        let alexaRequest;
        let alexaResponse;

        beforeEach(() => {
            alexaRequest = {
                headers: {},
                on: () => { }
            };
            alexaResponse = {
                end() { },
                send() { },
                status() { }
            };
        });

        it('should convert intent request to message activity', async () => {
            alexaAdapter = new AlexaAdapter()

            alexaRequest.body = alexaRequestEnvelope;
            await alexaAdapter.processActivity(alexaRequest, alexaResponse, async (context) => {
                equal(context.activity.channelId, 'alexa');
                equal(context.activity.text, (alexaRequestEnvelope.request).intent.name);
                equal(context.activity.type, ActivityTypes.Message);
            });
        });

        it('should convert session ended request to end conversation activity', async () => {
            alexaAdapter = new AlexaAdapter()

            const sessionEndRequest = {
                'type': 'SessionEndedRequest',
                'requestId': '123',
                'timestamp': 'time',
                'reason': 'USER_INITIATED'
            }
            alexaRequest.body = alexaRequestEnvelope;
            alexaRequest.body.request = sessionEndRequest;
            await alexaAdapter.processActivity(alexaRequest, alexaResponse, async (context) => {
                equal(context.activity.type, ActivityTypes.EndOfConversation);
            });
        });

        it.skip('should return 404 if no response activities are created for conversation', async () => {
            alexaAdapter = new AlexaAdapter()

            alexaRequest.body = alexaRequestEnvelope;
            alexaResponse.status = (status) => {
                equal(status, 404);
            };

            await alexaAdapter.processActivity(alexaRequest, alexaResponse, async (_context) => { });
        });
    });
});