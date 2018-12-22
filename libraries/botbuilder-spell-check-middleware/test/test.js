const { WebRequest } = require("web-request");

let key = "<yourKey>";


async function testSpellcheckConnection() {
    text = "Cognutive Services";
            let url = "https://api.cognitive.microsoft.com/bing/v7.0/spellcheck/?text=" + text + "&mode=spell"
            try {
                var re = await WebRequest.get(url, {
                    headers : {
                        'Content-Type' : 'application/x-www-form-urlencoded',
                        'Content-Length' : 30,
                        'Ocp-Apim-Subscription-Key' : key,
                    }
                });
                let obj = JSON.parse(re.content);
                if(obj.flaggedTokens[0].suggestions[0].suggestion){
                    let suggestion = obj.flaggedTokens[0].suggestions[0].suggestion;
                    let token = obj.flaggedTokens[0].token;
                    console.log("Did you mean this: " + suggestion);
                    console.log("Token: " + token);
                
                    context.turnState.set("token", token);
                    context.turnState.set("suggestion", suggestion);
                }               
            }
            catch(e) {
                throw new Error(`Failed to process spellcheck on ${text}. Error: ${e}`);
            }
}

testSpellcheckConnection();