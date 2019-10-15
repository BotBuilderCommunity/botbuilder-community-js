const assert = require('assert');
const rewire = require("rewire");
const twitter = rewire("../lib/twitterAdapter");

const mock = function createTwitterClient(settings) {
    return {
        post: function (endpoint, message, callback) {
        }
    };
}

twitter.__set__("createTwitterClient", mock);

describe('Tests for Twitter Adapter', () => {
    const settings = {
        consumer_key: '',
        consumer_secret: '',
        access_token_key: '',
        access_token_secret: ''
    };
    it('should create a Twitter adapter object', () => {
        const adapter = new twitter.TwitterAdapter(settings);
        assert.notEqual(adapter, null);
    });
});
