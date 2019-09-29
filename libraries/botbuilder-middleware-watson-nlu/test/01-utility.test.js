//@ts-check

const assert = require("assert");
const { EmotionDetection } = require("../lib/emotion");

describe('Utility/static  methods on middleware', () => {
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
        it('should return a string array or emotion keys ranked according to score.', () => {
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
            console.warn('Not currently implemented. Will always return zero.');
            const variance = EmotionDetection.calculateVariance();
            assert.equal(variance, 0);
        });
    });
});
