import { ActivityTypes, Middleware, TurnContext } from 'botbuilder';
import * as WebRequest from 'web-request';
/**
 * @module botbuildercommunity/middleware-spell-check
 */

function getUrl(text: string): string {
    return `https://api.cognitive.microsoft.com/bing/v7.0/spellcheck/?text=${ text }&mode=spell`;
}

async function getWebRequest(url: string, key: string): Promise<WebRequest.Response<string>> {
    return await WebRequest.get(url, {
        headers : {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Ocp-Apim-Subscription-Key' : key
        }
    });
}

export class SpellCheck implements Middleware {
    public text: string;
    public key: string;
    public constructor(key: string) {
        this.key = key;
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type === ActivityTypes.Message) {
            this.text = context.activity.text;
            const url: string = getUrl(this.text);
            try {
                const re: WebRequest.Response<string> = await getWebRequest(url, this.key);
                const obj: any = JSON.parse(re.content);
                if (obj.flaggedTokens && obj.flaggedTokens.length > 0) {
                    try {
                        if (obj.flaggedTokens[0].suggestions[0].suggestion) {
                            const suggestion: any = obj.flaggedTokens[0].suggestions[0].suggestion;
                            const token: any = obj.flaggedTokens[0].token;
                            context.turnState.set('token', token);
                            context.turnState.set('suggestion', suggestion);
                        }
                    } catch (error) {
                        throw new Error(error);
                    }
                }
            } catch (e) {
                throw new Error(`Failed to process spellcheck on ${ context.activity.text }. Error: ${ e }`);
            }
        }
        await next();
    }
}
