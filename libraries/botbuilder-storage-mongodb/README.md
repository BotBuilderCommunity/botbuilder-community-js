# Bot Builder MongoDB Storage

This is a simple storage adapter for storing BotState in MongoDB. To use:

```js
import { MongoDbStorage } from '@botbuildercommunity/storage-mongodb';

const mongoDbStorage = new MongoDbStorage('mongodb://localhost:27017/', 'testDatabase', 'testCollection');

const conversationState = new ConversationState(mongoDbStorage);
const userState = new UserState(mongoDbStorage);
```

[See here for additional context](https://stackoverflow.com/questions/57639411/how-to-use-mongodb-locally-and-directline-js-for-state-management-in-bot-framewo/57664920#57664920)

## Installation

```cmd
npm install @botbuildercommunity/storage-mongodb --save
```
