import { ActivityTypes, Middleware, TurnContext } from 'botbuilder';
import * as WebRequest from 'web-request';
/**
 * @module botbuildercommunity/middleware-spell-check
 */

function getUrl(text: string): string {
    return `https://api.bing.microsoft.com/v7.0/spellcheck/?text=${ text }&mode=spell`;
}

async function getWebRequest(url: string, key: string): Promise<WebRequest.Response<string>> {
    return await WebRequest.get(url, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Ocp-Apim-Subscription-Key': key
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
                    let tokens: string[];
                    let suggestions: string[];

                    for (let i = 0; i < obj.flaggedTokens.length; i++) {
                        try {
                            if (obj.flaggedTokens[i].suggestions[0].suggestion) {
                                const suggestion: any = obj.flaggedTokens[0].suggestions[0].suggestion;
                                const token: any = obj.flaggedTokens[0].token;
                                tokens.push(token);
                                suggestions.push(suggestion);
                            }
                        } catch (error) {
                            throw new Error(error);
                        }
                    }

                    context.turnState.set('tokens', tokens);
                    context.turnState.set('suggestions', suggestions);
                }
            } catch (e) {
                throw new Error(`Failed to process spellcheck on ${ context.activity.text }. Error: ${ e }`);
            }
        }
        await next();
    }

    public static transform(context: TurnContext): string {
        let destText = context.activity.text;

        if (!context.turnState.get('suggestions')) {
            return destText;
        }

        const suggestionsLength = context.turnState.get('suggestions').length;

        if (suggestionsLength <= 0) {
            return context.activity.text;
        }

        for (let i = 0; i < suggestionsLength; i++) {
            destText = destText.replace(
                context.turnState.get('tokens')[i],
                context.turnState.get('suggestions')[i],
            );
        }

        return destText;
    }
}
