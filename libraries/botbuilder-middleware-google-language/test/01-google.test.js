const assert = require("assert");
const { TestAdapter } = require("botbuilder");
const { EntityExtraction } = require("../lib/entity");
const { CategoryExtraction } = require("../lib/categories");
const { SentimentAnalysis } = require("../lib/sentiment");

describe('Google Cloud language engine tests', () => {

    describe('Entity middleware tests', function () {
        this.timeout(5000);

        const mock = {
            entities: function(input) {
                return {
                    documents: [
                        {
                            entities: [
                                "Michael Szul"
                            ]
                        }
                    ]
                };
            }
        }

        const entity = new EntityExtraction("not a real key", "Not a real endpoint");
        entity.engine = mock;

        it('should extract a name', async () => {
            const adapter = new TestAdapter(async (context) => {
                await context.sendActivity(context.turnState.get('textEntities')[0]);
            });
            adapter.use(entity);
            await adapter.test('Where can I reach Michael Szul?', 'Michael Szul');
        });
    });

    describe('Categories middleware tests', function () {
        this.timeout(5000);

        const mock = {
            categories: function(input) {
                return {
                    documents: [
                        {
                            id: "Not real",
                            categories: [
                                "Philadelphia Phillies",
                                "Bryce Harper"
                            ]
                        }
                    ]
                };
            }
        }

        const categories = new CategoryExtraction("not a real key", "Not a real endpoint");
        categories.engine = mock;

        it('should extract some categories', async () => {
            const adapter = new TestAdapter(async (context) => {
                await context.sendActivity(context.turnState.get('categoryEntities')[0]);
            });
            adapter.use(categories);
            await adapter.test('The Philadelphia Phillies signed Bryce Harper.', 'Philadelphia Phillies');
        });
    });

    describe('Sentiment middleware tests', function () {
        this.timeout(5000);

        const mock = {
            sentiment: function(input) {
                return {
                    documents: [
                        {
                            id: "Not real",
                            score: 0.9928278923034668
                        }
                    ]
                };
            }
        }

        const sentiment = new SentimentAnalysis("not a real key", "Not a real endpoint");
        sentiment.engine = mock;

        it('should have a positive sentiment', async () => {
            const adapter = new TestAdapter(async (context) => {
                assert.equal(context.turnState.get('sentimentScore'), 0.9928278923034668);
            });
            adapter.use(sentiment);
            await adapter.send('I am glorious');
        });
    });

});
