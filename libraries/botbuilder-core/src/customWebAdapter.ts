import { BotAdapter, WebRequest, BotFrameworkAdapterSettings, IUserTokenProvider, TokenResponse, TurnContext, ConversationReference } from 'botbuilder';
import { AppCredentials, JwtTokenValidation, MicrosoftAppCredentials, SimpleCredentialProvider, TokenApiClient, TokenApiModels, TokenStatus, TokenExchangeRequest, SignInUrlResponse } from 'botframework-connector';
import { parse as parseQueryString } from 'qs';

// Constants taken from BotFrameworkAdapter.ts
const OAUTH_ENDPOINT = 'https://api.botframework.com';
const US_GOV_OAUTH_ENDPOINT = 'https://api.botframework.azure.us';

import { USER_AGENT } from 'botbuilder/lib/botFrameworkAdapter';

/**
 * Adds helper functions to the default BotAdapter
 */
export abstract class CustomWebAdapter extends BotAdapter implements IUserTokenProvider {

    /**
     * Workaround for [ABS OAuth cards](https://github.com/microsoft/botbuilder-js/pull/1812)
     */
    public name = 'Web Adapter';

    // OAuth Properties
    protected readonly oAuthSettings: BotFrameworkAdapterSettings;
    protected readonly credentials: AppCredentials;
    protected readonly credentialsProvider: SimpleCredentialProvider;
    public readonly TokenApiClientCredentialsKey: symbol = Symbol('TokenApiClientCredentials');

    /**
     * Creates a new CustomWebAdapter instance.
     * @param botFrameworkAdapterSettings configuration settings for the adapter.
     */
    public constructor(botFrameworkAdapterSettings?: BotFrameworkAdapterSettings) {
        super();

        this.oAuthSettings = botFrameworkAdapterSettings;

        if (this.oAuthSettings?.appId) {
            this.credentials = new MicrosoftAppCredentials(
                this.oAuthSettings.appId,
                this.oAuthSettings.appPassword || '',
                this.oAuthSettings.channelAuthTenant
            );

            this.credentialsProvider = new SimpleCredentialProvider(
                this.credentials.appId,
                this.oAuthSettings.appPassword || ''
            );
        }

    }

    /**
     * Retrieve body from WebRequest
     * Works with Express & Restify
     * @protected
     * @param req incoming web request
     */
    protected retrieveBody(req: WebRequest): Promise<any> {
        const contentType = req.headers['content-type'] || req.headers['Content-Type'];

        return new Promise((resolve: any, reject: any): void => {
            if (req.body) {
                try {
                    resolve(req.body);
                } catch (err) {
                    reject(err);
                }
            } else {
                let requestData = '';
                req.on('data', (chunk: string): void => {
                    requestData += chunk;
                });
                req.on('end', (): void => {
                    try {
                        if (contentType?.includes('application/x-www-form-urlencoded')) {
                            req.body = parseQueryString(requestData);
                        } else {
                            req.body = JSON.parse(requestData);
                        }

                        resolve(req.body);
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        });
    }

    /**
     * Copied from `BotFrameworkAdapter.ts` to support { type: 'delay' } activity.
     * @param timeout timeout in milliseconds
     * @default 1000
     */
    protected delay(timeout: number): Promise<void> {
        timeout = (typeof timeout === 'number' ? timeout : 1000);

        return new Promise((resolve): void => {
            setTimeout(resolve, timeout);
        });
    }

    // OAuth functionality copied from BotFrameworkAdapter.ts

    /**
     * Asynchronously attempts to retrieve the token for a user that's in a login flow.
     * 
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param magicCode Optional. The validation code the user entered.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     * 
     * @returns A [TokenResponse](xref:botframework-schema.TokenResponse) object that contains the user token.
     */
    public async getUserToken(context: TurnContext, connectionName: string, magicCode?: string): Promise<TokenResponse>;
    public async getUserToken(context: TurnContext, connectionName: string, magicCode?: string, oAuthAppCredentials?: AppCredentials): Promise<TokenResponse>;
    public async getUserToken(context: TurnContext, connectionName: string, magicCode?: string, oAuthAppCredentials?: AppCredentials): Promise<TokenResponse> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(`CustomWebAdapter.getUserToken(): missing from or from.id`);
        }
        if (!connectionName) {
            throw new Error('getUserToken() requires a connectionName but none was provided.');
        }
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url, oAuthAppCredentials);
        context.turnState.set(this.TokenApiClientCredentialsKey, client);

        const result: TokenApiModels.UserTokenGetTokenResponse = await client.userToken.getToken(userId, connectionName, { code: magicCode, channelId: context.activity.channelId });
        if (!result || !result.token || result._response.status == 404) {
            return undefined;
        } else {
            return result as TokenResponse;
        }
    }

    /**
     * Asynchronously signs out the user from the token server.
     * 
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param userId The ID of user to sign out.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     */
    public async signOutUser(context: TurnContext, connectionName?: string, userId?: string): Promise<void>;
    public async signOutUser(context: TurnContext, connectionName?: string, userId?: string, oAuthAppCredentials?: AppCredentials): Promise<void>;
    public async signOutUser(context: TurnContext, connectionName?: string, userId?: string, oAuthAppCredentials?: AppCredentials): Promise<void> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(`CustomWebAdapter.signOutUser(): missing from or from.id`);
        }
        if (!userId) {
            userId = context.activity.from.id;
        }

        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url, oAuthAppCredentials);
        context.turnState.set(this.TokenApiClientCredentialsKey, client);

        await client.userToken.signOut(userId, { connectionName: connectionName, channelId: context.activity.channelId });
    }

    /**
     * Asynchronously gets a sign-in link from the token server that can be sent as part
     * of a [SigninCard](xref:botframework-schema.SigninCard).
     * 
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     * @param userId The user id that will be associated with the token.
     * @param finalRedirect The final URL that the OAuth flow will redirect to.
     */
    public async getSignInLink(context: TurnContext, connectionName: string, oAuthAppCredentials?: AppCredentials, userId?: string, finalRedirect?: string): Promise<string> {
        if (userId && userId != context.activity.from.id) {
            throw new ReferenceError(`cannot retrieve OAuth signin link for a user that's different from the conversation`);
        }

        const conversation: Partial<ConversationReference> = TurnContext.getConversationReference(context.activity);
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url, oAuthAppCredentials);
        context.turnState.set(this.TokenApiClientCredentialsKey, client);
        const state: any = {
            ConnectionName: connectionName,
            Conversation: conversation,
            MsAppId: (client.credentials as AppCredentials).appId,
            RelatesTo: context.activity.relatesTo
        };

        const finalState: string = Buffer.from(JSON.stringify(state)).toString('base64');
        return (await client.botSignIn.getSignInUrl(finalState, { channelId: context.activity.channelId, finalRedirect }))._response.bodyAsText;
    }

    /** 
     * Asynchronously retrieves the token status for each configured connection for the given user.
     * 
     * @param context The context object for the turn.
     * @param userId Optional. If present, the ID of the user to retrieve the token status for.
     *      Otherwise, the ID of the user who sent the current activity is used.
     * @param includeFilter Optional. A comma-separated list of connection's to include. If present,
     *      the `includeFilter` parameter limits the tokens this method returns.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     * 
     * @returns The [TokenStatus](xref:botframework-connector.TokenStatus) objects retrieved.
     */
    public async getTokenStatus(context: TurnContext, userId?: string, includeFilter?: string): Promise<TokenStatus[]>;
    public async getTokenStatus(context: TurnContext, userId?: string, includeFilter?: string, oAuthAppCredentials?: AppCredentials): Promise<TokenStatus[]>;
    public async getTokenStatus(context: TurnContext, userId?: string, includeFilter?: string, oAuthAppCredentials?: AppCredentials): Promise<TokenStatus[]> {
        if (!userId && (!context.activity.from || !context.activity.from.id)) {
            throw new Error(`CustomWebAdapter.getTokenStatus(): missing from or from.id`);
        }
        userId = userId || context.activity.from.id;
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url, oAuthAppCredentials);
        context.turnState.set(this.TokenApiClientCredentialsKey, client);

        return (await client.userToken.getTokenStatus(userId, { channelId: context.activity.channelId, include: includeFilter }))._response.parsedBody;
    }

    /**
     * Asynchronously signs out the user from the token server.
     * 
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param resourceUrls The list of resource URLs to retrieve tokens for.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     * 
     * @returns A map of the [TokenResponse](xref:botframework-schema.TokenResponse) objects by resource URL.
     */
    public async getAadTokens(context: TurnContext, connectionName: string, resourceUrls: string[]): Promise<{ [propertyName: string]: TokenResponse }>;
    public async getAadTokens(context: TurnContext, connectionName: string, resourceUrls: string[], oAuthAppCredentials?: AppCredentials): Promise<{ [propertyName: string]: TokenResponse }>;
    public async getAadTokens(context: TurnContext, connectionName: string, resourceUrls: string[], oAuthAppCredentials?: AppCredentials): Promise<{ [propertyName: string]: TokenResponse }> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(`CustomWebAdapter.getAadTokens(): missing from or from.id`);
        }
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url, oAuthAppCredentials);
        context.turnState.set(this.TokenApiClientCredentialsKey, client);

        return (await client.userToken.getAadTokens(userId, connectionName, { resourceUrls: resourceUrls }, { channelId: context.activity.channelId }))._response.parsedBody as { [propertyName: string]: TokenResponse };
    }

    /**
     * Asynchronously Get the raw signin resource to be sent to the user for signin.
     * 
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param userId The user id that will be associated with the token.
     * @param finalRedirect The final URL that the OAuth flow will redirect to.
     * 
     * @returns The [BotSignInGetSignInResourceResponse](xref:botframework-connector.BotSignInGetSignInResourceResponse) object.
     */
    public async getSignInResource(context: TurnContext, connectionName: string, userId?: string, finalRedirect?: string, appCredentials?: AppCredentials): Promise<SignInUrlResponse> {
        if (!connectionName) {
            throw new Error('getUserToken() requires a connectionName but none was provided.');
        }

        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(`CustomWebAdapter.getSignInResource(): missing from or from.id`);
        }

        // what to do when userId is null (same for finalRedirect)
        if (userId && context.activity.from.id != userId) {
            throw new Error('CustomWebAdapter.getSiginInResource(): cannot get signin resource for a user that is different from the conversation');
        }

        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url, appCredentials);
        const conversation: Partial<ConversationReference> = TurnContext.getConversationReference(context.activity);

        const state: any = {
            ConnectionName: connectionName,
            Conversation: conversation,
            relatesTo: context.activity.relatesTo,
            MSAppId: (client.credentials as AppCredentials).appId
        };
        const finalState: string = Buffer.from(JSON.stringify(state)).toString('base64');
        const options: TokenApiModels.BotSignInGetSignInResourceOptionalParams = { finalRedirect: finalRedirect };

        return await (client.botSignIn.getSignInResource(finalState, options));
    }

    /**
     * Asynchronously Performs a token exchange operation such as for single sign-on.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param userId The user id that will be associated with the token.
     * @param tokenExchangeRequest The exchange request details, either a token to exchange or a uri to exchange.
     */
    public async exchangeToken(context: TurnContext, connectionName: string, userId: string, tokenExchangeRequest: TokenExchangeRequest, appCredentials?: AppCredentials): Promise<TokenResponse> {
        if (!connectionName) {
            throw new Error('exchangeToken() requires a connectionName but none was provided.');
        }

        if (!userId) {
            throw new Error('exchangeToken() requires an userId but none was provided.');
        }

        if (tokenExchangeRequest && !tokenExchangeRequest.token && !tokenExchangeRequest.uri) {
            throw new Error('CustomWebAdapter.exchangeToken(): Either a Token or Uri property is required on the TokenExchangeRequest');
        }

        const url: string = this.oauthApiUrl(context);
        const client: TokenApiClient = this.createTokenApiClient(url, appCredentials);

        return (await client.userToken.exchangeAsync(userId, connectionName, context.activity.channelId, tokenExchangeRequest))._response.parsedBody as TokenResponse;
    }

    /**
     * Creates an OAuth API client.
     * 
     * @param serviceUrl The client's service URL.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     * 
     * @remarks
     * Override this in a derived class to create a mock OAuth API client for unit testing.
     */
    protected createTokenApiClient(serviceUrl: string, oAuthAppCredentials: AppCredentials): TokenApiClient {
        const tokenApiClientCredentials = oAuthAppCredentials ? oAuthAppCredentials : this.credentials;
        const client = new TokenApiClient(tokenApiClientCredentials, { baseUri: serviceUrl, userAgent: USER_AGENT });

        return client;
    }

    /**
     * Gets the OAuth API endpoint.
     * 
     * @param contextOrServiceUrl The URL of the channel server to query or
     * a [TurnContext](xref:botbuilder-core.TurnContext). For a turn context, the context's
     * [activity](xref:botbuilder-core.TurnContext.activity).[serviceUrl](xref:botframework-schema.Activity.serviceUrl)
     * is used for the URL.
     * 
     * @remarks
     * Override this in a derived class to create a mock OAuth API endpoint for unit testing.
     */
    protected oauthApiUrl(contextOrServiceUrl: TurnContext | string): string {
        const isEmulatingOAuthCards = false;
        return isEmulatingOAuthCards ?
            (typeof contextOrServiceUrl === 'object' ? contextOrServiceUrl.activity.serviceUrl : contextOrServiceUrl) :
            (this.oAuthSettings.oAuthEndpoint ? this.oAuthSettings.oAuthEndpoint :
                JwtTokenValidation.isGovernment(this.oAuthSettings.channelService) ?
                    US_GOV_OAUTH_ENDPOINT : OAUTH_ENDPOINT);
    }

}