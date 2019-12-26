import { AdapterAlexa } from "../src";
import { notEqual, rejects, equal, deepEqual } from "assert";
import { Activity } from "botbuilder";
import { TurnContext, ResourceResponse } from "botbuilder-core";

describe('Tests for Alexa Adapter', () => {
    let alexaAdapter: AdapterAlexa;
    const emptyActivity: Partial<Activity> = {};

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
    })
});