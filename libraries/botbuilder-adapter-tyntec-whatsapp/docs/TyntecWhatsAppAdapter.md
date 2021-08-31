# `class TyntecWhatsAppAdapter extends BotAdapter`

`TyntecWhatsAppAdapter` is an implementation of a bot adapter that connects a
bot to WhatsApp through the tyntec Conversations API.

Properties:
* [`public axiosInstance: AxiosInstance`](#public-axiosinstance-axiosinstance)
* [`public onTurnError?: (context: TurnContext, error: Error) => Promise<void>`](#public-onturnerror-context-turncontext-error-error--promisevoid)
* [`public tyntecApikey: string`](#public-tyntecapikey-string)

Methods:
* [`public constructor(settings: ITyntecWhatsAppAdapterSettings)`](#public-constructorsettings-ityntecwhatsappadaptersettings)
* [`public use(...middlewares: (MiddlewareHandler | Middleware)[]): TyntecWhatsAppAdapter`](#public-usemiddlewares-middlewarehandler--middleware-tyntecwhatsappadapter)

If you want more information about bot adapters, see the [Microsoft Bot Framework SDK documentation](https://docs.microsoft.com/en-us/azure/bot-service/index-bf-sdk).


## `public axiosInstance: AxiosInstance`

Is an [Axios instance](https://github.com/axios/axios) used to send requests to
the tyntec Conversations API.


## `public onTurnError?: (context: TurnContext, error: Error) => Promise<void>`

Is an optional asynchronous error handler that can catch exceptions in the
middleware or application. The handler gets a `context` object for the turn and
the thrown `error`.


## `public tyntecApikey: string`

Is a [tyntec API key](https://www.tyntec.com/docs/faq-whatsapp-business-onboarding-how-can-i-get-api-key-setup-my-whatsapp-business-account)
used to authenticate requests to the tyntec Conversations API.


## `public constructor(settings: ITyntecWhatsAppAdapterSettings)`

Initializes the adapter. It sets the `axiosInstance` property to the value of
`settings.axiosInstance` and the `tyntecApikey` property to the value of
`settings.tyntecApikey`.


## `public use(...middlewares: (MiddlewareHandler | Middleware)[]): TyntecWhatsAppAdapter`

Adds the `middlewares` to the middleware pipeline and returns itself.
