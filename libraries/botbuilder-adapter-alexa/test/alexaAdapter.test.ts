import { AdapterAlexa } from "../src";
import { notEqual, rejects, equal, deepEqual } from "assert";
import { Activity, WebRequest, WebResponse } from "botbuilder";
import { TurnContext, ResourceResponse } from "botbuilder-core";

describe('Tests for Alexa Adapter', () => {
    let alexaAdapter: AdapterAlexa;
    const emptyActivity: Partial<Activity> = {};
    const alexaRequest: WebRequest = {
        headers: {},
        on: (event: any, ...args: any[]) => {}
    }
    const alexaResponse: WebResponse = {
        end(...args: any[]): any {},
        send(body: any): any {},
        status(status: number): any {},
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
    });
});