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

const activityMsg = {
    for_user_id: 1,
    tweet_create_events: [
        {
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
        }
    ]
};

const botActivity = {
    id: "1",
    timestamp: "2019-10-31T16:11:42.633Z",
    channelId: "twitter",
    conversation: {
        id: "1",
        isGroup: false,
        conversationType: "tweet",
        tenantId: null,
        name: ""
    },
    from: {
        id: 1,
        name: "szul"
    },
    recipient: {
        id: "imicknl",
        name: "imicknl"
    },
    text: "Sending a tweet from a chatbot",
    channelData: {
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
    },
    localTimezone: null,
    callerId: null,
    serviceUrl: null,
    listenFor: null,
    label: 1,
    valueType: null,
    type: "message"
};

const client = function createTwitterClient(settings) {
    return {
        post: async function (endpoint, message, callback) {
            return msg;
        }
    };
};

const body = async function retrieveBody(request) {
    return Promise.resolve(activityMsg);
};

const request = function getWebRequest(request) {
    return 'This is a fake request';
};

const response = function getWebResponse(response) {
    return {
        status: function(status) {
            console.log(`Response status is ${status}.`);
        },
        send: function(data) {
            console.log(`The follow response was sent: ${data}`);
        },
        end: function() {
            console.log('Response has ended.');
        }
    };
};

twitter.__set__("createTwitterClient", client);
twitter.__set__("retrieveBody", body);
twitter.__set__("getWebRequest", request);
twitter.__set__("getWebResponse", response);

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
    it('should continue a conversation', async () => {
        const adapter = new twitter.TwitterAdapter(settings);
        const logic = function(context) {
            assert.equal(context._activity.channelId, "twitter");
        }
        adapter.continueConversation(botActivity, logic);
    });
    it('should process activities', async () => {
        const adapter = new twitter.TwitterAdapter(settings);
        const logic = function(context) {
            assert.equal(context._activity.channelId, "twitter");
        }
        await adapter.processActivity(null, null, logic);
    });
    it('should thrown an exception when updating an activity', async () => {
        const adapter = new twitter.TwitterAdapter(settings);
        try {
            await adapter.updateActivity(null, null);
            assert.fail(['This should have thrown an exception.']);
        }
        catch(e) {
            assert.equal(e, 'Error: Method not supported by the Twitter API.');
        }
    });
    it('should thrown an exception when deleting an activity', async () => {
        const adapter = new twitter.TwitterAdapter(settings);
        try {
            await adapter.deleteActivity(null, null);
            assert.fail(['This should have thrown an exception.']);
        }
        catch(e) {
            assert.equal(e, 'Error: Method not supported by the Twitter API.');
        }
    });
    it('should create a turn context', () => {
        const adapter = new twitter.TwitterAdapter(settings);
        const turnContext = adapter.createContext(request);
        assert.notEqual(turnContext, null);
    });
    it('should create a Twitter client', () => {
        const adapter = new twitter.TwitterAdapter(settings);
        const client = adapter.createTwitterClient(request);
        assert.notEqual(client, null);
    });
    it('should convert an activity to a Twiter message', () => {
        const adapter = new twitter.TwitterAdapter(settings);
        const tweet = adapter.parseActivity(botActivity);
        assert.equal(tweet.status, '@imicknl Sending a tweet from a chatbot');
    });
    it('should create a Direct Message', () => {
        const adapter = new twitter.TwitterAdapter(settings);
        const dm = adapter.createDirectMessage(botActivity);
        assert.notEqual(dm, null);
        assert.equal(dm.message_create.message_data.id, 1); 
    });
    it('should create a tweet', () => {
        const adapter = new twitter.TwitterAdapter(settings);
        const tweet = adapter.createTweet(botActivity);
        assert.notEqual(tweet, null);
        assert.equal(tweet.status, '@imicknl Sending a tweet from a chatbot');
    });
    it('should create an activity', () => {
        const adapter = new twitter.TwitterAdapter(settings);
        const activity = adapter.getActivityFromTwitterMessage(msg, 'tweet');
        assert.notEqual(activity, null);
        assert.equal(activity.id, 1); 
    });

});
