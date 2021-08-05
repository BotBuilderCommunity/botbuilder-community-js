# `class TyntecWhatsAppAdapter extends BotAdapter`

`TyntecWhatsAppAdapter` is an implementation of a bot adapter that connects a
bot to WhatsApp through the tyntec Conversations API.

Properties:
* [`public axiosInstance: AxiosInstance`](#public-axiosinstance-axiosinstance)
* [`public onTurnError?: (context: TurnContext, error: Error) => Promise<void>`](#public-onturnerror-context-turncontext-error-error--promisevoid)
* [`public tyntecApikey: string`](#public-tyntecapikey-string)

Methods:
* [`public constructor(settings: ITyntecWhatsAppAdapterSettings)`](#public-constructorsettings-ityntecwhatsappadaptersettings)
* [`public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>`](#public-sendactivitiescontext-turncontext-activities-partialactivity-promiseresourceresponse)
* [`public use(...middlewares: (MiddlewareHandler | Middleware)[]): TyntecWhatsAppAdapter`](#public-usemiddlewares-middlewarehandler--middleware-tyntecwhatsappadapter)
* [`protected parseTyntecWhatsAppMessageEvent(req: {body: ITyntecMoMessage, headers: any, params: any, query: any}): Promise<Partial<Activity>>`](#protected-parsetyntecwhatsappmessageeventreq-body-ityntecmomessage-headers-any-params-any-query-any-promisepartialactivity)

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


## `public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>`

Asynchronously modifies the turn `context` and sends the set of outgoing
`activities` as WhatsApp messages.

It is intended to be called through the turn context and not directly from a
bot.

Returns an array of objects of `ResourceResponse` type containing IDs of the
delivered messages.

See [Activity.md](./Activity.md) to find out what activities may be passed to
`sendActivities`. The supported activities are:

* WhatsApp template message activities.


## `public use(...middlewares: (MiddlewareHandler | Middleware)[]): TyntecWhatsAppAdapter`

Adds the `middlewares` to the middleware pipeline and returns itself.


## `protected parseTyntecWhatsAppMessageEvent(req: {body: ITyntecMoMessage, headers: any, params: any, query: any}): Promise<Partial<Activity>>`

Maps the `req.params`, `req.query`, `req.headers` and `req.body` of a request
accepted by [`processActivity`](#public-processactivityreq-webrequest-res-webresponse-logic-context-turncontext--promiseany-promisevoid)
to the corresponding activity object.

It is called by the [`public processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void>`](#public-processactivityreq-webrequest-res-webresponse-logic-context-turncontext--promiseany-promisevoid)
method.

See [Activity.md](./Activity.md) to find out what activities are allowed to be
returned.

It may be overridden to add additional checks (like authorization) on the
incoming requests. For example, the [tyntec inbound message webhook](https://www.tyntec.com/docs/docs-center-whatsapp-business-api-overview)
can be registered with a custom header containing a user-defined bearer token.
Then, the overriding method can check this header and throw an error if the
token is invalid.

```typescript
class MyAdapter extends TyntecWhatsAppAdapter {
    protected async parseTyntecWhatsAppMessageEvent(req: {body: ITyntecMoMessage, headers: any, params: any, query: any}): Promise<Partial<Activity>> {
        if (req.headers['authorization'] !== 'Bearer mF_9.B5f-4.1JqM') {
            throw new Error('Unauthorized');
        }
        return super.parseTyntecWhatsAppMessageEvent(req);
    }
}
```
