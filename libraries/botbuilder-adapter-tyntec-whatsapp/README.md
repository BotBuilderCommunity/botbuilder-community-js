# Tyntec WhatsApp Adapter

A [Microsoft Bot Framework](https://www.botframework.com/) adapter for handling
connectivity with the WhatsApp channel in tyntec Conversations API.

It is a TypeScript library that allows your bots to use WhatsApp through the
tyntec Conversations API. The adapter supports two-way (incoming and outgoing)
messaging with templates, free-form and rich media.

Look how easy it is to use:

```typescript
import axios from 'axios';
import { TyntecWhatsAppAdapter } from '@botbuildercommunity/adapter-tyntec-whatsapp';

const axiosInstance = axios.create();

const adapter = new TyntecWhatsAppAdapter({
    axiosInstance,
    tyntecApikey: 'API_KEY'
});

// ... your bot and server initialization ...

server.post('/api/whatsapp/messages', async (req, res) => {
	await adapter.processActivity(req, res, (context) => myBot.run(context));
});
```

This is part of the [Bot Builder Community Extensions](https://github.com/BotBuilderCommunity/botbuilder-community-js)
project which contains various pieces of middleware, recognizers and other
components for use with the Bot Builder JavaScript SDK v4.


## Installation

Install tyntec WhatsApp adapter by running:

```shell
$ npm install @botbuildercommunity/adapter-tyntec-whatsapp
```


## Features

At the moment, the adapter supports only:

* receiving WhatsApp messages (`processActivity`) and
* sending WhatsApp messages (`sendActivities`).

See the API Reference in the [docs/](./docs) directory for more information
about how to use the library and what are the current limitations.
