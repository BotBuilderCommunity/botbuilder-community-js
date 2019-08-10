const assert = require('assert');
const { ConsoleAdapter } = require("../lib/consoleAdapter");
const sinon = require('sinon');

class TestBot {
    constructor() {
    }
    async onTurn(context) {
        if (context.activity.text != null && context.activity.text === "exit") {
            process.exit();
        }
    }
}

describe('Console adapter tests', () => {
    let testBot;
    let adapter;

    before(() => {
        testBot = new TestBot();
        adapter = new ConsoleAdapter();

        adapter.processActivity(async (context) => {
            await testBot.onTurn(context);
        });

        sinon.stub(console, 'log')
    });

    it("should result in two response objects", async () => {
        const result = await adapter.sendActivities(null, [
            { type: "typing" },
            { type: "message", text: "The current status of the train from Philadelphia to Charlottesville is: delayed" }
        ]);
        assert.notEqual(result, null);
        assert.equal((result.length === 2), true);
    });
<<<<<<< HEAD:libraries/botbuilder-adapter-console/test/consoleAdapter.test.js

    after(() => {
        console.log.restore()
    });
=======
>>>>>>> 4016b576670d92a093a614d58b83610a1f185fb1:libraries/botbuilder-adapters/test/index.test.js
});
