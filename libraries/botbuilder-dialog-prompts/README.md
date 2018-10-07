# Dialog Prompts

This is a (currently experimental) suite of dialog prompts that uses Microsoft's recognizer text suite to recognize certain types of input during a dialog prompt. Microsoft's Bot Framework team has implemented a handful of prompts using recognizers from the recognizer text suite. This library is meant to fill the gaps.

> Currently, this library and subsequent NPM are experimental. Please use at your own risk. Feel free to test, debug, and submit pull requests if you come across any issues.

## Installation

You can install this library via NPM:

    npm install @botbuildercommunity/dialog-prompts --save

## Number with Unit

The number with unit prompt allows you to prompt for four different unit types:

* Currency
* Temperature
* Age
* Dimension

```
dialogs.add(new NumberWithUnitPrompt("numberPrompt", NumberWithUnitPromptType.Currency);
```

It returns a `NumberWithUnitResult`. You can see the interface below.

    export interface NumberWithUnitResult
    {
        unit: string
        , value: any
    }

## Number with Type

Number with type allows you to accept numbers from the follow type enum:

* Ordinal
* Percentage

```
dialogs.add(new NumberWithTypePrompt("numberPrompt", NumberWithTypePrompt.Ordinal);
```

## Phone Number

The `PhoneNumberPrompt` will extract a phone number from a message from the user.

## Email Address

The `EmailPrompt` will extract an email address from a message from the user.

## Internet Protocols

The `InternetProtocolPrompt` will extract one of the following types based on which `InternetProtocolPromptType` enum value is passed in:

* IPAddress
* URL

## Social Media

The `SocialMediaPrompt` will extract one of the following types based on which `SocialMediaPromptType` enum value is passed in:

* Mention
* Hashtag

## GUID

The `GUIDPrompt` will extract a GUID from a message from the user.
