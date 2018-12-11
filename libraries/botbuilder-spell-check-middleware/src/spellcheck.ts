import { Middleware, TurnContext, ActivityTypes } from "botbuilder";
import * as WebRequest from 'web-request';
/**
 * @module botbuildercommunity/spellcheck
 */

export class SpellCheck implements Middleware {
    public text: string;
    public key: string;
    constructor(public serviceKey: string) {
        this.key = serviceKey;
    }
    public async onTurn(context: TurnContext, next: () => Promise<void>) {
        if(context.activity.type === ActivityTypes.Message) {
            this.text = context.activity.text;
            let url = "https://api.cognitive.microsoft.com/bing/v7.0/spellcheck/?text=" + this.text + "&mode=spell"
            try {
                var re = await WebRequest.get(url, {
                    headers : {
                        'Content-Type' : 'application/x-www-form-urlencoded',
                        'Ocp-Apim-Subscription-Key' : this.key,
                    }
                });
                let obj = JSON.parse(re.content);
                if(obj.flaggedTokens[0] == null){
                    console.log("No tokens/suggestions found........");
                } else {
                    try {
                        if(obj.flaggedTokens[0].suggestions[0].suggestion){
                            let suggestion = obj.flaggedTokens[0].suggestions[0].suggestion;
                            let token = obj.flaggedTokens[0].token;
                            console.log("Did you mean this: " + suggestion);
                            console.log("Token: " + token);
                            context.turnState.set("token", token);
                            context.turnState.set("suggestion", suggestion);
                        } else {
                            console.log("No suggestions found");
                        }
                    } catch (error) {
                        throw new Error(error);
                    }  
                }
                               
            }
            catch(e) {
                throw new Error(`Failed to process spellcheck on ${context.activity.text}. Error: ${e}`);
            }
        }
        await next();
        
    }

    
}