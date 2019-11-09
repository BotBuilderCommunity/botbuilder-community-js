const assert = require('assert');
const twitter = require("../lib/util");

const request = {
    headers: { },
    statusCode: 204,
    body: '[{ "id": "1" }]'
};

describe('Tests for utilities', () => {
    
    it('should return a request body', async () => {
        const res = await twitter.retrieveBody(request);
        assert.notEqual(res, null);
    });

});
