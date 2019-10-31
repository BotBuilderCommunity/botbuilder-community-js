const assert = require('assert');
const rewire = require("rewire");
const twitter = rewire("../lib/twitterWebhook");

const request = function request(options) {
    return {
        statusCode: 204
    };
}

twitter.__set__('request', request);

describe('Tests for Twitter Webhooks', () => {
    
    it('Should get a challenge response', async () => {
        const res = await twitter.TwitterWebhookManager.getChallengeResponse('123', '123');
        assert.equal(res, 'PK/kD5K+asd9J5K0smfC2hHj8wh7k7sZxsUTN4aYS0Q=');
    });

});
