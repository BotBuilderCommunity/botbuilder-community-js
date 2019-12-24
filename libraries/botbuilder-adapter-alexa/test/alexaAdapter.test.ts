import { AdapterAlexa } from "../src";
import { notEqual } from "assert";

describe('Tests for Alexa Adapter', () => {
    it('should create instance of Alexa Adapter', () => {
        const alexaAdapter = new AdapterAlexa();
        notEqual(alexaAdapter, undefined);
    });
});