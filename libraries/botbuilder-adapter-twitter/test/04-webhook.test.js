const assert = require('assert');
const rewire = require("rewire");
const twitter = rewire("../lib/twitterWebhook");

const request = function request(options) {
    return {
        statusCode: 204,
        body: '[{ "id": "1" }]'
    };
}

const getBearerToken = async function getBearerToken() {
    return Promise.resolve('ABC123');
}

twitter.__set__('request', request);
twitter.__set__('getBearerToken', getBearerToken);

describe('Tests for Twitter Webhooks', () => {
    
    it('Should get a challenge response', async () => {
        const res = await twitter.TwitterWebhookManager.getChallengeResponse('123', '123');
        assert.equal(res, 'PK/kD5K+asd9J5K0smfC2hHj8wh7k7sZxsUTN4aYS0Q=');
    });
    it('Should list webhooks', async () => {
        const res = await twitter.TwitterWebhookManager.listWebhooks(null, null, 'production');
        assert.notEqual(res, null);
        assert.notEqual(res.length, 0);
        assert.equal(res[0].id, 1);
    });
    it('Should update a webhook', async () => {
        const success = await twitter.TwitterWebhookManager.updateWebhook(null, null, null, null, 'production', 1);
        assert.equal(success, true);
    });
    it('Should remote a webhook', async () => {
        const success = await twitter.TwitterWebhookManager.removeWebhook(null, null, null, null, 'production', 1);
        assert.equal(success, true);
    });

});
