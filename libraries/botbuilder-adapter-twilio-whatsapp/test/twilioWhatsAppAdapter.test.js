const assert = require('assert');
const { TwilioWhatsAppAdapter } = require('../lib/twilioWhatsAppAdapter');
const { CardFactory } = require('botbuilder');
const Twilio = require('twilio').Twilio;

const mockAccountSid = 'AC8db973kwl8xp1lz94kjf0bma5pez8c'; // 34 characters
const mockAuthToken = '96yc5z9g44vl4ks2p1suc42yb9p4lpmu'; // 32 characters
const mockEndpointUrl = 'https://example.com/api/whatsapp/messages';
const mockPhoneNumber = '+14123456789';
const mockWhatsAppNumber = 'whatsapp:' + mockPhoneNumber;

class TwilioWhatsAppAdapterUnderTest extends TwilioWhatsAppAdapter {

    validateRequest(authToken, signature, requestUrl, message) {
        assert(authToken, `validateRequest() not passed authToken.`);
        assert.deepEqual(authToken, mockAuthToken);
        assert(signature, `validateRequest() not passed signature.`);
        assert(requestUrl, `validateRequest() not passed requestUrl.`);
        assert.deepEqual(requestUrl, mockEndpointUrl);
        assert(message, `validateRequest() not passed message.`);

        if (signature === 'skip') {
            return true;
        }

        return false;
    }

    createTwilioClient(accountSid, authToken) {
        assert(authToken, `createTwilioClient() not passed authToken.`);
        assert.deepEqual(authToken, mockAuthToken);
        assert(accountSid, `createTwilioClient() not passed accountSid.`);
        assert.deepEqual(accountSid, mockAccountSid);
        return {
            messages: {
                create(message) {
                    assert(message, `Twilio.messages.create() doesn't contain a message.`);
                    return { sid: 'sent_' + message.to };
                }
            }
        }
    }

}
// Mocks
class MockRequest {
    constructor(body, headers) {
        this.data = body;
        this.headers = headers || {};
        this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    on(event, handler) {
        switch (event) {
            case 'data':
                handler(this.data);
                break;
            case 'end':
                handler();
                break;
        }
    }
}

class MockResponse {
    constructor() {
        this.ended = false;
        this.statusCode = undefined;
        this.body = undefined;
    }

    status(status) {
        this.statusCode = status;
    }

    send(body) {
        assert(!this.ended, `response.send() called after response.end().`);
        this.body = body;
    }

    end() {
        assert(!this.ended, `response.end() called twice.`);
        assert(this.statusCode !== undefined, `response.end() called before response.send().`);
        this.ended = true;
    }
}

describe('TwilioWhatsAppAdapter', async () => {

    it('constructor() should create a TwilioWhatsAppAdapter object', () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        assert((whatsAppAdapter instanceof TwilioWhatsAppAdapter), 'Adapter not of type TwilioWhatsAppAdapter');
        assert((whatsAppAdapter.settings.phoneNumber === mockWhatsAppNumber), 'Adapter does not contain phonenumber');
        assert((whatsAppAdapter.settings.accountSid === mockAccountSid), 'Adapter does not contain accountSid');
        assert((whatsAppAdapter.settings.endpointUrl === mockEndpointUrl), 'Adapter does not contain endpoint url');
        assert((whatsAppAdapter.settings.authToken === mockAuthToken), 'Adapter does not contain auth token');
    });

    it('constructor() should add whatsapp: prefix if missing', () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockPhoneNumber,
            endpointUrl: mockEndpointUrl
        });

        assert((whatsAppAdapter.settings.phoneNumber === mockWhatsAppNumber), 'whatsapp: prefix not added');
    });

    it('constructor() should throw an error if a required parameter is missing', () => {
        try {
            new TwilioWhatsAppAdapterUnderTest({
                authToken: mockAuthToken,
                phoneNumber: mockPhoneNumber,
                endpointUrl: mockEndpointUrl
            });
            assert.fail(['This should have thrown an exception.']);
        }
        catch (e) {
            assert.equal(e, 'Error: TwilioWhatsAppAdapter.constructor(): Required TwilioWhatsAppAdapterSettings missing.');
        }
    });

    it('constructor() should pass BotFrameworkAdapterSettings to super()', () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockPhoneNumber,
            endpointUrl: mockEndpointUrl
        }, {
            appId: 'mockAppId',
            appPassword: 'mockAppPassword'
        });

        assert.equal(whatsAppAdapter.credentials.appId, 'mockAppId');
        assert.equal(whatsAppAdapter.credentials.appPassword, 'mockAppPassword');
    });

    it('processActivity()() should fail if request is missing Twilio signature headers', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const twilioBody = 'MyVariableOne=ValueOne&MyVariableTwo=ValueTwo';
        const req = new MockRequest(twilioBody);
        const res = new MockResponse();

        await whatsAppAdapter.processActivity(req, res);
        assert.strictEqual(res.statusCode, 401);
    });

    it('processActivity() should fail if request is not from Twilio', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const twilioBody = 'MyVariableOne=ValueOne&MyVariableTwo=ValueTwo';
        const req = new MockRequest(twilioBody, { 'X-Twilio-Signature': 'test' });
        const res = new MockResponse();

        await whatsAppAdapter.processActivity(req, res);
        assert.strictEqual(res.statusCode, 403);
    });

    it('processActivity() parses a Twilio message to activity', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const twilioBody = 'SmsMessageSid=SM892512e202b34d4109b10a3893fa9640&NumMedia=0&SmsSid=SM892512e202b34d4109b10a3893fa9640&SmsStatus=received&Body=test&To=whatsapp%3A%2B14123456789&NumSegments=1&MessageSid=SM892512e202b34d4109b10a3893fa9640&AccountSid=AC1a03647d811fab342c0ad608e382fab2&From=whatsapp%3A%2B31612345678&ApiVersion=2010-04-01';
        const twilioBodyToActivity = {
            id: 'SM892512e202b34d4109b10a3893fa9640',
            channelId: 'whatsapp',
            conversation: {
                id: 'whatsapp:+31612345678',
                isGroup: false,
                conversationType: null,
                tenantId: null,
                name: ''
            },
            from: { id: 'whatsapp:+31612345678', name: '' },
            recipient: { id: 'whatsapp:+14123456789', name: '' },
            text: 'test',
            channelData: {
                SmsMessageSid: 'SM892512e202b34d4109b10a3893fa9640',
                NumMedia: '0',
                SmsSid: 'SM892512e202b34d4109b10a3893fa9640',
                SmsStatus: 'received',
                Body: 'test',
                To: 'whatsapp:+14123456789',
                NumSegments: '1',
                MessageSid: 'SM892512e202b34d4109b10a3893fa9640',
                AccountSid: 'AC1a03647d811fab342c0ad608e382fab2',
                From: 'whatsapp:+31612345678',
                ApiVersion: '2010-04-01'
            },
            localTimezone: null,
            callerId: null,
            serviceUrl: null,
            listenFor: null,
            label: undefined,
            valueType: null,
            type: 'message',
            attachments: []
        }

        const req = new MockRequest(twilioBody, { 'X-Twilio-Signature': 'skip' });
        const res = new MockResponse();

        await whatsAppAdapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);

            delete context.activity.timestamp;
            assert.deepEqual(context.activity, twilioBodyToActivity)

            called = true;
        });

        assert(called, `bot logic not called.`);
        assert.strictEqual(res.statusCode, 200);
    });

    it('processActivity() parses a Twilio message with image attachment to activity', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const twilioBody = 'MediaContentType0=image%2Fjpeg&SmsMessageSid=MM21151abfaadc1fb79b782f8460862a52&NumMedia=1&SmsSid=MM21151abfaadc1fb79b782f8460862a52&SmsStatus=received&Body=&To=whatsapp%3A%2B14123456789&NumSegments=1&MessageSid=MM21151abfaadc1fb79b782f8460862a52&AccountSid=AC1a03647d811fab342c0ad608e382fab2&From=whatsapp%3A%2B31612345678&MediaUrl0=https%3A%2F%2Fapi.twilio.com%2F2010-04-01%2FAccounts%2FAC1a03647d811fab342c0ad608e382fab2%2FMessages%2FMM21151abfaadc1fb79b782f8460862a52%2FMedia%2FME5f0afa2336bd0f73ca553fb5a2e3150bc&ApiVersion=2010-04-01';
        const attachmentToValidate = [
            {
                contentType: 'image/jpeg',
                contentUrl: 'https://api.twilio.com/2010-04-01/Accounts/AC1a03647d811fab342c0ad608e382fab2/Messages/MM21151abfaadc1fb79b782f8460862a52/Media/ME5f0afa2336bd0f73ca553fb5a2e3150bc'
            }
        ];

        const req = new MockRequest(twilioBody, { 'X-Twilio-Signature': 'skip' });
        const res = new MockResponse();

        await whatsAppAdapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);
            assert.deepEqual(context.activity.attachments, attachmentToValidate);
            called = true;
        });

        assert(called, `bot logic not called.`);
        assert.strictEqual(res.statusCode, 200);
    });

    it('processActivity() parses a Twilio message with location attachment to activity', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const twilioBody = 'Latitude=52.303897857666016&Longitude=4.750025749206543&Address=Evert+van+de+Beekstraat+354%2C+Schiphol%2C+North+Holland+1118+CZ&SmsMessageSid=SM9c871cd9649aa3829298e153ae6a8123&NumMedia=0&SmsSid=SM9c871cd9649aa3829298e153ae6a8123&SmsStatus=received&Label=Microsoft&Body=&To=whatsapp%3A%2B14123456789&NumSegments=1&MessageSid=SM9c871cd9649aa3829298e153ae6a8123&AccountSid=AC1a03647d811fab342c0ad608e382fab2&From=whatsapp%3A%2B31612345678&ApiVersion=2010-04-01';
        const attachmentToValidate = [{
            'contentType': 'application/json',
            'content': {
                'elevation': null,
                'type': 'GeoCoordinates',
                'latitude': 52.303897857666016,
                'longitude': 4.750025749206543,
                'name': 'Evert van de Beekstraat 354, Schiphol, North Holland 1118 CZ'
            },
            'name': 'Evert van de Beekstraat 354, Schiphol, North Holland 1118 CZ'
        }];
        const req = new MockRequest(twilioBody, { 'X-Twilio-Signature': 'skip' });
        const res = new MockResponse();

        await whatsAppAdapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);
            assert.deepEqual(context.activity.attachments, attachmentToValidate);
            called = true;
        });

        assert(called, `bot logic not called.`);
        assert.strictEqual(res.statusCode, 200);
    });

    it('processActivity() parses a Twilio delivered event to activity', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const twilioBody = 'EventType=DELIVERED&SmsSid=SMdf55df64a2ff4920bb0748193cfbb640&SmsStatus=delivered&MessageStatus=delivered&ChannelToAddress=%2B31612345678&To=whatsapp%3A%2B31612345678&ChannelPrefix=whatsapp&MessageSid=SMdf55df64a2ff4920bb0748193cfbb640&AccountSid=AC1a03647d811fab342c0ad608e382fab2&From=whatsapp%3A%2B14123456789&ApiVersion=2010-04-01&ChannelInstallSid=XE4e524de4c4d93a42831b334b540bc5ae';

        const req = new MockRequest(twilioBody, { 'X-Twilio-Signature': 'skip' });
        const res = new MockResponse();

        await whatsAppAdapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);
            assert.strictEqual(context.activity.type, 'messageDelivered');
            called = true;
        });

        assert(called, `bot logic not called.`);
        assert.strictEqual(res.statusCode, 200);
    });

    it('processActivity() parses a Twilio sent event to activity', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const twilioBody = 'SmsSid=SM0cec4ed334e74bcbb64eb8b6684e9654&SmsStatus=sent&MessageStatus=sent&ChannelToAddress=%2B31612345678&To=whatsapp%3A%2B31612345678&ChannelPrefix=whatsapp&MessageSid=SM0cec4ed334e74bcbb64eb8b6684e9654&AccountSid=AC1a03647d811fab342c0ad608e382fab2&StructuredMessage=false&From=whatsapp%3A%2B14123456789&ApiVersion=2010-04-01&ChannelInstallSid=XEcc20d939f803ee381f2442185d0d5dc5';

        const req = new MockRequest(twilioBody, { 'X-Twilio-Signature': 'skip' });
        const res = new MockResponse();

        await whatsAppAdapter.processActivity(req, res, (context) => {
            assert(context, `context not passed.`);
            assert.strictEqual(context.activity.type, 'messageSent');
            called = true;
        });

        assert(called, `bot logic not called.`);
        assert.strictEqual(res.statusCode, 200);
    });

    it('sendActivities() parses html formatting to WhatsApp formatting', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const result = await whatsAppAdapter.sendActivities(null, [
            { conversation: { id: 'mockId1' }, type: 'message', text: 'Hello this is the first message.' },
            { conversation: { id: 'mockId2' }, type: 'message', text: 'This is the second message' }
        ]);

        assert.notEqual(result, null);
        assert.equal((result.length === 2), true);
        assert.deepEqual(result, [{ id: 'sent_mockId1' }, { id: 'sent_mockId2' }]);
    });

    it('parseActivity() parses basis activity to WhatsApp message', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const result = await whatsAppAdapter.parseActivity(
            { conversation: { id: 'mockId' }, type: 'message', text: 'Test 1234.' }
        );

        assert.deepEqual(result, {
            body: 'Test 1234.',
            from: 'whatsapp:+14123456789',
            to: 'mockId'
        });
    });

    it('parseActivity() parses html formatting to WhatsApp formatting', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const result = await whatsAppAdapter.parseActivity(
            {
                conversation: { id: 'mockId' },
                type: 'message',
                text: 'Hello, I can transform <b>bold</b>, <i>italic</i>, <s>strikethrough</s> and <code>{}</code> code.'
            }
        );

        assert.equal(result.body, 'Hello, I can transform *bold*, _italic_, ~strikethrough~ and ```{}``` code.');
    });

    it('parseActivity() parses persistentActions as string', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const result = await whatsAppAdapter.parseActivity(
            {
                conversation: { id: 'mockId' },
                type: 'message',
                text: 'Message with PersistentAction.',
                channelData: {
                    persistentAction: 'geo:{latitude},{longitude}|{label}'
                }
            }
        );

        assert.equal(result.body, 'Message with PersistentAction.');
        assert.deepEqual(result.persistentAction, ['geo:{latitude},{longitude}|{label}'])
    });

    it('parseActivity() parses persistentActions as array', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const result = await whatsAppAdapter.parseActivity(
            {
                conversation: { id: 'mockId' },
                type: 'message',
                text: 'Message with PersistentAction.',
                channelData: {
                    persistentAction: ['geo:{latitude},{longitude}|{label}']
                }
            }
        );

        assert.equal(result.body, 'Message with PersistentAction.');
        assert.deepEqual(result.persistentAction, ['geo:{latitude},{longitude}|{label}'])
    });

    it('parseActivity() parses image attachments', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const result = await whatsAppAdapter.parseActivity(
            {
                conversation: { id: 'mockId' },
                type: 'message',
                text: 'Message with attachments',
                attachments: [
                    {
                        contentType: 'image/png',
                        contentUrl: 'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png'
                    },
                    {
                        contentType: 'image/png',
                        contentUrl: 'https://imageurl.com'
                    }
                ]
            }
        );

        assert.equal(result.body, 'Message with attachments');
        assert.equal(result.mediaUrl, 'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png');
    });

    it('parseActivity() parses GeoCoordinates attachments', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const result = await whatsAppAdapter.parseActivity(
            {
                conversation: { id: 'mockId' },
                type: 'message',
                text: 'Message with GeoCoordinates attachment',
                attachments: [
                    {
                        contentType: 'application/json',
                        content: {
                            elevation: null,
                            type: 'GeoCoordinates',
                            latitude: 52.303897857666016,
                            longitude: 4.750025749206543,
                            name: 'Evert van de Beekstraat 354, Schiphol, Netherlands'
                        },
                        name: 'Evert van de Beekstraat 354, Schiphol, North Holland 1118 CZ'
                    }
                ]
            }
        );

        assert.equal(result.body, 'Message with GeoCoordinates attachment');
        assert.deepEqual(result.persistentAction, [
            'geo:52.303897857666016,4.750025749206543|Evert van de Beekstraat 354, Schiphol, Netherlands'
        ]);
    });

    it('parseActivity() parses SignIn cards in attachments', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const result = await whatsAppAdapter.parseActivity(
            {
                conversation: { id: 'mockId' },
                type: 'message',
                text: '(this text will be ignored)',
                attachments: [
                    CardFactory.signinCard(
                        'BotFramework Sign in Card',
                        'https://login.microsoftonline.com',
                        'Sign in'
                    )
                ]
            });

        assert.equal(result.body, 'Sign in\n\n*BotFramework Sign in Card*\nhttps://login.microsoftonline.com');
    });

    it('parseActivity() throws error on empty message and attachment url', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });


        try {
            const result = await whatsAppAdapter.parseActivity(
                {
                    conversation: { id: 'mockId' },
                    type: 'message'
                });
            assert.fail(['This should have thrown an exception.']);
        }
        catch (e) {
            assert.equal(e, 'Error: TwilioWhatsAppAdapter.parseActivity(): An activity text or attachment with contentUrl must be specified.');
        }
    });

    it('updateActivity() should throw an exception', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        try {
            await whatsAppAdapter.updateActivity(null, null);
            assert.fail(['This should have thrown an exception.']);
        }
        catch (e) {
            assert.equal(e, 'Error: Method not supported by Twilio WhatsApp API.');
        }
    });

    it('deleteActivity() should throw an exception', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        try {
            await whatsAppAdapter.deleteActivity(null, null);
            assert.fail(['This should have thrown an exception.']);
        }
        catch (e) {
            assert.equal(e, 'Error: Method not supported by Twilio WhatsApp API.');
        }
    });

    it('createContext() should create a context', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapterUnderTest({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const activity = {
            id: 'SM892512e202b34d4109b10a3893fa9640',
            channelId: 'whatsapp',
            conversation: {
                id: 'whatsapp:+31612345678',
                isGroup: false,
                conversationType: null,
                tenantId: null,
                name: ''
            },
            from: { id: 'whatsapp:+31612345678', name: '' },
            recipient: { id: 'whatsapp:+14123456789', name: '' },
            text: 'test',
            type: 'message'
        }

        const turnContext = whatsAppAdapter.createContext(activity);
        assert.notEqual(turnContext, null);
    });

    it('createTwilioClient() should create a Twilio client', async () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapter({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockWhatsAppNumber,
            endpointUrl: mockEndpointUrl
        });

        const client = whatsAppAdapter.createTwilioClient(mockAccountSid, mockAuthToken);

        assert.notEqual(client, null);
        assert((client instanceof Twilio), 'Client not of type Twilio');
    });

});