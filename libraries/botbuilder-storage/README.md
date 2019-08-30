# Bot Builder Azure Table Storage

Microsoft's [botbuilder-js](https://github.com/Microsoft/botbuilder-js) team recently removed support for Azure Table Storage in favor of concentrating on Azure Blob Storage. They [have indicated](https://github.com/Microsoft/botbuilder-js/issues/277#issuecomment-414378519) that they would be supportive of the community spinning out the code base as a separate NPM module, so I am putting the initial code here in order to begin modifications to turn it into a separate module.

# Bot Builder MongoDB Storage

This is a simple storage adapter for storing BotState in MongoDB. To use:

```js
import { MongoDbStorage } from 'botbuilder-storage';

const mongoDbStorage = new MongoDbStorage('mongodb://localhost:27017/', 'testDatabase', 'testCollection');

const conversationState = new ConversationState(mongoDbStorage);
const userState = new UserState(mongoDbStorage);
```

[See here for additional context](https://stackoverflow.com/questions/57639411/how-to-use-mongodb-locally-and-directline-js-for-state-management-in-bot-framewo/57664920#57664920)

## Installation

```cmd
npm install @botbuildercommunity/storage --save
```
