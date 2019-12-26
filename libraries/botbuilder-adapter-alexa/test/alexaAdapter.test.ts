import { AdapterAlexa } from "../src";
import { notEqual, rejects } from "assert";
import { Activity } from "botbuilder";
import { TurnContext } from "botbuilder-core";

describe('Tests for Alexa Adapter', () => {
    let alexaAdapter: AdapterAlexa;

    before(() => {
        alexaAdapter = new AdapterAlexa();
    });

    it('should create instance of Alexa Adapter', () => {
        notEqual(alexaAdapter, undefined);
    });

    it('should not update activities', async () => {
        const activity: Partial<Activity> = {};
        const turn: TurnContext = new TurnContext(alexaAdapter, activity)
        await rejects(async () => {
            await alexaAdapter.updateActivity(turn, activity)
        });
    });

    it('should not update activities', async () => {
        const activity: Partial<Activity> = {};
        const turn: TurnContext = new TurnContext(alexaAdapter, activity)
        await rejects(async () => {
            await alexaAdapter.deleteActivity(turn, activity)
        });
    });
});