//@ts-check

const { TestAdapter, ActivityTypes } = require('botbuilder');
const { HandleActivityType } = require('../lib/index');

describe('ActivityType middleware tests', function () {
	this.timeout(5000);
	it('should process based on a message', async () => {
		const adapter = new TestAdapter(async (context) => {
			await context.sendActivity('Hello, activity bot!');
        });
        adapter.use(new HandleActivityType(ActivityTypes.Message, async (context) => {
			await context.sendActivity('Hello, middleware!');
		}));
		await adapter.test('Hello, activity bot!', 'Hello, middleware!');
	});
});
