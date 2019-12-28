# Alexa Adapter

Sample bot to integrate with Alexa.

## Prerequisites

- [Node.js](https://nodejs.org) version 10.14.1 or higher

    ```bash
    # determine node version
    node --version
    ```

## To run the bot

- Install modules

    ```bash
    $ npm install
    ```
- Start the bot

    ```bash
    $ npm start:backend
    ```

## Set up tunnel

Follow instructions for [Local Development](https://github.com/Xzya/alexa-typescript-starter#local-development). We suggest you use `ngrok`.

- Install `ngrok`
    ```bash
    npm install -g ngrok
    ```

- Start tunnel

    ```bash
    npm run start:tunnel
    ```

- Update `skill.json` with ngrok url

## To deploy Alexa Skill

The `ask-cli` must be installed globally to be executed within npm scripts.

- Install Ask CLI

    ```bash
    $ npm install -g ask-cli
    ```

    For windows, install additional tools:

    ```cmd
    > npm install -g windows-build-tools
    ```

- Deploy Alexa skill
    
    ```bash
    ask deploy
    ```