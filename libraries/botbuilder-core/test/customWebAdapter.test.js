const assert = require('assert');
const { CustomWebAdapter } = require('../lib/customWebAdapter');

class TestAdapter extends CustomWebAdapter { }

class MockRequest {
    constructor(body, headers) {
        if (headers && headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.data = body;
        } else {
            this.data = JSON.stringify(body);
        }

        this.headers = headers || {};
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

class MockBodyRequest {
    constructor(body, headers) {
        this.body = body;
        this.headers = headers || {};
    }

    on(event, handler) {
        assert(false, `unexpected call to request.on().`);
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

describe('CustomWebAdapter', async () => {

    it('constructor() should handle botFrameworkAdapterSettings', () => {
        const botFrameworkAdapterSettings = {
            appId: 'appId',
            appPassword: 'password'
        }

        const adapter = new TestAdapter(botFrameworkAdapterSettings);

        assert((adapter.credentials.appId === botFrameworkAdapterSettings.appId), 'appId not save to credentials');
        assert((adapter.credentials.appPassword === botFrameworkAdapterSettings.appPassword), 'appPassword not saved to credentials');
        assert((adapter.credentialsProvider.appId === botFrameworkAdapterSettings.appId), 'appId not saved to credentialsProvider');
        assert((adapter.credentialsProvider.appPassword === botFrameworkAdapterSettings.appPassword), 'appPassword not saved to credentialsProvider');
    });

    it('constructor() should handle empty botFrameworkAdapterSettings', () => {
        const botFrameworkAdapterSettings = {};
        const adapter = new TestAdapter(botFrameworkAdapterSettings);

        assert((adapter.credentials === undefined), 'Credentials should not be present');
        assert((adapter.credentialsProvider === undefined), 'CredentialsProvider should not be present');
    });

    // Test retrieveBody
    it('retrieveBody() should parse a x-www-form-urlencoded body', async () => {
        const adapter = new TestAdapter();

        const originalBodyString = 'MyVariableOne=ValueOne&MyVariableTwo=ValueTwo';
        const originalBody = {
            MyVariableOne: 'ValueOne',
            MyVariableTwo: 'ValueTwo'
        }

        const req = new MockRequest(originalBodyString, { 'Content-Type': 'application/x-www-form-urlencoded' });

        const res = new MockResponse();
        const body = await adapter.retrieveBody(req, res);

        assert.deepEqual(originalBody, body);
    });

    it('retrieveBody() should parse a json encoded body', async () => {
        const adapter = new TestAdapter();

        const originalBody = {
            test: '12345',
        };
        const req = new MockRequest(originalBody);
        const res = new MockResponse();

        const body = await adapter.retrieveBody(req, res);

        assert.deepEqual(originalBody, body);
    });

    it('retrieveBody() should parse a json encoded body provided by Restify body parser', async () => {
        const adapter = new TestAdapter();

        const originalBody = {
            test: '1234',
        };
        const req = new MockBodyRequest(originalBody);
        const res = new MockResponse();

        const body = await adapter.retrieveBody(req, res);

        assert.equal(originalBody, body);
    });

    // Test delay
    it('delay() should have a default delay of 1000ms', async () => {
        const start = new Date().getTime();
        const adapter = new TestAdapter();

        await adapter.delay();

        const end = new Date().getTime();
        assert((end - start) >= 1000, `didn't pause for delay.`);
    });

    it('delay() should delay by user input in ms', async () => {
        const start = new Date().getTime();
        const adapter = new TestAdapter();

        await adapter.delay(500);

        const end = new Date().getTime();
        assert((end - start) >= 500, `didn't pause for delay.`);
    });
});