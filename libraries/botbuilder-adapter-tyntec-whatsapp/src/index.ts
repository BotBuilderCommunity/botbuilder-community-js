import {Activity, ActivityTypes, BotAdapter, ChannelAccount, ConversationAccount, ConversationReference, ResourceResponse, TurnContext, WebRequest, WebResponse} from 'botbuilder';
import {AxiosInstance} from 'axios';
import {ITyntecAPIEvent, ITyntecMoMessage, ITyntecMoMessagePostback, ITyntecWhatsAppMessageRequest} from './tyntec/messages';
import {composeTyntecRequestConfig, composeTyntecSendWhatsAppMessageRequestConfig, parseTyntecSendWhatsAppMessageResponse} from './tyntec/axios';

export interface ITyntecWhatsAppAdapterSettings {
    axiosInstance: AxiosInstance;
    maxBodySize?: number;
    tyntecApikey: string;
}

export class TyntecWhatsAppAdapter extends BotAdapter {
    public axiosInstance: AxiosInstance;
    public maxBodySize = 1024;
    public tyntecApikey: string;

    public constructor(settings: ITyntecWhatsAppAdapterSettings) {
        super();

        this.axiosInstance = settings.axiosInstance;
        if (settings.maxBodySize !== undefined) {
            this.maxBodySize = settings.maxBodySize;
        }
        this.tyntecApikey = settings.tyntecApikey;
    }

    public continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promise<void>): Promise<void> {
        const activity: Partial<Activity> = TurnContext.applyConversationReference(
            { type: 'event', name: 'continueConversation' },
            reference,
            true
        );
        const context = new TurnContext(this as any, activity);
        return this.runMiddleware(context, logic);
    }

    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw Error('Operation deleteActivity not supported.');
    }

    public async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        try {
            const requestBody = await new Promise((resolve: (value: ITyntecMoMessage) => void, reject: (reason?: any) => void): void => {
                if (req.body !== undefined) {
                    return resolve(req.body);
                }

                let requestJson = '';
                req.on('data', (chunk: string): void => {
                    if (requestJson.length + chunk.length > this.maxBodySize) {
                        reject(new Error(`Request body too large: > ${ this.maxBodySize }`));
                    }

                    requestJson += chunk;
                });
                req.on('end', (): void => {
                    try {
                        resolve(JSON.parse(requestJson));
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            const activity = await this.parseTyntecWebhookRequest({body: requestBody, headers: req.headers, params: req.params, query: req.query});
            const context = new TurnContext(this as any, activity);
            await this.runMiddleware(context, logic);

            res.status(200);
            res.end();
        } catch (e) {
            res.status(500);
            res.send(`Failed to process request: ${ e }`);
            res.end();
        }
    }

    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = [];
        for (const activity of activities) {
            const tyntecRequest = this.composeTyntecWhatsAppMessageRequest(activity);
            const axiosRequest = composeTyntecSendWhatsAppMessageRequestConfig(this.tyntecApikey, tyntecRequest);
            axiosRequest.validateStatus = (): boolean => true;

            const axiosResponse = await this.axiosInstance.request(axiosRequest);

            const messageId = parseTyntecSendWhatsAppMessageResponse(axiosResponse);
            responses.push({id: messageId});
        }
        return responses;
    }

    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<ResourceResponse | void> {
        throw Error('Operation updateActivity not supported.');
    }

    protected composeTyntecWhatsAppMessageRequest(activity: Partial<Activity>): ITyntecWhatsAppMessageRequest {
        if (activity.type !== ActivityTypes.Message) {
            throw Error(`TyntecWhatsAppAdapter: Activity.type other than ${ ActivityTypes.Message } not supported: ${ activity.type }`);
        }
        if (activity.attachmentLayout !== undefined) {
            console.warn(`TyntecWhatsAppAdapter: Activity.attachmentLayout not supported: ${ activity.attachmentLayout }`);
        }
        if (activity.channelId !== 'whatsapp') {
            throw Error(`TyntecWhatsAppAdapter: Activity.channelId other than whatsapp not supported: ${ activity.channelId }`);
        }
        if (activity.conversation === undefined) {
            throw Error(`TyntecWhatsAppAdapter: Activity.conversation is required: ${ activity.conversation }`);
        }
        if (activity.deliveryMode !== undefined) {
            throw Error(`TyntecWhatsAppAdapter: Activity.deliveryMode not supported: ${ activity.deliveryMode }`);
        }
        if (activity.entities !== undefined) {
            console.warn(`TyntecWhatsAppAdapter: Activity.entities not supported: ${ activity.entities }`);
        }
        if (activity.expiration !== undefined) {
            console.warn(`TyntecWhatsAppAdapter: Activity.expiration not supported: ${ activity.expiration }`);
        }
        if (activity.from === undefined) {
            throw Error(`TyntecWhatsAppAdapter: Activity.from is required: ${ activity.from }`);
        }
        if (activity.id !== undefined) {
            console.warn(`TyntecWhatsAppAdapter: Activity.id not supported: ${ activity.id }`);
        }
        if (activity.importance !== undefined) {
            console.warn(`TyntecWhatsAppAdapter: Activity.importance not supported: ${ activity.importance }`);
        }
        if (activity.inputHint !== undefined) {
            throw Error(`TyntecWhatsAppAdapter: Activity.inputHint not supported: ${ activity.inputHint }`);
        }
        if (activity.listenFor !== undefined) {
            console.warn(`TyntecWhatsAppAdapter: Activity.listenFor not supported: ${ activity.listenFor }`);
        }
        if (activity.locale !== undefined) {
            console.warn(`TyntecWhatsAppAdapter: Activity.locale not supported: ${ activity.locale }`);
        }
        if (activity.replyToId !== undefined) {
            console.warn(`TyntecWhatsAppAdapter: Activity.replyToId not supported: ${ activity.replyToId }`);
        }
        if (activity.semanticAction !== undefined) {
            console.warn(`TyntecWhatsAppAdapter: Activity.semanticAction not supported: ${ activity.semanticAction }`);
        }
        if (activity.speak !== undefined) {
            throw Error(`TyntecWhatsAppAdapter: Activity.speak not supported: ${ activity.speak }`);
        }
        if (activity.suggestedActions !== undefined) {
            console.warn(`TyntecWhatsAppAdapter: Activity.suggestedActions not supported: ${ activity.suggestedActions }`);
        }
        if (activity.textFormat !== undefined) {
            throw Error(`TyntecWhatsAppAdapter: Activity.textFormat not supported: ${ activity.textFormat }`);
        }

        if (activity.channelData.contentType === 'text') {
            if (activity.attachments !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both text Activity.channelData.contentType and Activity.attachments not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.attachments) }`);
            }
            if (activity.channelData.contacts !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both text Activity.channelData.contentType and Activity.channelData.contacts not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.contacts) }`);
            }
            if (activity.channelData.interactive !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both text Activity.channelData.contentType and Activity.channelData.interactive not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.interactive) }`);
            }
            if (activity.channelData.location !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both text Activity.channelData.contentType and Activity.channelData.location not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.location) }`);
            }
            if (activity.channelData.template !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both text Activity.channelData.contentType and Activity.channelData.template not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.template) }`);
            }
            if (activity.text === undefined) {
                throw Error(`TyntecWhatsAppAdapter: text Activity.channelData.contentType requires Activity.text: ${ activity.text }`);
            }

            return {
                from: activity.from.id,
                to: activity.conversation.id,
                channel: 'whatsapp',
                content: {
                    contentType: 'text',
                    text: activity.text
                }
            };
        }
        if (activity.channelData.contentType === 'audio' || activity.channelData.contentType === 'document' || activity.channelData.contentType === 'image' || activity.channelData.contentType === 'sticker' || activity.channelData.contentType === 'video') {
            if (activity.attachments === undefined || activity.attachments.length !== 1) {
                throw Error(`TyntecWhatsAppAdapter: other than exactly one Activity.attachments not supported: ${ activity.attachments?.length }`);
            }
            if (activity.attachments[0].content !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: Activity.attachments.content not supported: ${ activity.attachments[0].content }`);
            }
            if (activity.attachments[0].contentUrl === undefined) {
                throw Error(`TyntecWhatsAppAdapter: Activity.attachments.contentUrl is required: ${ activity.attachments[0].contentUrl }`);
            }
            if (activity.attachments[0].thumbnailUrl !== undefined) {
                console.warn(`TyntecWhatsAppAdapter: Activity.attachments.thumbnailUrl not supported: ${ activity.attachments[0].thumbnailUrl }`);
            }
            if (activity.channelData.contacts !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both media Activity.channelData.contentType and Activity.channelData.contacts not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.contacts) }`);
            }
            if (activity.channelData.interactive !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both media Activity.channelData.contentType and Activity.channelData.interactive not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.interactive) }`);
            }
            if (activity.channelData.location !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both media Activity.channelData.contentType and Activity.channelData.location not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.location) }`);
            }
            if (activity.channelData.template !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both media Activity.channelData.contentType and Activity.channelData.template not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.template) }`);
            }

            if (activity.channelData.contentType === 'audio') {
                if (activity.text !== undefined) {
                    throw Error(`TyntecWhatsAppAdapter: both audio Activity.channelData.contentType and Activity.text not supported: ${ activity.channelData.contentType } and ${ activity.text }`);
                }

                return {
                    from: activity.from.id,
                    to: activity.conversation.id,
                    channel: 'whatsapp',
                    content: {
                        audio: {
                            url: activity.attachments[0].contentUrl
                        },
                        contentType: 'audio'
                    }
                };
            }
            if (activity.channelData.contentType === 'document') {
                return {
                    from: activity.from.id,
                    to: activity.conversation.id,
                    channel: 'whatsapp',
                    content: {
                        contentType: 'document',
                        document: {
                            caption: activity.text,
                            filename: activity.attachments[0].name,
                            url: activity.attachments[0].contentUrl
                        }
                    }
                };
            }
            if (activity.channelData.contentType === 'image') {
                return {
                    from: activity.from.id,
                    to: activity.conversation.id,
                    channel: 'whatsapp',
                    content: {
                        contentType: 'image',
                        image: {
                            caption: activity.text,
                            url: activity.attachments[0].contentUrl
                        }
                    }
                };
            }
            if (activity.channelData.contentType === 'sticker') {
                if (activity.text !== undefined) {
                    throw Error(`TyntecWhatsAppAdapter: both sticker Activity.channelData.contentType and Activity.text not supported: ${ activity.channelData.contentType } and ${ activity.text }`);
                }

                return {
                    from: activity.from.id,
                    to: activity.conversation.id,
                    channel: 'whatsapp',
                    content: {
                        contentType: 'sticker',
                        sticker: {
                            url: activity.attachments[0].contentUrl
                        }
                    }
                };
            }
            if (activity.channelData.contentType === 'video') {
                return {
                    from: activity.from.id,
                    to: activity.conversation.id,
                    channel: 'whatsapp',
                    content: {
                        contentType: 'video',
                        video: {
                            caption: activity.text,
                            url: activity.attachments[0].contentUrl
                        }
                    }
                };
            }
        }
        if (activity.channelData.contentType === 'contacts') {
            if (activity.attachments !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both contacts Activity.channelData.contentType and Activity.attachments not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.attachments) }`);
            }
            if (activity.channelData.contacts === undefined) {
                throw Error(`TyntecWhatsAppAdapter: contacts Activity.channelData.contentType requires Activity.channelData.contacts: ${ activity.channelData.contacts }`);
            }
            if (activity.channelData.interactive !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both contacts Activity.channelData.contentType and Activity.channelData.interactive not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.interactive) }`);
            }
            if (activity.channelData.location !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both contacts Activity.channelData.contentType and Activity.channelData.location not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.location) }`);
            }
            if (activity.channelData.template !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both contacts Activity.channelData.contentType and Activity.channelData.template not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.template) }`);
            }
            if (activity.text !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both contacts Activity.channelData.contentType and Activity.text not supported: ${ activity.channelData.contentType } and ${ activity.text }`);
            }

            return {
                from: activity.from.id,
                to: activity.conversation.id,
                channel: 'whatsapp',
                content: {
                    contentType: 'contacts',
                    contacts: activity.channelData.contacts
                }
            };
        }
        if (activity.channelData.contentType === 'interactive') {
            if (activity.attachments !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both interactive Activity.channelData.contentType and Activity.attachments not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.attachments) }`);
            }
            if (activity.channelData.contacts !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both interactive Activity.channelData.contentType and Activity.channelData.contacts not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.contacts) }`);
            }
            if (activity.channelData.interactive === undefined) {
                throw Error(`TyntecWhatsAppAdapter: interactive Activity.channelData.contentType requires Activity.channelData.interactive: ${ activity.channelData.interactive }`);
            }
            if (activity.channelData.location !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both interactive Activity.channelData.contentType and Activity.channelData.location not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.location) }`);
            }
            if (activity.channelData.template !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both interactive Activity.channelData.contentType and Activity.channelData.template not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.template) }`);
            }
            if (activity.text !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both interactive Activity.channelData.contentType and Activity.text not supported: ${ activity.channelData.contentType } and ${ activity.text }`);
            }

            return {
                from: activity.from.id,
                to: activity.conversation.id,
                channel: 'whatsapp',
                content: {
                    contentType: 'interactive',
                    interactive: activity.channelData.interactive
                }
            };
        }
        if (activity.channelData.contentType === 'location') {
            if (activity.attachments !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both location Activity.channelData.contentType and Activity.attachments not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.attachments) }`);
            }
            if (activity.channelData.contacts !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both location Activity.channelData.contentType and Activity.channelData.contacts not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.contacts) }`);
            }
            if (activity.channelData.interactive !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both location Activity.channelData.contentType and Activity.channelData.interactive not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.interactive) }`);
            }
            if (activity.channelData.location === undefined) {
                throw Error(`TyntecWhatsAppAdapter: location Activity.channelData.contentType requires Activity.channelData.location: ${ activity.channelData.location }`);
            }
            if (activity.channelData.template !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both location Activity.channelData.contentType and Activity.channelData.template not supported: ${ activity.channelData.contentType } and ${ JSON.stringify(activity.channelData.template) }`);
            }
            if (activity.text !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both location Activity.channelData.contentType and Activity.text not supported: ${ activity.channelData.contentType } and ${ activity.text }`);
            }

            return {
                from: activity.from.id,
                to: activity.conversation.id,
                channel: 'whatsapp',
                content: {
                    contentType: 'location',
                    location: activity.channelData.location
                }
            };
        }
        if (activity.channelData.contentType === 'template') {
            if (activity.attachments !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both Activity.attachments and template Activity.channelData.contentType not supported: ${ JSON.stringify(activity.attachments) } and ${ activity.channelData.contentType }`);
            }
            if (activity.channelData.contacts !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both Activity.channelData.contacts and template Activity.channelData.contentType not supported: ${ JSON.stringify(activity.channelData.contacts) } and ${ activity.channelData.contentType }`);
            }
            if (activity.channelData.interactive !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both Activity.channelData.interactive and template Activity.channelData.contentType not supported: ${ JSON.stringify(activity.channelData.interactive) } and ${ activity.channelData.contentType }`);
            }
            if (activity.channelData.location !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both Activity.channelData.location and template Activity.channelData.contentType not supported: ${ JSON.stringify(activity.channelData.location) } and ${ activity.channelData.contentType }`);
            }
            if (activity.channelData.template === undefined) {
                throw Error(`TyntecWhatsAppAdapter: template Activity.channelData.contentType requires Activity.channelData.template: ${ activity.channelData.template }`);
            }
            if (activity.text !== undefined) {
                throw Error(`TyntecWhatsAppAdapter: both Activity.text and template Activity.channelData.contentType not supported: ${ activity.text } and ${ activity.channelData.contentType }`);
            }

            return {
                from: activity.from.id,
                to: activity.conversation.id,
                channel: 'whatsapp',
                content: {
                    contentType: 'template',
                    template: activity.channelData.template
                }
            };
        }
        throw Error(`TyntecWhatsAppAdapter: invalid input: ${ activity }`);
    }

    protected async parseTyntecWebhookRequest(req: {body: ITyntecAPIEvent; headers: any; params: any; query: any}): Promise<Partial<Activity>> {
        if (req.body.event === 'MoMessage') {
            return this.parseTyntecWebhookWhatsAppMoMessage(req.body as ITyntecMoMessage);
        }
        if (req.body.event === 'MoMessage::Postback') {
            return this.parseTyntecWebhookMoMessagePostback(req.body as ITyntecMoMessagePostback);
        }
        throw Error(`TyntecWhatsAppAdapter: ITyntecMoMessage.event other than MoMessage or MoMessage::Postback not supported: ${ req.body.event }`);
    }

    protected async parseTyntecWebhookWhatsAppMoMessage(message: ITyntecMoMessage): Promise<Partial<Activity>> {
        if (message.content.contentType === 'media' && (message.content.media.type !== 'audio' && message.content.media.type !== 'document' && message.content.media.type !== 'image' && message.content.media.type !== 'sticker' && message.content.media.type !== 'video' && message.content.media.type !== 'voice')) {
            throw Error(`TyntecWhatsAppAdapter: ITyntecMoMessage.content.media.type other than audio, document, image, sticker and video not supported: ${ message.content.media.type }`);
        }
        if (message.groupId !== undefined) {
            throw Error(`TyntecWhatsAppAdapter: ITyntecMoMessage.groupId not supported: ${ message.groupId }`);
        }
        if (message.to === undefined) {
            throw Error(`TyntecWhatsAppAdapter: ITyntecMoMessage.to is required: ${ message.to }`);
        }

        const recipient: Partial<ChannelAccount> = {
            id: message.to
        };
        const activity: Partial<Activity> = {
            ...this.parseTyntecWebhookAPIEvent(message),
            channelData: {},
            id: message.messageId,
            recipient: recipient as ChannelAccount,
            replyToId: message.context?.messageId,
            type: ActivityTypes.Message
        };
        if (message.whatsapp?.senderName) {
            const conversation = activity.conversation as Partial<ConversationAccount>;
            conversation.name = message.whatsapp?.senderName;

            const from = activity.from as Partial<ChannelAccount>;
            from.name = message.whatsapp?.senderName;
        }
        if (message.content.contentType === 'text') {
            activity.channelData.contentType = 'text';
            activity.text = message.content.text;
            return activity;
        }
        if (message.content.contentType === 'contacts') {
            activity.channelData.contentType = 'contacts';
            activity.channelData.contacts = message.content.contacts;
            return activity;
        }
        if (message.content.contentType === 'location') {
            activity.channelData.contentType = 'location';
            activity.channelData.location = message.content.location;
            return activity;
        }
        if (message.content.contentType === 'media') {
            const mediaRequest = composeTyntecRequestConfig('get', message.content.media.url, this.tyntecApikey, '*/*');
            mediaRequest.validateStatus = () => true;
            let mediaResponse;
            try{
                mediaResponse = await this.axiosInstance.request(mediaRequest);
            } catch (e) {
                throw new Error(`Failed to download media: ${ e.response.status }: ${ JSON.stringify(e.response.data) }`);
            }

            activity.attachments = [
                {
                    contentType: mediaResponse.headers['content-type'],
                    contentUrl: message.content.media.url
                }
            ];
            activity.channelData.contentType = message.content.media.type;
            activity.text = message.content.media.caption;
            return activity;
        }
        throw Error(`TyntecWhatsAppAdapter: invalid input: ${ JSON.stringify(message) }`);
    }

    protected async parseTyntecWebhookMoMessagePostback(message: ITyntecMoMessagePostback): Promise<Partial<Activity>> {
        if (message.groupId !== undefined) {
            throw Error(`TyntecWhatsAppAdapter: ITyntecMoMessage.groupId not supported: ${ message.groupId }`);
        }
        if (message.to === undefined) {
            throw Error(`TyntecWhatsAppAdapter: ITyntecMoMessage.to is required: ${ message.to }`);
        }

        const recipient: Partial<ChannelAccount> = {
            id: message.to
        };
        const activity: Partial<Activity> = {
            ...this.parseTyntecWebhookAPIEvent(message),
            channelData: {
                contentType: 'postback',
                postback: {
                    data: message.postback.data
                }
            },
            id: message.messageId,
            recipient: recipient as ChannelAccount,
            replyToId: message.context?.messageId,
            type: ActivityTypes.Message
        };
        if (message.whatsapp) {
            activity.channelData.postback.whatsapp = {
                description: message.whatsapp.description,
                text: message.whatsapp.text,
                title: message.whatsapp.title
            };
        }
        return activity;
    }

    protected parseTyntecWebhookAPIEvent(event: ITyntecAPIEvent): Partial<Activity> {
        const tyntecSendWhatsAppMessageRequestConfig = composeTyntecSendWhatsAppMessageRequestConfig(this.tyntecApikey, {from: 'example', to: 'example', channel: 'whatsapp', content: {contentType: 'text', text: 'example'}});

        const conversation: Partial<ConversationAccount> = {
            id: event.from,
            isGroup: false
        };
        const from: Partial<ChannelAccount> = {
            id: event.from
        };
        return {
            channelId: event.channel,
            conversation: conversation as ConversationAccount,
            from: from as ChannelAccount,
            serviceUrl: tyntecSendWhatsAppMessageRequestConfig.url,
            timestamp: event.timestamp !== undefined ? new Date(event.timestamp) : undefined
        };
    }
}
