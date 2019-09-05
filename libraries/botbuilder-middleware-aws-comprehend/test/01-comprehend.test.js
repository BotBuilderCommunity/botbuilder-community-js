const assert = require("assert");
const { TestAdapter } = require("botbuilder");
const { EntityExtraction } = require("../lib/entity");
const { KeyPhrases } = require("../lib/keyPhrases");
const { LanguageDetection } = require("../lib/languageDetection");
const { SentimentAnalysis } = require("../lib/sentiment");

describe('Cognitive Service engine tests', () => {

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

        const phrases = new KeyPhrases("not a real key", "Not a real endpoint");
        phrases.engine = mock;

        it('should extract some key phrases', async () => {
            const adapter = new TestAdapter(async (context) => {
                await context.sendActivity(context.turnState.get('keyPhrases')[0]);
            });
            adapter.use(phrases);
            await adapter.test('The Philadelphia Phillies signed Bryce Harper.', 'Philadelphia Phillies');
        });
    });

    describe('Language detection middleware tests', function () {
        this.timeout(5000);

        const mock = {
            detectLanguage: function(input) {
                return {
                    documents: [
                        {
                            id: "Not real",
                            detectedLanguages: [
                            {
                                name: "English",
                                iso6391Name: "en",
                                score: 1.0
                            }
                            ]
                        }
                    ]
                };
            }
        }

        const lang = new LanguageDetection("not a real key", "Not a real endpoint");
        lang.engine = mock;

        it('should detect language', async () => {
            const adapter = new TestAdapter(async (context) => {
                await context.sendActivity(context.turnState.get('language')[0].name);
            });
            adapter.use(lang);
            await adapter.test('I am glorious', 'English');
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
