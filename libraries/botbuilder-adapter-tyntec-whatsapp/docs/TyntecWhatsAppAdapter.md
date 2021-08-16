# `class TyntecWhatsAppAdapter extends BotAdapter`

`TyntecWhatsAppAdapter` is an implementation of a bot adapter that connects a
bot to WhatsApp through the tyntec Conversations API.

Properties:
* [`public axiosInstance: AxiosInstance`](#public-axiosinstance-axiosinstance)
* [`public maxBodySize: number`](#public-maxbodysize-number)
* [`public onTurnError?: (context: TurnContext, error: Error) => Promise<void>`](#public-onturnerror-context-turncontext-error-error--promisevoid)
* [`public tyntecApikey: string`](#public-tyntecapikey-string)

Methods:
* [`public constructor(settings: ITyntecWhatsAppAdapterSettings)`](#public-constructorsettings-ityntecwhatsappadaptersettings)
* [`public processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void>`](#public-processactivityreq-webrequest-res-webresponse-logic-context-turncontext--promiseany-promisevoid)
* [`public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>`](#public-sendactivitiescontext-turncontext-activities-partialactivity-promiseresourceresponse)
* [`public use(...middlewares: (MiddlewareHandler | Middleware)[]): TyntecWhatsAppAdapter`](#public-usemiddlewares-middlewarehandler--middleware-tyntecwhatsappadapter)
* [`protected parseTyntecWhatsAppMessageEvent(req: {body: ITyntecMoMessage, headers: any, params: any, query: any}): Promise<Partial<Activity>>`](#protected-parsetyntecwhatsappmessageeventreq-body-ityntecmomessage-headers-any-params-any-query-any-promisepartialactivity)

If you want more information about bot adapters, see the [Microsoft Bot Framework SDK documentation](https://docs.microsoft.com/en-us/azure/bot-service/index-bf-sdk).


## `public axiosInstance: AxiosInstance`

Is an [Axios instance](https://github.com/axios/axios) used to send requests to
the tyntec Conversations API.


## `public maxBodySize: number`

Is the maximum size of the request body accepted in `processActivity`.


## `public onTurnError?: (context: TurnContext, error: Error) => Promise<void>`

Is an optional asynchronous error handler that can catch exceptions in the
middleware or application. The handler gets a `context` object for the turn and
the thrown `error`.


## `public tyntecApikey: string`

Is a [tyntec API key](https://www.tyntec.com/docs/faq-whatsapp-business-onboarding-how-can-i-get-api-key-setup-my-whatsapp-business-account)
used to authenticate requests to the tyntec Conversations API.


## `public constructor(settings: ITyntecWhatsAppAdapterSettings)`

Initializes the adapter. It sets the `axiosInstance` property to the value of
`settings.axiosInstance`, the `maxBodySize` property to the value of
`settings.maxBodySize` and the `tyntecApikey` property to the value of
`settings.tyntecApikey`. If `settings.maxBodySize` is not provided, the
`maxBodySize` property is set to `1024` by default.


## `public processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void>`

Asynchronously parses the [restify](http://restify.com/) or
[Express](http://expressjs.com/) request `req`, creates a turn context, passes
it through the middleware pipeline to the `logic` function and sets the
response `res`.

It is intended to be called from a function handler of a web server route that
is registered as a [tyntec inbound message webhook](https://www.tyntec.com/docs/docs-center-whatsapp-business-api-overview).

At the moment, only a subset of [tyntec Webhook Events](https://api.tyntec.com/reference/conversations/current.html)
is supported. These are events that meet the following criteria:

* The event must be a valid tyntec Webhook event.
* The event must be a message (`body.event === "MoMessage"`, not delivery updates).
* The event must be a WhatsApp message (`body.channel === "whatsapp"`).
* The event must not be a group message (`body.to !== undefined && body.groupId === undefined`).
* The event must be an audio message (`body.content.contentType === "media" && body.content.media.type === "audio"`),
  a document message (`body.content.contentType === "media" && body.content.media.type === "document"`),
  an image message (`body.content.contentType === "media" && body.content.media.type === "image"`),
  a sticker message (`body.content.contentType === "media" && body.content.media.type === "sticker"`),
  a text message (`body.content.contentType === "text"`) or
  a video message (`body.content.contentType === "media" && body.content.media.type === "video"`).

Supported events are turned into activities that are passed to the created turn
contexts. See [Activity.md](./Activity.md) to find out what activities may be
passed to the middleware pipeline and then to the `logic` function.

If the request is valid, the Webhook event is supported and neither the
middleware pipeline nor the `logic` function throws an error, the status code
of the response is set to 200. Otherwise, the status code is set to 500 and an
error message is written to the body.


## `public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>`

Asynchronously modifies the turn `context` and sends the set of outgoing
`activities` as WhatsApp messages.

It is intended to be called through the turn context and not directly from a
bot.

Returns an array of objects of `ResourceResponse` type containing IDs of the
delivered messages.

See [Activity.md](./Activity.md) to find out what activities may be passed to
`sendActivities`. The supported activities are:

* WhatsApp audio message activities,
* WhatsApp document message activities,
* WhatsApp image message activities,
* WhatsApp sticker message activities,
* WhatsApp template message activities,
* WhatsApp text message activities and
* WhatsApp video message activities.


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
