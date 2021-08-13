import {Activity, ActivityTypes, BotAdapter, ChannelAccount, ConversationAccount, ConversationReference, ResourceResponse, TurnContext, WebRequest, WebResponse} from "botbuilder";
import {AxiosInstance} from "axios";
import {ITyntecMoMessage, ITyntecWhatsAppMessageRequest} from "./tyntec/messages";
import {composeTyntecSendWhatsAppMessageRequestConfig, parseTyntecSendWhatsAppMessageResponse} from "./tyntec/axios";

export interface ITyntecWhatsAppAdapterSettings {
	axiosInstance: AxiosInstance;
	maxBodySize?: number;
	tyntecApikey: string;
}

export class TyntecWhatsAppAdapter extends BotAdapter {
	public axiosInstance: AxiosInstance;
	public maxBodySize = 1024;
	public tyntecApikey: string;

	constructor(settings: ITyntecWhatsAppAdapterSettings) {
		super();

		this.axiosInstance = settings.axiosInstance;
		if (settings.maxBodySize !== undefined) {
			this.maxBodySize = settings.maxBodySize;
		}
		this.tyntecApikey = settings.tyntecApikey;
	}

	async continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promise<void>): Promise<void> {
        throw Error("Operation continueConversation not supported.");
    }

    async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw Error("Operation deleteActivity not supported.");
    }

    async processActivity(req: WebRequest, res: WebResponse, logic: (context: TurnContext) => Promise<any>): Promise<void> {
        throw Error("Operation processActivity not supported.");
    }

    async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
		const responses: ResourceResponse[] = [];
		for (const activity of activities) {
			const tyntecRequest = this.composeTyntecWhatsAppMessageRequest(activity);
			const axiosRequest = composeTyntecSendWhatsAppMessageRequestConfig(this.tyntecApikey, tyntecRequest);
			axiosRequest.validateStatus = () => true;

			const axiosResponse = await this.axiosInstance.request(axiosRequest);

			const messageId = parseTyntecSendWhatsAppMessageResponse(axiosResponse);
			responses.push({id: messageId});
		}
		return responses;
    }

    async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<ResourceResponse | void> {
        throw Error("Operation updateActivity not supported.");
    }

	protected composeTyntecWhatsAppMessageRequest(activity: Partial<Activity>): ITyntecWhatsAppMessageRequest {
		if (activity.type !== ActivityTypes.Message) {
			throw Error(`TyntecWhatsAppAdapter: Activity.type other than ${ActivityTypes.Message} not supported: ${activity.type}`);
		}
		if (activity.attachmentLayout !== undefined) {
			console.warn(`TyntecWhatsAppAdapter: Activity.attachmentLayout not supported: ${activity.attachmentLayout}`);
		}
		if (activity.attachments !== undefined) {
            throw Error(`TyntecWhatsAppAdapter: Activity.attachments not supported: ${activity.attachments}`);
        }
		if (activity.channelId !== "whatsapp") {
			throw Error(`TyntecWhatsAppAdapter: Activity.channelId other than whatsapp not supported: ${activity.channelId}`);
		}
		if (activity.conversation === undefined) {
			throw Error(`TyntecWhatsAppAdapter: Activity.conversation is required: ${activity.conversation}`);
		}
		if (activity.deliveryMode !== undefined) {
			throw Error(`TyntecWhatsAppAdapter: Activity.deliveryMode not supported: ${activity.deliveryMode}`);
		}
		if (activity.entities !== undefined) {
			console.warn(`TyntecWhatsAppAdapter: Activity.entities not supported: ${activity.entities}`);
		}
		if (activity.expiration !== undefined) {
			console.warn(`TyntecWhatsAppAdapter: Activity.expiration not supported: ${activity.expiration}`);
		}
		if (activity.from === undefined) {
			throw Error(`TyntecWhatsAppAdapter: Activity.from is required: ${activity.from}`);
		}
		if (activity.id !== undefined) {
			console.warn(`TyntecWhatsAppAdapter: Activity.id not supported: ${activity.id}`);
		}
		if (activity.importance !== undefined) {
			console.warn(`TyntecWhatsAppAdapter: Activity.importance not supported: ${activity.importance}`);
		}
		if (activity.inputHint !== undefined) {
			throw Error(`TyntecWhatsAppAdapter: Activity.inputHint not supported: ${activity.inputHint}`);
		}
		if (activity.listenFor !== undefined) {
			console.warn(`TyntecWhatsAppAdapter: Activity.listenFor not supported: ${activity.listenFor}`);
		}
		if (activity.locale !== undefined) {
			console.warn(`TyntecWhatsAppAdapter: Activity.locale not supported: ${activity.locale}`);
		}
		if (activity.replyToId !== undefined) {
			console.warn(`TyntecWhatsAppAdapter: Activity.replyToId not supported: ${activity.replyToId}`);
		}
		if (activity.semanticAction !== undefined) {
			console.warn(`TyntecWhatsAppAdapter: Activity.semanticAction not supported: ${activity.semanticAction}`);
		}
		if (activity.speak !== undefined) {
			throw Error(`TyntecWhatsAppAdapter: Activity.speak not supported: ${activity.speak}`);
		}
		if (activity.suggestedActions !== undefined) {
			console.warn(`TyntecWhatsAppAdapter: Activity.suggestedActions not supported: ${activity.suggestedActions}`);
		}
		if (activity.text !== undefined) {
			throw Error(`TyntecWhatsAppAdapter: Activity.text not supported: ${activity.text}`);
		}

		if (activity.textFormat !== undefined) {
			throw Error(`TyntecWhatsAppAdapter: Activity.textFormat not supported: ${activity.textFormat}`);
		}

		return {
			from: activity.from.id,
			to: activity.conversation.id,
			channel: "whatsapp",
			content: {
				contentType: "template",
				template: activity.channelData!.template
			}
		};
    }

	protected async parseTyntecWhatsAppMessageEvent(req: {body: ITyntecMoMessage, headers: any, params: any, query: any}): Promise<Partial<Activity>> {
		if (req.body.event !== "MoMessage") {
			throw Error(`TyntecWhatsAppAdapter: ITyntecMoMessage.event other than MoMessage not supported: ${req.body.event}`)
		}
		if (req.body.content.contentType !== "text") {
			throw Error(`TyntecWhatsAppAdapter: ITyntecMoMessage.content.contentType other than text not supported: ${req.body.content.contentType}`)
		}
		if (req.body.groupId !== undefined) {
			throw Error(`TyntecWhatsAppAdapter: ITyntecMoMessage.groupId not supported: ${req.body.groupId}`)
		}
		if (req.body.to === undefined) {
			throw Error(`TyntecWhatsAppAdapter: ITyntecMoMessage.to is required: ${req.body.to}`)
		}

		const tyntecSendWhatsAppMessageRequestConfig = composeTyntecSendWhatsAppMessageRequestConfig(this.tyntecApikey, {from: "example", to: "example", channel: "whatsapp", content: {contentType: "text", text: "example"}});

		const conversation: Partial<ConversationAccount> = {
			id: req.body.from,
			isGroup: false,
			name: req.body.whatsapp?.senderName
		};
		const from: Partial<ChannelAccount> = {
			id: req.body.from,
			name: req.body.whatsapp?.senderName
		};
		const recipient: Partial<ChannelAccount> = {
			id: req.body.to
		};
		const activity: Partial<Activity> = {
			channelData: {
				contentType: "text"
			},
			channelId: req.body.channel,
			conversation: conversation as ConversationAccount,
			from: from as ChannelAccount,
			id: req.body.messageId,
			recipient: recipient as ChannelAccount,
			replyToId: req.body.context?.messageId,
			serviceUrl: tyntecSendWhatsAppMessageRequestConfig.url,
			text: req.body.content.text,
			timestamp: req.body.timestamp !== undefined ? new Date(req.body.timestamp) : undefined,
			type: ActivityTypes.Message
		};

		return activity;
	}
}
