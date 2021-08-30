# whatsapp-echobot

Demonstrate the core capabilities of the tyntec WhatsApp adapter

This bot has been created using [Bot Framework](https://dev.botframework.com), it shows how to create a simple bot that accepts input from the user and echoes it back.

## Prerequisites

- [Node.js](https://nodejs.org) version 14.17 or higher

    ```bash
    # determine node version
    node --version
    ```

## To try this sample

- Install modules

    ```bash
    npm install
    ```
- Configure variables in `.env`,
  - where `TyntecApikey` is your [tyntec API key](https://www.tyntec.com/docs/faq-whatsapp-business-onboarding-how-can-i-get-api-key-setup-my-whatsapp-business-account)
    used to authenticate requests to the tyntec Conversations API
  - and `Waba` is your [WhatsApp Business Account number from tyntec](https://www.tyntec.com/docs/whatsapp-business-api-account-information-get-started#toc--set-up-your-whatsapp-business-account-waba-).
- Start the bot

    ```bash
    npm start
    ```
