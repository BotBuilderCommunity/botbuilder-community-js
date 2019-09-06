const assert = require("assert");
const { TestAdapter } = require("botbuilder");
const { EntityExtraction } = require("../lib/entity");
const { KeyPhrases } = require("../lib/keyPhrases");
const { SentimentAnalysis } = require("../lib/sentiment");
const { CategoryExtraction } = require("../lib/categories");
const { ConceptExtraction } = require("../lib/concepts");
const { EmotionDetection } = require("../lib/emotion");

describe('Watson engine tests', () => {

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

        const entity = new EntityExtraction({ apiKey: "not a real key", endpoint: "Not a real endpoint", version: '2018-11-16' });
        entity.engine = mock;

        it('should extract a name', async () => {
            const adapter = new TestAdapter(async (context) => {
                await context.sendActivity(context.turnState.get('textEntities')[0]);
            });
            adapter.use(entity);
            await adapter.test('Where can I reach Michael Szul?', 'Michael Szul');
        });
    });

    describe('Key phrases middleware tests', function () {
        this.timeout(5000);

        const mock = {
            keyPhrases: function(input) {
                return {
                    documents: [
                        {
                            id: "Not real",
                            keyPhrases: [
                                "Philadelphia Phillies",
                                "Bryce Harper"
                            ]
                        }
                    ]
                };
            }
        }

        const phrases = new KeyPhrases({ apiKey: "not a real key", endpoint: "Not a real endpoint", version: '2018-11-16' });
        phrases.engine = mock;

        it('should extract some key phrases', async () => {
            const adapter = new TestAdapter(async (context) => {
                await context.sendActivity(context.turnState.get('keyPhrases')[0]);
            });
            adapter.use(phrases);
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

        const sentiment = new SentimentAnalysis({ apiKey: "not a real key", endpoint: "Not a real endpoint", version: '2018-11-16' });
        sentiment.engine = mock;

        it('should have a positive sentiment', async () => {
            const adapter = new TestAdapter(async (context) => {
                assert.equal(context.turnState.get('sentimentScore'), 0.9928278923034668);
            });
            adapter.use(sentiment);
            await adapter.send('I am glorious');
        });
    });

    describe('Category middleware tests', function () {
        this.timeout(5000);

        const mock = {
            categories: function(input) {
                return {
                    documents: [
                        {
                            categories: {

                            }
                        }
                    ]
                };
            }
        }

        const categories = new CategoryExtraction({ apiKey: "not a real key", endpoint: "Not a real endpoint", version: '2018-11-16' });
        categories.engine = mock;

        it('should have a category', async () => {
            const adapter = new TestAdapter(async (context) => {
                assert.notEqual(context.turnState.get('categoryEntities'), null);
            });
            adapter.use(categories);
            await adapter.send('I am glorious');
        });
    });

    describe('Concept middleware tests', function () {
        this.timeout(5000);

        const mock = {
            concepts: function(input) {
                return {
                    documents: [
                        {
                            concepts: {

                            }
                        }
                    ]
                };
            }
        }

        const concepts = new ConceptExtraction({ apiKey: "not a real key", endpoint: "Not a real endpoint", version: '2018-11-16' });
        concepts.engine = mock;

        it('should have a concept', async () => {
            const adapter = new TestAdapter(async (context) => {
                assert.notEqual(context.turnState.get('conceptEntities'), null);
            });
            adapter.use(concepts);
            await adapter.send('I am glorious');
        });
    });

    describe('Emotion middleware tests', function () {
        this.timeout(5000);

        const mock = {
            emotion: function(input) {
                return {
                    documents: [
                        {
                            emotion: {

                            }
                        }
                    ]
                };
            }
        }

        const emotions = new EmotionDetection({ apiKey: "not a real key", endpoint: "Not a real endpoint", version: '2018-11-16' });
        emotions.engine = mock;

        it('should have an emotion', async () => {
            const adapter = new TestAdapter(async (context) => {
                assert.notEqual(context.turnState.get('emotionDetection'), null);
            });
            adapter.use(emotions);
            await adapter.send('I am glorious');
        });
    });

});
