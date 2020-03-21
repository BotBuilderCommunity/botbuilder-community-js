# Alexa Adapter (preview)

__Currently the Alexa Adapter is in beta.__

This is part of the [Bot Builder Community Extensions](https://github.com/BotBuilderCommunity/botbuilder-community-js) project which contains various pieces of middleware, recognizers and other components for use with the Bot Builder JavaScript SDK v4.

The Alexa Adapter allows you to add an additional endpoint to your bot for Alexa Skills. The Alexa endpoint can be used
in conjunction with other channels meaning, for example, you can have a bot exposed on out of the box channels such as Facebook and 
Teams, but also via an Alexa Skill (as well as side by side with the Twilio WhatsApp / Twitter Adapters also available from the Bot Builder Community Project).

Incoming Alexa Skill requests are transformed, by the adapter, into Bot Builder Activities and then when your bot responds, the adapter transforms the outgoing Activity into an Alexa Skill response.

The adapter currently supports the following scenarios;

* Support for voice based Alexa Skills
* Support for the available display directives for Echo Show / Spot devices
* Support for Alexa Cards
* Support for Audio / Video directives
* TurnContext extensions allowing the developer to;
    * Send Alexa Progressive Responses
    * Add to / access Alexa Session Attributes (similar to TurnState in Bot Builder SDK)
    * Check if a device supports audio or audio and display
* Full incoming request from Alexa is added to the incoming activity as ChannelData
* Validation of incoming Alexa requests (required for certification)

Currently **not** supported scenarios;
* Add proactive events to your skill ([documentation](https://developer.amazon.com/en-US/docs/alexa/smapi/proactive-events-api.html))
* Specify Alexa RePrompt speech / text
* Account Linking Management ([documentation](https://developer.amazon.com/en-US/docs/alexa/smapi/account-linking-operations.html))
* Directives other than display
* CanFulfillIntentRequest
* Alexa Reminders ([documentation](https://developer.amazon.com/en-US/docs/alexa/smapi/alexa-reminders-overview.html#how-to-add-reminders-to-your-skill))
* Add Personalization to Your Skils ([documentation](https://developer.amazon.com/en-US/docs/alexa/custom-skills/add-personalization-to-your-skill.html)) + ([documentation](Add Personalized Greetings or Prompts))
* Enhance Your Skill With Address Information ([documentation](https://developer.amazon.com/en-US/docs/alexa/custom-skills/device-address-api.html))
* Location Services for Alexa Skills ([documentation](https://developer.amazon.com/en-US/docs/alexa/custom-skills/location-services-for-alexa-skills.html))

## Installation

To install:

```bash
    npm install @botbuildercommunity/adapter-alexa --save
```

## Sample

Sample bot, showing examples of Alexa specific functionality using the current preview is available [here](../samples/botbuilder-adapter-alexa).

## Usage

* [Prerequisites](#prerequisites)
* [Create an Alexa skill](#create-an-alexa-skill)
* [Wiring up the Alexa adapter in your bot](#wiring-up-the-alexa-adapter-in-your-bot)
* [Complete configuration of your Alexa skill](#complete-configuration-of-your-alexa-skill)
* [Test your Alexa skill](#test-your-alexa-skill) - Test your bot in the Alexa skill simulator and Alexa devices
* [Customising your conversation](#customising-your-conversation) - Learn about controlling end of session and use of cards / display directives etc.

In this article you will learn how to connect a bot to an Alexa skill using the Alexa adapter.  This article will walk you through modifying the EchoBot sample to connect it to a skill.

### Prerequisites

* The [EchoBot sample code](https://github.com/microsoft/BotBuilder-Samples/tree/master/samples/javascript_nodejs/02.echo-bot)

* Access to the Alexa Developer Console with sufficient permissions to login to create / manage skills at  [https://developer.amazon.com/alexa/console/ask](https://developer.amazon.com/alexa/console/ask). If you do not have this you can create an account for free.

### Create an Alexa skill

1. Log into the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) and then click the 'Create Skill' button.

2. On the next screen enter a name for your new skill.  On this page you can **Choose a model to add to your skill** (**Custom** selected by default) and **Choose a method to host your skill's backend resources** (**Provision your own** selected by default).  Leave the default options selected and click the **Create Skill** button.

![Skill model and hosting](/libraries/botbuilder-adapter-alexa/media/bot-service-adapter-connect-alexa/create-skill-options.png?raw=true)

3. On the next screen you will be asked to **Choose a template**.  **Start from scratch** will be selected by default. Leave **Start from scratch** selected and click the **Choose** button.

![Skill template](/libraries/botbuilder-adapter-alexa/media/bot-service-adapter-connect-alexa/create-skill-options2.png?raw=true)

4. You will now be presented with your skill dashboard. Navigate to **JSON Editor** within the **Interaction Model** section of the left hand menu.

5. Paste the JSON below into the **JSON Editor**, replacing the following values;

* **YOUR SKILL INVOCATION NAME** - This is the name that users will use to invoke your skill on Alexa. For example, if your skill invocation name was 'adapter helper', then a user would could say "Alexa, launch adapter helper" to launch the skill.

* **EXAMPLE PHRASES** - You should provide 3 example phases that users could use to interact with your skill.  For example, if a user might say "Alexa, ask adapter helper to give me details of the alexa adapter", your example phrase would be "give me details of the alexa adapter".

```json
{
    "interactionModel": {
        "languageModel": {
            "invocationName": "<YOUR SKILL INVOCATION NAME>",
            "intents": [
                {
                    "name": "GetUserIntent",
                    "slots": [
                        {
                            "name": "phrase",
                            "type": "phrase"
                        }
                    ],
                    "samples": [
                        "{phrase}"
                    ]
                },
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.NavigateHomeIntent",
                    "samples": []
                }
            ],
            "types": [
                {
                    "name": "phrase",
                    "values": [
                        {
                            "name": {
                                "value": "<EXAMPLE PHRASE>"
                            }
                        },
                        {
                            "name": {
                                "value": "<EXAMPLE PHRASE>"
                            }
                        },
                        {
                            "name": {
                                "value": "<EXAMPLE PHRASE>"
                            }
                        }
                    ]
                }
            ]
        }
    }
}
```

6. Click the **Save Model** button and then click **Build Model**, which will update the configuration for your skill.

### Wiring up the Alexa adapter in your bot

Before you can complete the configuration of your Alexa skill, you need to wire up the Alexa adapter into your bot.

#### Install the Alexa adapter NPM package

```bash
npm install @botbuildercommunity/adapter-alexa@next --save
```

You will also need to add the following import statement to your index.js.

```javascript
const { AlexaAdapter, AlexaRequestToMessageEventActivitiesMiddleware } = require('@botbuildercommunity/adapter-alexa');
```

You can create the adapter in the same way as you usually create the Bot Framework Adapter.

```javascript
// Create Alexa Adapter
const alexaAdapter = new AlexaAdapter();

// Register Alexa specific middleware
alexaAdapter.use(new AlexaRequestToMessageEventActivitiesMiddleware({ intentSlotName: 'phrase' }));

// Catch errors
alexaAdapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${error}`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
};

// Create the main dialog.
const bot = new EchoBot();
```

#### Create a new endpoint for handling Alexa requests

You now need to create a new endpoint which will handle requests from your Alexa skill, on a new endpoint 'api/alexa/messages' instead of the default 'api/messages' used for requests from Azure Bot Service Channels. By adding an additional endpoint to your bot, you can accept requests from Bot Service channels (or additional adapters), as well as from Alexa, using the same bot.

```javascript
// Listen for incoming request from Alexa
server.post('/api/alexa/messages', (req, res) => {
    alexaAdapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await bot.run(context);
    });
});

// OPTIONAL: you could also combine it with the original Bot Framework adapter
// Listen for incoming requests from Azure Bot Service
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await bot.run(context);
    });
});
```

### Complete configuration of your Alexa skill

Now that you have created an Alexa skill and wired up the adapter in your bot project, the final steps are to configure the endpoint to which requests will be posted to when your Alexa skill is invoked, pointing it to the correct endpoint on your bot.

1. To complete this step, [deploy your bot to Azure](https://aka.ms/bot-builder-deploy-az-cli) and make a note of the URL to your deployed bot. Your Alexa messaging endpoint is the URL for your bot, which will be the URL of your deployed application (or ngrok endpoint), plus '/api/alexa/messages' (for example, `https://yourbotapp.azurewebsites.net/api/alexa/messages`).

> [!NOTE]
> If you are not ready to deploy your bot to Azure, or wish to debug your bot when using the Alexa adapter, you can use a tool such as [ngrok](https://www.ngrok.com) (which you will likely already have installed if you have used the Bot Framework emulator previously) to tunnel through to your bot running locally and provide you with a publicly accessible URL for this. 
> 
> If you wish create an ngrok tunnel and obtain a URL to your bot, use the following command in a terminal window (this assumes your local bot is running on port 3978, alter the port numbers in the command if your bot is not).
> 
> ```
> ngrok.exe http 3978 -host-header="localhost:3978"
> ```

2. Back within your Alexa skill dashboard, navigate to the **Endpoint** section on the left hand menu.  Select **HTTPS** as the **Service Endpoint Type** and set the **Default Region** endpoint to your bot's Alexa endpoint, such as https://yourbotapp.azurewebsites.net/api/alexa.

3. In the drop down underneath the text box where you have defined your endpoint, you need to select the type of certificate being used.  For development purposes, you can choose **My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority**, changing this to **My development endpoint has a certificate from a trusted certificate authority** when you publish your skill into Production.

![Skill template](/libraries/botbuilder-adapter-alexa/media/bot-service-adapter-connect-alexa/alexa-endpoint.png?raw=true)

4. Click the **Save Endpoints** button.

### Test your Alexa skill

You can now test interacting with your Alexa skill using the simulator. 

1. In the skill dashboard navigate to the **Test** tab at the top of the page.

2. You will see a label **Test is disabled for this skill** with a dropdown list next to it with a value of **Off**. Select this dropdown and select **Development**. This will enable testing for your skill.

3. As a basic test enter "ask <SKILL INVOCATION NAME> hello world" into the simulator input box. For example, if your skill invocation name was 'alexa helper', you would type 'ask alexa helper hello world'. This should return an echo of your message.

![Simulator](/libraries/botbuilder-adapter-alexa/media/bot-service-adapter-connect-alexa/simulator.png?raw=true)

Now that you have enabled testing for your skill, you can also test your skill using a physical Echo device or the Alexa app, providing you are logged into the device / app with the same account used to login to the Alexa Developer Console (or an account that you have added as a beta tester for your skill within the console).

### Customising your conversation

#### Controlling the end of a session

By default, the Alexa adapter is configured to close the session following sending a response. You can explicitly indicate that Alexa should wait for the user to say something else, meaning Alexa should leave the microphone open and listen for further input, by sending an input hint of ***ExpectingInput*** on your outgoing activity.

```javascript
await context.sendActivity({
    text: 'Your message text',
    inputHint: InputHints.ExpectingInput
});
```

You can alter the default behavior to leave the session open and listen for further input by default by setting the ***shouldEndSessionByDefault*** setting on the ***AlexaAdapterSettings*** class when creating your adapter, as shown below.

```javascript
const alexaAdapter = new AlexaAdapter({
    shouldEndSessionByDefault: false
});
```

If you do set ***ShouldEndSessionByDefault*** to false, then you need to explicitly end the conversation when you are ready, by sending an input hint of ***IgnoringInput*** on your last outgoing activity.

```javascript
await context.sendActivity({
    text: 'Your message text',
    inputHint: InputHints.IgnoringInput
});
```

#### Handling multiple outgoing activities

By default, Alexa expects a single response to each request that is sent to your bot. However, it is not uncommon for a bot to send multiple activities back in response to a request. This can cause issues, especially if you are using Alexa alongside other channels or adapters.

To combat this issue the adapter will automatically concatenate multiple activities into a single activity, combining the Speak and Text properties of the activities.

```javascript
export class AlexaAdapterEx extends AlexaAdapter {

    public processOutgoingActivities(activities) {
        return activities[activities.length - 1];
    }
}
```

#### Sending an Alexa card as part of your response

You can include an Alexa card in your response, which is shown on devices that have a screen and / or in the activity feed in the Alexa app.  To do this you include an attachment on your outgoing activity.

```javascript
const { AlexaCardFactory } = require('@botbuildercommunity/adapter-alexa');

await context.sendActivity({
    text: `Ok, I included a simple card.`,
    attachments: [
        AlexaCardFactory.simpleCard('Simple Card Title', 'Simple Card Content')
    ]
});
```

#### Sending display directives for devices that support screens

You can send Alexa display directives, which will show structured information on devices with a screen, such as the Echo Show or Echo Spot. If you wish to send display directives, you need to enable the **Display Interface** setting within the **Interfaces** section within the Alexa Skills Console.

To send a display directive, you send a ***DirectiveAttachment*** on your outgoing activity. On the attachment you set the template that you would like to use and populate the required fields.

You can find information about the various display templates available and their required properties at [https://developer.amazon.com/en-US/docs/alexa/custom-skills/display-template-reference.html](https://developer.amazon.com/en-US/docs/alexa/custom-skills/display-template-reference.html).

```javascript
await context.sendActivity({
    text: `Ok, I included a display directive`,
    attachments: [
        {
            type:'BodyTemplate1',
            token: 'string',
            backButton: 'VISIBLE', // or 'HIDDEN'
            backgroundImage: '',
            title: 'string',
            textContent: ''
        }
    ]
});
```

#### Send the User a Progressive Response

Your skill can send progressive responses to keep the user engaged while your skill prepares a full response to the user's request. A progressive response is interstitial SSML content (including text-to-speech and short audio) that Alexa plays while waiting for your full skill response. [Read more about when to send progressive responses](https://developer.amazon.com/en-US/docs/alexa/custom-skills/send-the-user-a-progressive-response.html#when-to-send-progressive-responses).

```javascript
const { AlexaContextExtensions } = require('@botbuildercommunity/adapter-alexa');

await AlexaContextExtensions.sendProgressiveResponse(context, 'OK, please wait while I look up details for your ride…'));
```
