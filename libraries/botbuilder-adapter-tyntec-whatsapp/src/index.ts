import {Activity, ActivityTypes, BotAdapter, ConversationReference, ResourceResponse, TurnContext, WebRequest, WebResponse} from "botbuilder";
import {AxiosInstance} from "axios";
import {ITyntecWhatsAppMessageRequest} from "./tyntec/messages";

export interface ITyntecWhatsAppAdapterSettings {
	axiosInstance: AxiosInstance;
	tyntecApikey: string;
}

export class TyntecWhatsAppAdapter extends BotAdapter {
	public axiosInstance: AxiosInstance;
	public tyntecApikey: string;

	constructor(settings: ITyntecWhatsAppAdapterSettings) {
		super();

		this.axiosInstance = settings.axiosInstance;
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
        throw Error("Operation sendActivities not supported.");
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
}
