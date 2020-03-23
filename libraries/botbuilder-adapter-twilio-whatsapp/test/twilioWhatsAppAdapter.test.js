const assert = require('assert');
const { TwilioWhatsAppAdapter } = require("../lib/twilioWhatsAppAdapter");
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

    createTwilioClient() {
        return {
            messages: {
                create(message) {
                    console.log('message sent')
                    return { sid: 'ID' };
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
        const whatsAppAdapter = new TwilioWhatsAppAdapter({
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

        assert((whatsAppAdapter.client instanceof Twilio), 'Client not of type Twilio');
        assert((whatsAppAdapter.client.username === mockAccountSid), 'Twilio client does not contain username');
        assert((whatsAppAdapter.client.password === mockAuthToken), 'Twilio client does not contain password');
        assert((whatsAppAdapter.client.accountSid === mockAccountSid), 'Twilio client does not contain accountSid');
    });

    it('constructor() should add whatsapp: prefix if missing', () => {
        const whatsAppAdapter = new TwilioWhatsAppAdapter({
            accountSid: mockAccountSid,
            authToken: mockAuthToken,
            phoneNumber: mockPhoneNumber,
            endpointUrl: mockEndpointUrl
        });

        assert((whatsAppAdapter.settings.phoneNumber === mockWhatsAppNumber), 'whatsapp: prefix not added');
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
            "contentType": "application/json",
            "content": {
                "elevation": null,
                "type": "GeoCoordinates",
                "latitude": 52.303897857666016,
                "longitude": 4.750025749206543,
                "name": "Evert van de Beekstraat 354, Schiphol, North Holland 1118 CZ"
            },
            "name": "Evert van de Beekstraat 354, Schiphol, North Holland 1118 CZ"
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

    it.skip('sendActivities() parses html formatting to WhatsApp formatting', async () => {

    });

    it.skip('sendActivities() parses persistentActions', async () => {

    });

    it.skip('sendActivities() parses image attachments', async () => {

    });

    it.skip('sendActivities() parses GeoCoordinates attachments', async () => {

    });

    it.skip('sendActivities() parses SignIn cards in attachments', async () => {

    });

});