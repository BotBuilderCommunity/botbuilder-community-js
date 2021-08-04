# `class TyntecWhatsAppAdapter extends BotAdapter`

`TyntecWhatsAppAdapter` is an implementation of a bot adapter that connects a
bot to WhatsApp through the tyntec Conversations API.

Properties:
* [`public onTurnError?: (context: TurnContext, error: Error) => Promise<void>`](#public-onturnerror-context-turncontext-error-error--promisevoid)

Methods:
* [`public constructor()`](#public-constructor)
* [`public use(...middlewares: (MiddlewareHandler | Middleware)[]): TyntecWhatsAppAdapter`](#public-usemiddlewares-middlewarehandler--middleware-tyntecwhatsappadapter)

If you want more information about bot adapters, see the [Microsoft Bot Framework SDK documentation](https://docs.microsoft.com/en-us/azure/bot-service/index-bf-sdk).


## `public onTurnError?: (context: TurnContext, error: Error) => Promise<void>`

Is an optional asynchronous error handler that can catch exceptions in the
middleware or application. The handler gets a `context` object for the turn and
the thrown `error`.


## `public constructor()`

Initializes the adapter.


## `public use(...middlewares: (MiddlewareHandler | Middleware)[]): TyntecWhatsAppAdapter`

Adds the `middlewares` to the middleware pipeline and returns itself.
