const assert = require('assert');
const rewire = require("rewire");
const twitter = rewire("../lib/twitterToken");

const request = function request(options) {
    return {
        statusCode: 204,
        body: '{ "access_token": "1234567890" }'
    };
}

twitter.__set__('request', request);

describe('Tests for Twitter Tokens', () => {
    
    it('should get a bearer token', async () => {
        const token = await twitter.TwitterTokenManager.getBearerToken(null, null);
        assert.notEqual(token, null);
        assert.equal(token, '1234567890');
    });

});
