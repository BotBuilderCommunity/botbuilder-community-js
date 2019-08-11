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

    after(() => {
        console.log.restore()
    });
});
