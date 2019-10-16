const assert = require('assert');
const rewire = require("rewire");
const twitter = rewire("../lib/twitterAdapter");

const settings = {
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: ''
};

const msg = {
    id: 1,
    id_str: "1",
    user: {
        id: 1,
        screen_name: "szul"
    },
    in_reply_to_screen_name: "imicknl",
    text: "Sending a tweet from a chatbot",
    entities: {
        media: []
    }
};

const client = function createTwitterClient(settings) {
    return {
        post: async function (endpoint, message, callback) {
            return msg;
        }
    };
}

const body = async function retrieveBody(request) {
    return Promise.resolve(msg);
}

twitter.__set__("createTwitterClient", client);
twitter.__set__("retrieveBody", body);

describe('Tests for Twitter Adapter', () => {
    
    it('should create a Twitter adapter object', () => {
        const adapter = new twitter.TwitterAdapter(settings);
        assert.notEqual(adapter, null);
    });
    it('should send resource responses', async () => {
        const adapter = new twitter.TwitterAdapter(settings);
        const activities = [
            { type: "message", conversation: { id: "1" }, text: "Sending a Tweet!", recipient: { id: "imicknl" } }
        ];
        const resp = await adapter.sendActivities(null, activities);
        assert.equal((resp.length > 0), true);
    });
});
