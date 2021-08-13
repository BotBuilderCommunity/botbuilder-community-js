export interface ITyntecBaseMedia {
	url: string;
}

export interface ITyntecMediaMoContent {
	contentType: "media";
	media: ITyntecMoMedia;
}

export interface ITyntecMoMedia {
	caption?: string;
	mediaId?: string;
	type: "document" | "image" | "video";
	url: string;
}

export interface ITyntecMoContext {
	isForwarded?: boolean;
	isFrequentlyForwarded?: boolean;
	messageId?: string;
}

export interface ITyntecMoMessage {
	channel: string;
	content: ITyntecMediaMoContent | ITyntecTextMoContent;
	context?: ITyntecMoContext;
	event: "MoMessage";
	from: string;
	groupId?: string;
	messageId: string;
	timestamp?: string;
	to?: string;
	whatsapp?: ITyntecWhatsapp;
}

export interface ITyntecQuickReplyButtonComponent {
	type: "quick_reply";
	index: number;
	payload: string;
}

export interface ITyntecTextMoContent {
	contentType: "text";
	text: string;
}

export interface ITyntecUrlButtonComponent {
	type: "url";
	index: number;
	text: string;
}

export interface ITyntecWhatsapp {
	senderName?: string;
}

export interface ITyntecWhatsAppImage extends ITyntecBaseMedia {
	caption?: string;
}

export interface ITyntecWhatsAppImageContent {
	contentType: "image";
	image: ITyntecWhatsAppImage;
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
	content: ITyntecWhatsAppImageContent | ITyntecWhatsAppTemplateContent | ITyntecWhatsAppTextContent | ITyntecWhatsAppVideoContent;
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

export interface ITyntecWhatsAppTextContent {
	contentType: "text";
	text: string;
}

export interface ITyntecWhatsAppVideo extends ITyntecBaseMedia {
	caption?: string;
}

export interface ITyntecWhatsAppVideoContent {
	contentType: "video";
	video: ITyntecWhatsAppVideo;
}
