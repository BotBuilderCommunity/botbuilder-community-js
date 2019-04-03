/*
const { CognitiveServicesCredentials } = require("ms-rest-azure");
const { TextAnalyticsClient } = require("azure-cognitiveservices-textanalytics");

const credentials = new CognitiveServicesCredentials(process.env.TEXT_ANALYTICS_KEY);
const client = new TextAnalyticsClient(credentials, process.env.TEXT_ANALYTICS_ENDPOINT, null);

async function testSentimentConnection() {
    const input = {
        documents: [
            {
                "id": "1"
                , "text": "I am glorious"
            }
        ]
    };
    try {
        const result = await client.sentiment(input);
        const s = result.documents[0].score;
        console.log(s);
    }
    catch(e) {
        throw new Error(`Failed to process sentiment on ${input.documents[0].score}. Error: ${e}`);
    }
}

testSentimentConnection();
*/
