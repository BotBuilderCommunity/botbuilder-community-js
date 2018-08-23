const assert = require("assert");
const config = require("../lib/index");

const secret = "i have a secret";

const qnaSecretKey = "0ae6cee2-6978-4470-847f-2a500ee72aad";

describe("BotConfig", function() {
    describe("decrypt", function() {
        it("Decrypted QnA Maker secret key value from bot file should match " + qnaSecretKey + ".", function() {
            let c = new config.BotConfig( { botFilePath: "./test/test.bot", secret: secret });
            let qna = c.QnAMaker();
            assert.equal(c.decrypt(qna.subscriptionKey), qnaSecretKey);
        });
    });
    describe("decryptAll", function() {
        it("After decrypting all values, the QnA Maker secret key should match " + qnaSecretKey + ".", function() {
            let c = new config.BotConfig({ botFilePath: "./test/test.bot", secret: secret }).decryptAll();
            let qna = c.QnAMaker();
            assert.equal(qna.subscriptionKey, qnaSecretKey);
        });
    });
});
