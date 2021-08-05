# Tyntec WhatsApp Adapter

A [Microsoft Bot Framework](https://www.botframework.com/) adapter for handling
connectivity with the WhatsApp channel in tyntec Conversations API.

It is a TypeScript library that allows your bots to use WhatsApp through the
tyntec Conversations API.

Look how easy it is to use:

```typescript
import { TyntecWhatsAppAdapter } from '@botbuildercommunity/adapter-tyntec-whatsapp';

const adapter = new TyntecWhatsAppAdapter({
	tyntecApikey: 'API_KEY'
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


## Documentation

See the API Reference in the [docs/](./docs) directory for more information
about how to use the library and what are the current limitations.
