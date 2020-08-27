# Bot Builder DynamoDB Storage

This is a simple storage adapter for storing BotState in DynamoDB. To use:

```js
import { DynamoDBStorage } from '@botbuildercommunity/storage-dynamodb';

const dynamoDBStorage = new DynamoDBStorage(
    'table-name',
    'us-east-1',
    {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        sessionToken: 'sessionToken' // optional
    }
);

const conversationState = new ConversationState(dynamoDBStorage);
const userState = new UserState(dynamoDBStorage);
```

## Credentials
In addition to supporting explicit credentials as above, you can alternatively omit the
explicit credentials parameter and instead use [aws-sdk's other methods for automatically resolving credentials](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html).

## Installation

```cmd
npm install @botbuildercommunity/storage-dynamodb --save
```
