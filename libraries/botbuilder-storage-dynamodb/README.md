# Bot Builder DynamoDB Storage

This is a simple storage adapter for storing BotState in DynamoDB. To use:

```js
import { DynamoDBStorage } from '@botbuildercommunity/storage-dynamodb';

const dynamoDBStorage = new DynamoDBStorage('table-name', 'us-east-1');

const conversationState = new ConversationState(dynamoDBStorage);
const userState = new UserState(dynamoDBStorage);
```

## Installation

```cmd
npm install @botbuildercommunity/storage-dynamodb --save
```
