const assert = require("assert");
const { Engine, CognitiveServiceEngine, WatsonEngine } = require("../lib/engine");

describe("Tests for NLP engine", () => {
    const key = "fake key";
    const endpoint = "fake endpoint";
    const opts = {
        engine: 0,
        ClientOptions: {}
    };
    it("should return a Cognitive Service engine", () => {
        const engine = Engine.getEngine(key, endpoint, opts);
        assert.notEqual(engine.credentials, null);
    });
    /*
    it("should return a Watson engine", () => {

    });
    */
});
