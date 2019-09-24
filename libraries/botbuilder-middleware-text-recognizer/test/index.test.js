//@ts-check

const { TestAdapter } = require("botbuilder");
const { EmailRecognizer } = require("../lib/email");
const { URLRecognizer } = require("../lib/internet");
const { PhoneRecognizer } = require("../lib/phone");
const { SocialMediaRecognizer } = require("../lib/socialMedia");

describe('Email recognizer middleware tests', function() {
    this.timeout(5000);
    it('should return a parsed email.', async () => {
        const adapter = new TestAdapter(async (context) => {
            await context.sendActivity(context.turnState.get('emailEntities')[0]);
        });
        adapter.use(new EmailRecognizer());
        await adapter.test('My mail address is michael@szul.us', 'michael@szul.us');
    });
});

describe('URL recognizer middleware tests', function() {
    this.timeout(5000);
    it('should return a parsed URL', async () => {
        const adapter = new TestAdapter(async (context) => {
            await context.sendActivity(context.turnState.get('urlEntities')[0]);
        });
        adapter.use(new URLRecognizer());
        await adapter.test('My web site is https://michael.szul.us', 'https://michael.szul.us');
    });
});

describe('Phone recognizer middleware tests', function() {
    this.timeout(5000);
    it('should return a parsed phone', async () => {
        const adapter = new TestAdapter(async (context) => {
            await context.sendActivity(context.turnState.get('phoneNumberEntities')[0]);
        });
        adapter.use(new PhoneRecognizer());
        await adapter.test('My phone number is 540-123-1234', '540-123-1234');
    });
});

describe('Social media recognizer middleware tests', function() {
    this.timeout(5000);
    it('should return a parsed mention', async () => {
        const adapter = new TestAdapter(async (context) => {
            await context.sendActivity(context.turnState.get('mentionEntities')[0]);
        });
        adapter.use(new SocialMediaRecognizer());
        await adapter.test('My Twitter handle is @szul', '@szul');
    });
    it('should return a parsed hashtags', async () => {
        const adapter = new TestAdapter(async (context) => {
            await context.sendActivity(context.turnState.get('hastagEntities')[0]);
        });
        adapter.use(new SocialMediaRecognizer());
        await adapter.test('Follow the #codepunk hashtag', '#codepunk');
    });
});
