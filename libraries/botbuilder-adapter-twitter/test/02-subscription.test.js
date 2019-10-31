const assert = require('assert');
const rewire = require("rewire");
const twitter = rewire("../lib/twitterSubscription");

const request = function request(options) {
    return {
        statusCode: 204,
        body: '{ "subscriptions": [ { "user_id": "12345" } ] }'
    };
}

const getBearerToken = async function getBearerToken() {
    return Promise.resolve('ABC123');
}

twitter.__set__('request', request);
twitter.__set__('getBearerToken', getBearerToken);

describe('Tests for Twitter Subscriptions', () => {
    
    it('Should manage your subscription', async () => {
        const success = await twitter.TwitterSubscriptionManager.manageSubscription(null, null, null, null, 'production');
        assert.equal(success, true);
    });
    it('Should check if ', async () => {
        const success = await twitter.TwitterSubscriptionManager.hasSubscription(null, null, null, null, 'production');
        assert.equal(success, true);
    });
    it('Should add a subscription', async () => {
        const success = await twitter.TwitterSubscriptionManager.addSubscription(null, null, null, null, 'production');
        assert.equal(success, true);
    });
    it('Should remote a subscription', async () => {
        const success = await twitter.TwitterSubscriptionManager.removeSubscription(null, null, 'production', 'szul');
        assert.equal(success, true);
    });
    it('Should list subscriptions', async () => {
        const list = await twitter.TwitterSubscriptionManager.listSubscriptions(null, null, 'production');
        assert.notEqual(list, null);
        assert.notEqual(list.length, 0);
        assert.equal(list[0], 12345);
    });

});
