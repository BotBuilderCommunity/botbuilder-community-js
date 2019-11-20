// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, CardFactory } from 'botbuilder';
import * as ACData from "adaptivecards-templating";
import * as AdaptiveCards from "adaptivecards";

export class MyBot extends ActivityHandler {
    constructor() {
        super();

        var templatePayload = {
            "type": "AdaptiveCard",
            "body": [
                {
                    "type": "Container",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "This example uses [Adaptive Card Templating](https://docs.microsoft.com/en-us/adaptive-cards/templating/) *(Preview)*",
                            "size": "Medium",
                            "wrap": true
                        },
                        {
                            "type": "TextBlock",
                            "text": "Check out the Adaptive Card Templating SDK for more info [templating SDKs](https://docs.microsoft.com/en-us/adaptive-cards/templating/sdk).",
                            "wrap": true
                        }
                    ],
                    "style": "good",
                    "bleed": true
                },
                {
                    "type": "ColumnSet",
                    "columns": [
                        {
                            "type": "Column",
                            "items": [
                                {
                                "type": "TextBlock",
                                "weight": "Default",
                                "text": "This is what I bound to the card:",
                                "wrap": true
                                },
                                {
                                    "type": "TextBlock",
                                    "weight": "Default",
                                    "text": "Hi **{name}**",
                                    "wrap": true
                                }
                            ],
                            "width": "stretch"
                        }
                    ]
                }
            ],
            "actions": [
                {
                    "type": "Action.OpenUrl",
                    "title": "View More",
                    "url": "https://bisser.io"
                }
            ],
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "version": "1.0"
        };

        var template = new ACData.Template(templatePayload);

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(`Now rendering the Adaptive Card with your name bound to it: '${ context.activity.text }'`);
            
            var ACcontext = new ACData.EvaluationContext();
            ACcontext.$root = {
                "name": context.activity.text
            };
            var card = template.expand(ACcontext);
            var adaptiveCard = new AdaptiveCards.AdaptiveCard();
            adaptiveCard.parse(card);
            const databindingCard = CardFactory.adaptiveCard(adaptiveCard);
            await context.sendActivity({ attachments: [databindingCard] });

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(`Hello and welcome to the Adaptive Card Data Binding sample. Let's get started!`);
                    await context.sendActivity('What is your name?');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}
