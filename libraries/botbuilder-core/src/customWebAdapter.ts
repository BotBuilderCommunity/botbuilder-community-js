import { BotAdapter, WebRequest, BotFrameworkAdapterSettings, IUserTokenProvider, TokenResponse, TurnContext, ConversationReference } from 'botbuilder';
import { parse as parseQueryString } from 'qs';

import {
    AppCredentials,
    JwtTokenValidation,
    MicrosoftAppCredentials,
    SimpleCredentialProvider,
    TokenApiClient,
    TokenApiModels
} from 'botframework-connector';

const OAUTH_ENDPOINT = 'https://api.botframework.com';
const US_GOV_OAUTH_ENDPOINT = 'https://api.botframework.azure.us';
const USER_AGENT = 'Microsoft-BotFramework/3.1 BotBuilder/CustomWebAdapter';

/**
 * Adds helper functions to the default BotAdapter
 */
export abstract class CustomWebAdapter extends BotAdapter implements IUserTokenProvider {

    // OAuth Properties
    protected readonly oAuthSettings: BotFrameworkAdapterSettings;
    protected readonly credentials: AppCredentials;
    protected readonly credentialsProvider: SimpleCredentialProvider;

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
                        if (contentType.includes('application/x-www-form-urlencoded')) {
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
     * Copied from `CustomWebAdapter.ts` to support { type: 'delay' } activity.
     * @param timeout timeout in milliseconds
     * @default 1000
     */
    protected delay(timeout: number): Promise<void> {
        timeout = (typeof timeout === 'number' ? timeout : 1000);

        return new Promise((resolve): void => {
            setTimeout(resolve, timeout);
        });
    }

    /**
     * Asynchronously attempts to retrieve the token for a user that's in a login flow.
     *
     * @param context The context object for the turn.
     * @param connectionName The name of the auth connection to use.
     * @param magicCode Optional. The validation code the user entered.
     *
     * @returns A [TokenResponse](xref:botframework-schema.TokenResponse) object that contains the user token.
     */
    public async getUserToken(
        context: TurnContext,
        connectionName: string,
        magicCode?: string
    ): Promise<TokenResponse> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(
                `CustomWebAdapter.getUserToken(): missing from or from.id`
            );
        }
        if (!connectionName) {
            throw new Error(
                'getUserToken() requires a connectionName but none was provided.'
            );
        }
        // this.checkEmulatingOAuthCards(context);
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl();
        const client: TokenApiClient = this.createTokenApiClient(url);

        const result: TokenApiModels.UserTokenGetTokenResponse = await client.userToken.getToken(
            userId,
            connectionName,
            { code: magicCode, channelId: context.activity.channelId }
        );
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
     */
    public async signOutUser(
        context: TurnContext,
        connectionName: string,
        userId?: string
    ): Promise<void> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(
                `CustomWebAdapter.signOutUser(): missing from or from.id`
            );
        }
        if (!userId) {
            userId = context.activity.from.id;
        }

        const url: string = this.oauthApiUrl();
        const client: TokenApiClient = this.createTokenApiClient(url);
        await client.userToken.signOut(userId, {
            connectionName: connectionName,
            channelId: context.activity.channelId
        });
    }

    public async getSignInLink(
        context: TurnContext,
        connectionName: string
    ): Promise<string> {
        const conversation: Partial<ConversationReference> = TurnContext.getConversationReference(
            context.activity
        );
        const url: string = this.oauthApiUrl();
        const client: TokenApiClient = this.createTokenApiClient(url);
        const state: any = {
            ConnectionName: connectionName,
            Conversation: conversation,
            MsAppId: (client.credentials as AppCredentials).appId
        };

        const finalState: string = Buffer.from(JSON.stringify(state)).toString(
            'base64'
        );

        return (
            await client.botSignIn.getSignInUrl(finalState, {
                channelId: context.activity.channelId
            })
        )._response.bodyAsText;
    }

    /**
     * Asynchronously gets Aad tokens
     *
     * @param context The context object for the turn.
     * @param userId Optional. If present, the ID of the user to retrieve the token status for.
     *      Otherwise, the ID of the user who sent the current activity is used.
     * @param includeFilter Optional. A comma-separated list of connection's to include. If present,
     *      the `includeFilter` parameter limits the tokens this method returns.
     *
     * @returns The [TokenStatus](xref:botframework-connector.TokenStatus) objects retrieved.
     */
    public async getAadTokens(
        context: TurnContext,
        connectionName: string,
        resourceUrls: string[]
    ): Promise<{
            [propertyName: string]: TokenResponse;
        }> {
        if (!context.activity.from || !context.activity.from.id) {
            throw new Error(
                `CustomWebAdapter.getAadTokens(): missing from or from.id`
            );
        }
        const userId: string = context.activity.from.id;
        const url: string = this.oauthApiUrl();
        const client: TokenApiClient = this.createTokenApiClient(url);

        return (
            await client.userToken.getAadTokens(
                userId,
                connectionName,
                { resourceUrls: resourceUrls },
                { channelId: context.activity.channelId }
            )
        )._response.parsedBody as { [propertyName: string]: TokenResponse };
    }

    /**
     * Gets the OAuth API endpoint.
     *
     * @remarks
     * Override this in a derived class to create a mock OAuth API endpoint for unit testing.
     */
    protected oauthApiUrl(): string {
        return this.oAuthSettings.oAuthEndpoint
            ? this.oAuthSettings.oAuthEndpoint
            : JwtTokenValidation.isGovernment(
                this.oAuthSettings.channelService
                    ? this.oAuthSettings.channelService
                    : ''
            )
                ? US_GOV_OAUTH_ENDPOINT
                : OAUTH_ENDPOINT;
    }

    /**
     * Creates an OAuth API client.
     *
     * @param serviceUrl The client's service URL.
     *
     * @remarks
     * Override this in a derived class to create a mock OAuth API client for unit testing.
     */
    protected createTokenApiClient(serviceUrl: string): TokenApiClient {
        const client = new TokenApiClient(this.credentials, {
            baseUri: serviceUrl,
            userAgent: USER_AGENT
        });
        return client;
    }

}