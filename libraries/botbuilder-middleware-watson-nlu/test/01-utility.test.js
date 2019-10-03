//@ts-check

const assert = require("assert");
const { EmotionDetection } = require("../lib/emotion");
const { EntityExtraction } = require("../lib/entity");
const { KeyPhrases } = require("../lib/keyPhrases");

describe('Utility/static methods on middleware', () => {
    const keyword = {
        text: "morning breakfast",
        sentiment: {
            score: 0.792454
        },
        relevance: 0.864624,
        emotion: {
            sadness: 0.188625,
            joy: 0.522781,
            fear: 0.12012,
            disgust: 0.103212,
            anger: 0.106669
        }
    };
    const emotions = {
        sadness: 0.028574,
        joy: 0.859042,
        fear: 0.02752,
        disgust: 0.017519,
        anger: 0.012855
    };
    describe('Emotion detection utility methods', function() {
        it('should set a config value', async () => {
            assert.doesNotThrow(() => {
                const e = new EmotionDetection("Not a real key", "Not a real endpoint");
                e.set("document", true);
            }, "Threw an exception setting a configuration item.");
        });
        it('should get all of the emotions off of a keyword or entity record.', () => {
            const emotions = EmotionDetection.getEmotions(keyword);
            assert.notEqual(emotions, null);
            assert.notEqual(emotions.sadness, null);
            assert.notEqual(emotions.joy, null);
            assert.notEqual(emotions.fear, null);
            assert.notEqual(emotions.disgust, null);
            assert.notEqual(emotions.anger, null);
        });
        it('should return a string array of emotion keys ranked according to score.', () => {
            const rankedKeys = EmotionDetection.rankEmotionKeys(emotions);
            assert.notEqual(rankedKeys, null);
            assert.notEqual(rankedKeys.length, 0);
            assert.equal(rankedKeys[0], 'joy');
        });
        it('should return an array of emotion scores ranked according to score.', () => {
            const rankedScores = EmotionDetection.rankEmotions(emotions);
            assert.notEqual(rankedScores, null);
            assert.notEqual(rankedScores.length, 0)
            assert.equal(rankedScores[0].name, 'joy');
            assert.equal(rankedScores[0].score, 0.859042);
        });
        it('should return the top emotion string.', () => {
            const emotion = EmotionDetection.topEmotion(emotions);
            assert.notEqual(emotion, null);
            assert.equal(emotion, 'joy');
        });
        it('should return the top emotion object.', () => {
            const emotion = EmotionDetection.topEmotionScore(emotions);
            assert.notEqual(emotion, null);
            assert.equal(emotion.name, 'joy');
            assert.equal(emotion.score, 0.859042);
        });
        it('should return the difference between the top 2 emotion scores.', () => {
            const diff = EmotionDetection.calculateDifference(emotions);
            assert.notEqual(diff, NaN);
            assert.equal(diff, 0.830468);
        });
        it('should return the difference between 2 emotion scores.', () => {
            const diff = EmotionDetection.calculateDifference(emotions, 'sadness', 'anger');
            assert.notEqual(diff, NaN);
            assert.equal(diff, 0.015718999999999997);
        });
        it('should calculate the variance of emotion scores', () => {
            const variance = EmotionDetection.calculateVariance(emotions);
            assert.equal(variance, 0.14030032900149997);
        });
    });
});
describe('Entity extraction utility methods', () => {
    /*
        * Entity example pulled from the IBM Watson NLU API documentation: https://cloud.ibm.com/apidocs/natural-language-understanding?code=node#entities
        */
    const entities = [
        {
            "type": "Company",
            "text": "CNN",
            "sentiment": {
            "score": 0.0,
            "label": "neutral"
            },
            "relevance": 0.677891,
            "disambiguation": {
            "subtype": [
                "Broadcast",
                "AwardWinner",
                "RadioNetwork",
                "TVNetwork"
            ],
            "name": "CNN",
            "dbpedia_resource": "http://dbpedia.org/resource/CNN"
            },
            "count": 9
        },
        {
            "type": "Company",
            "text": "NPR",
            "sentiment": {
                "score": 0.0,
                "label": "neutral"
            },
            "relevance": 0.784947,
            "disambiguation": {
                "subtype": [
                "Broadcast",
                "AwardWinner",
                "RadioNetwork",
                "TVNetwork"
                ],
                "name": "NPR",
                "dbpedia_resource": "http://dbpedia.org/resource/NPR"
            },
            "count": 3
            }
        ];
    it('should set a config value', async () => {
        assert.doesNotThrow(() => {
            const e = new EntityExtraction("Not a real key", "Not a real endpoint");
            e.set("emotion", true);
            e.set("sentiment", true);
        }, "Threw an exception setting a configuration item.");
    });
    it('should return a string array of all of the entities.', () => {
        const entityResult = EntityExtraction.getEntities(entities);
        assert.notEqual(entityResult, null);
        assert.equal(entityResult.length, 2);
    });
    it('should return a string array of all of the entities of a specific type.', () => {
        const entityResult = EntityExtraction.getEntities(entities, 'company');
        assert.notEqual(entityResult, null);
        assert.equal(entityResult.length, 2);
    });
    it('should return a string array of entities ranked according to relevance.', () => {
        const rankedKeys = EntityExtraction.rankEntityKeys(entities);
        assert.notEqual(rankedKeys, null);
        assert.notEqual(rankedKeys.length, 0);
        assert.equal(rankedKeys[0], 'NPR');
    });
    it('should return an array of entities ranked according to score.', () => {
        const rankedScores = EntityExtraction.rankEntities(entities);
        assert.notEqual(rankedScores, null);
        assert.notEqual(rankedScores.length, 0)
        assert.equal(rankedScores[0].text, 'NPR');
    });
    it('should return the top entity string.', () => {
        const entityResult = EntityExtraction.topEntity(entities);
        assert.notEqual(entityResult, null);
        assert.equal(entityResult, 'NPR');
    });
    it('should return the top entity object.', () => {
        const entityResult = EntityExtraction.topEntityResult(entities);
        assert.notEqual(entityResult, null);
        assert.equal(entityResult.text, 'NPR');
    });
});
describe('Keyword extraction utility methods', () => {
    const keywords = [
        {
            text: "morning breakfast",
            relevance: 0.864624
        },
        {
            text: "lunch",
            relevance: 0.524624
        },
    ];
    it('should set a config value', async () => {
        assert.doesNotThrow(() => {
            const e = new KeyPhrases("Not a real key", "Not a real endpoint");
            e.set("emotion", true);
            e.set("sentiment", true);
        }, "Threw an exception setting a configuration item.");
    });
    it('should return a string array of keywords ranked according to relevance.', () => {
        const rankedKeys = KeyPhrases.rankKeywordKeys(keywords);
        assert.notEqual(rankedKeys, null);
        assert.notEqual(rankedKeys.length, 0);
        assert.equal(rankedKeys[0], 'morning breakfast');
    });
    it('should return an array of keywords ranked according to score.', () => {
        const rankedScores = KeyPhrases.rankKeywords(keywords);
        assert.notEqual(rankedScores, null);
        assert.notEqual(rankedScores.length, 0)
        assert.equal(rankedScores[0].text, 'morning breakfast');
    });
    it('should return the top keyword string.', () => {
        const keywordResult = KeyPhrases.topKeyword(keywords);
        assert.notEqual(keywordResult, null);
        assert.equal(keywordResult, 'morning breakfast');
    });
    it('should return the top keyword object.', () => {
        const keywordResult = KeyPhrases.topKeywordResult(keywords);
        assert.notEqual(keywordResult, null);
        assert.equal(keywordResult.text, 'morning breakfast');
    });
});
