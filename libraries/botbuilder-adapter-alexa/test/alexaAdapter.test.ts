import { AdapterAlexa } from "../src";
import { notEqual, rejects, equal, deepEqual } from "assert";
import { Activity, WebRequest, WebResponse } from "botbuilder";
import { TurnContext, ResourceResponse } from "botbuilder-core";
import { RequestEnvelope, IntentRequest, Intent } from "ask-sdk-model";

describe('Tests for Alexa Adapter', () => {
    let alexaAdapter: AdapterAlexa;
    const emptyActivity: Partial<Activity> = {};
    const alexaRequestEnvelope: RequestEnvelope = {
        version: "1.0",
        context: {
            System: {
                application: {
                    applicationId: "id"
                },
                user: {
                    userId: "user"
                },
                apiEndpoint: "alexa.amazon.com"
            }
        },
        request: {
            type: "IntentRequest",
            requestId: "1234",
            timestamp: "time",
            dialogState: "COMPLETED",
            intent: {
                name: "myIntent",
                confirmationStatus: "NONE"
            }
        }
    };
    const alexaRequest: WebRequest = {
        headers: {},
        body: alexaRequestEnvelope,
        on: (event: any, ...args: any[]): any => {}
    }
    const alexaResponse: WebResponse = {
        end(...args: any[]): any { },
        send(body: any): any { },
        status(status: number): any { },
    }

    function turnContext(activity: Partial<Activity>): TurnContext {
        return new TurnContext(alexaAdapter, activity);
    }

    before(() => {
        alexaAdapter = new AdapterAlexa();
    });

    it('should create instance of Alexa Adapter', () => {
        notEqual(alexaAdapter, undefined);
    });

    it('should not update activities', async () => {
        await rejects(async () => {
            await alexaAdapter.updateActivity(turnContext(emptyActivity), emptyActivity)
        });
    });

    it('should not update activities', async () => {
        await rejects(async () => {
            await alexaAdapter.deleteActivity(turnContext(emptyActivity), emptyActivity)
        });
    });

    describe('sendActivites', () => {
        it('should send empty resources', async () => {
            const responses: ResourceResponse[] = await alexaAdapter.sendActivities(turnContext(emptyActivity), [emptyActivity]);
            deepEqual(responses, [])
        })
    });

    describe('processActivity', () => {
        it('should receive alexa requests', async () => {
            await alexaAdapter.processActivity(alexaRequest, alexaResponse, async (context: TurnContext) => {
                equal(context.activity.channelId, "alexa");
            });
        });
        it('should receive intent from alexa request', async () => {
            await alexaAdapter.processActivity(alexaRequest, alexaResponse, async (context: TurnContext) => {
                equal(context.activity.text, (<IntentRequest>alexaRequestEnvelope.request).intent.name);
            });
        })
    });
});