const assert = require('assert');
const rewire = require("rewire");
const twitter = rewire("../lib/twitterWebhook");

const request = function request(options) {
    return {
        statusCode: 204,
        query: {
            crc_token: 'abcde12345'
        },
        body: '[{ "id": "1" }]'
    };
}

const getBearerToken = async function getBearerToken() {
    return Promise.resolve('ABC123');
}

twitter.__set__('request', request);
twitter.__set__('getBearerToken', getBearerToken);

describe('Tests for Twitter Webhooks', () => {
    
    it('should get a challenge response', async () => {
        const res = await twitter.TwitterWebhookManager.getChallengeResponse('123', '123');
        assert.equal(res, 'PK/kD5K+asd9J5K0smfC2hHj8wh7k7sZxsUTN4aYS0Q=');
    });
    it('should register a webhook', async () => {
        const client = {
            post: async function(url, opts) {
                return Promise.resolve({
                    id: 1
                });
            }
        };
        const res = await twitter.TwitterWebhookManager.registerWebhook(client, 'production', null);
        assert.equal(res, 1);
    });
    it('should process a webhook', async () => {
        const res = await twitter.TwitterWebhookManager.processWebhook(request(), 'abcdefghijklmnopqrstuvwxyz');
        assert.equal(res.response_token, 'sha256=n28T7+dF7LI1ENE+Y8SWNfyBrO8nmOHcF0T1TJkFAkE=');
    });
    it('should list webhooks', async () => {
        const res = await twitter.TwitterWebhookManager.listWebhooks(null, null, 'production');
        assert.notEqual(res, null);
        assert.notEqual(res.length, 0);
        assert.equal(res[0].id, 1);
    });
    it('should update a webhook', async () => {
        const success = await twitter.TwitterWebhookManager.updateWebhook(null, null, null, null, 'production', 1);
        assert.equal(success, true);
    });
    it('should remove a webhook', async () => {
        const success = await twitter.TwitterWebhookManager.removeWebhook(null, null, null, null, 'production', 1);
        assert.equal(success, true);
    });

});
