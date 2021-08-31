export interface ITyntecQuickReplyButtonComponent {
	type: "quick_reply";
	index: number;
	payload: string;
}

export interface ITyntecUrlButtonComponent {
	type: "url";
	index: number;
	text: string;
}

export interface ITyntecWhatsAppLocation {
	address?: string;
	latitude: number;
	longitude: number;
	name?: string;
}

export interface ITyntecWhatsAppMessageRequest {
	from: string;
	to: string;
	channel: "whatsapp";
	content: ITyntecWhatsAppTemplateContent;
}

export interface ITyntecWhatsAppTemplate {
	templateId: string;
	templateLanguage: string;
	components: ITyntecWhatsAppTemplateComponents;
}

export interface ITyntecWhatsAppTemplateComponents {
	body: ITyntecWhatsAppTemplateTextBodyComponent[];
	button?: ITyntecQuickReplyButtonComponent[] | ITyntecUrlButtonComponent[];
	header?: ITyntecWhatsAppTemplateDocumentHeaderComponent | ITyntecWhatsAppTemplateImageHeaderComponent | ITyntecWhatsAppTemplateLocationHeaderComponent | ITyntecWhatsAppTemplateTextHeaderComponent | ITyntecWhatsAppTemplateVideoHeaderComponent;
}

export interface ITyntecWhatsAppTemplateContent {
	contentType: "template";
	template: ITyntecWhatsAppTemplate;
}

export interface ITyntecWhatsAppTemplateDocumentHeader extends ITyntecWhatsAppTemplateMediaHeader {
	filename?: string;
}

export interface ITyntecWhatsAppTemplateDocumentHeaderComponent {
	type: "document";
	document: ITyntecWhatsAppTemplateDocumentHeader;
	example?: ITyntecWhatsAppTemplateMediaHeaderComponentExample;
}

export interface ITyntecWhatsAppTemplateImageHeaderComponent {
	type: "image";
	image: ITyntecWhatsAppTemplateMediaHeader;
	example?: ITyntecWhatsAppTemplateMediaHeaderComponentExample;
}

export interface ITyntecWhatsAppTemplateLocationHeaderComponent {
	type: "document";
	document: ITyntecWhatsAppLocation;
}

export interface ITyntecWhatsAppTemplateMediaHeaderComponentExample {
	url: string;
	fileHandle: string;
}

export interface ITyntecWhatsAppTemplateMediaHeader {
	mediaId?: string;
	url?: string;
}

export interface ITyntecWhatsAppTemplateTextBodyComponent {
	type: "text";
	text: string;
	example?: ITyntecWhatsAppTemplateTextBodyComponentExample;
}

export interface ITyntecWhatsAppTemplateTextBodyComponentExample {
	texts: string[];
}

export interface ITyntecWhatsAppTemplateTextHeaderComponent {
	type: "text";
	text: string;
	example?: ITyntecWhatsAppTemplateTextHeaderComponentExample;
}

export interface ITyntecWhatsAppTemplateTextHeaderComponentExample {
	text: string;
}

export interface ITyntecWhatsAppTemplateVideoHeaderComponent {
	type: "video";
	video: ITyntecWhatsAppTemplateMediaHeader;
	example?: ITyntecWhatsAppTemplateMediaHeaderComponentExample;
}
