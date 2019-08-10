const assert = require('assert');
const { TwilioWhatsAppAdapter } = require("../lib/twilioWhatsAppAdapter");
const Twilio = require('twilio').Twilio;

describe('TwilioWhatsAppAdapter', function () {

    let adapter;

    const fakeAccountSid = 'AC8db973kwl8xp1lz94kjf0bma5pez8c'; // 34 characters
    const fakeAuthToken = '96yc5z9g44vl4ks2p1suc42yb9p4lpmu'; // 32 characters
    const fakeEndpointUrl = 'https://example.com/api/whatsapp/messages';
    const fakePhoneNumber = '+14123456789';
    const fakeWhatsAppNumber = 'whatsapp:' + fakePhoneNumber;

    it('should create a TwilioWhatsAppAdapter object', function () {
        const whatsAppAdapter = new TwilioWhatsAppAdapter({
            accountSid: fakeAccountSid,
            authToken: fakeAuthToken,
            phoneNumber: fakeWhatsAppNumber,
            endpointUrl: fakeEndpointUrl
        });

        assert((whatsAppAdapter instanceof TwilioWhatsAppAdapter), 'Adapter not of type TwilioWhatsAppAdapter');
        assert((whatsAppAdapter.settings.phoneNumber === fakeWhatsAppNumber), 'Adapter does not contain phonenumber');
        assert((whatsAppAdapter.settings.accountSid === fakeAccountSid), 'Adapter does not contain accountSid');
        assert((whatsAppAdapter.settings.endpointUrl === fakeEndpointUrl), 'Adapter does not contain endpoint url');
        assert((whatsAppAdapter.settings.authToken === fakeAuthToken), 'Adapter does not contain auth token');

        assert((whatsAppAdapter.client instanceof Twilio), 'Client not of type Twilio');
        assert((whatsAppAdapter.client.username === fakeAccountSid), 'Twilio client does not contain username');
        assert((whatsAppAdapter.client.password === fakeAuthToken), 'Twilio client does not contain password');
        assert((whatsAppAdapter.client.accountSid === fakeAccountSid), 'Twilio client does not contain accountSid');
    });

    it('should add whatsapp: prefix if missing', function () {

        const whatsAppAdapter = new TwilioWhatsAppAdapter({
            accountSid: fakeAccountSid,
            authToken: fakeAuthToken,
            phoneNumber: fakePhoneNumber,
            endpointUrl: fakeEndpointUrl
        });

        assert((whatsAppAdapter.settings.phoneNumber === fakeWhatsAppNumber), 'whatsapp: prefix not added');
    });


    it.skip('should validate if request is from Twilio', function () {

    });

    it.skip('should fail if request is not from Twilio', function () {

    });

    it.skip('should handle read activities from Twilio', function () {

    });

    it.skip('should handle read activities from Twilio', function () {

    });


    it.skip('should transform activity', function () {
        

    });

    it.skip('transform attachment to Bot Framework attachment format', function () {

    });

});