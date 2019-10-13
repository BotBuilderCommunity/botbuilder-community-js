//@ts-check

const { TestAdapter } = require("botbuilder");
const rewire = require("rewire");
const spellchecker = rewire("../lib/spellcheck");

const mock = async function getWebRequest(url, string) {
    return Promise.resolve({
        content: JSON.stringify({
            _type: "SpellCheck",
            flaggedTokens: [{
                offset: 0,
                token: "hellow",
                type: "UnknownToken",
                suggestions: [{
                    suggestion: "hello",
                    score: 0.875
                }]
            }]
        })
    });
}

spellchecker.__set__("getWebRequest", mock);

describe('Spellcheck middleware tests', function () {
	this.timeout(5000);

	it('should spellcheck a message', async () => {

		const adapter = new TestAdapter(async (context) => {
			await context.sendActivity(context.turnState.get('suggestion'));
        });
        adapter.use(new spellchecker.SpellCheck("not a real key"));
		await adapter.test('hellow', 'hello');
	});
});
