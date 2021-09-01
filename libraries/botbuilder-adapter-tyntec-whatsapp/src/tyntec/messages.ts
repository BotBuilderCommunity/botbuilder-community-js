export interface ITyntecAddress {
    city?: string;
    country?: string;
    countryCode?: string;
    state?: string;
    street?: string;
    type?: string;
    zip?: string;
}

export interface ITyntecBaseMedia {
    url: string;
}

export interface ITyntecContact {
    addresses?: ITyntecAddress[];
    birthday?: string;
    emails?: ITyntecEmail[];
    ims?: ITyntecIMS[];
    name?: ITyntecName;
    org?: ITyntecOrganisation;
    phones?: ITyntecContactPhone[];
    urls?: ITyntecContactUrl[];
}

export interface ITyntecContactPhone {
    phone?: string;
    type?: string;
}

export interface ITyntecContactUrl {
    type?: string;
    url?: string;
}

export interface ITyntecEmail {
    email?: string;
    type?: string;
}

export interface ITyntecIMS {
    service?: string;
    userId?: string;
}

export interface ITyntecMediaMoContent {
    contentType: 'media';
    media: ITyntecMoMedia;
}

export interface ITyntecMoMedia {
    caption?: string;
    mediaId?: string;
    type: 'audio' | 'document' | 'image' | 'sticker' | 'video' | 'voice';
    url: string;
}

export interface ITyntecMoContext {
    isForwarded?: boolean;
    isFrequentlyForwarded?: boolean;
    messageId?: string;
}

export interface ITyntecMoMessage {
    channel: string;
    content: ITyntecMediaMoContent | ITyntecTextMoContent | ITyntecWhatsAppContactsContent | ITyntecWhatsAppLocationContent;
    context?: ITyntecMoContext;
    event: 'MoMessage';
    from: string;
    groupId?: string;
    messageId: string;
    timestamp?: string;
    to?: string;
    whatsapp?: ITyntecWhatsapp;
}

export interface ITyntecName {
    firstName?: string;
    formattedName: string;
    lastName?: string;
    middleName?: string;
    prefix?: string;
    suffix?: string;
}

export interface ITyntecOrganisation {
    company?: string;
    department?: string;
    title?: string;
}

export interface ITyntecQuickReplyButtonComponent {
    type: 'quick_reply';
    index: number;
    payload: string;
}

export interface ITyntecTextMoContent {
    contentType: 'text';
    text: string;
}

export interface ITyntecUrlButtonComponent {
    type: 'url';
    index: number;
    text: string;
}

export interface ITyntecWhatsapp {
    senderName?: string;
}

export interface ITyntecWhatsAppAudioContent {
    contentType: 'audio';
    audio: ITyntecBaseMedia;
}

export interface ITyntecWhatsAppContactsContent {
    contentType: 'contacts';
    contacts: ITyntecContact[];
}

export interface ITyntecWhatsAppDocument extends ITyntecBaseMedia {
    caption?: string;
    filename?: string;
}

export interface ITyntecWhatsAppDocumentContent {
    contentType: 'document';
    document: ITyntecWhatsAppDocument;
}

export interface ITyntecWhatsAppImage extends ITyntecBaseMedia {
    caption?: string;
}

export interface ITyntecWhatsAppImageContent {
    contentType: 'image';
    image: ITyntecWhatsAppImage;
}

export interface ITyntecWhatsAppInteractiveButton {
    reply: {
        payload: string;
        title: string;
    };
    type: 'reply';
}

export interface ITyntecWhatsAppInteractiveButtonComponents {
    body: ITyntecWhatsAppInteractiveTextContent;
    buttons: ITyntecWhatsAppInteractiveButton[];
    footer?: ITyntecWhatsAppInteractiveFooterContent;
    header?: ITyntecWhatsAppTemplateDocumentHeaderComponent | ITyntecWhatsAppTemplateImageHeaderComponent | ITyntecWhatsAppTemplateTextHeaderComponent | ITyntecWhatsAppTemplateVideoHeaderComponent;
}

export interface ITyntecWhatsAppInteractiveButtonMessage {
    subType: 'buttons';
    components: ITyntecWhatsAppInteractiveButtonComponents;
}

export interface ITyntecWhatsAppInteractiveContent {
    contentType: 'interactive';
    interactive: ITyntecWhatsAppInteractiveButtonMessage | ITyntecWhatsAppInteractiveListMessage;
}

export interface ITyntecWhatsAppInteractiveFooterContent {
    type: 'text';
    text: string;
}

export interface ITyntecWhatsAppInteractiveListComponents {
    body: ITyntecWhatsAppInteractiveTextContent;
    footer?: ITyntecWhatsAppInteractiveFooterContent;
    header?: ITyntecWhatsAppTemplateTextHeaderComponent;
    list: ITyntecWhatsAppInteractiveListContent;
}

export interface ITyntecWhatsAppInteractiveListContent {
    title: string;
    sections: ITyntecWhatsAppListSection[];
}

export interface ITyntecWhatsAppInteractiveListMessage {
    subType: 'list';
    components: ITyntecWhatsAppInteractiveListComponents;
}

export interface ITyntecWhatsAppInteractiveTextContent {
    type: 'text';
    text: string;
    example?: ITyntecWhatsAppTemplateTextHeaderComponentExample;
}

export interface ITyntecWhatsAppListSection {
    title?: string;
    rows: ITyntecWhatsAppListSectionRow[];
}

export interface ITyntecWhatsAppListSectionRow {
    description?: string;
    payload: string;
    title: string;
}

export interface ITyntecWhatsAppLocation {
    address?: string;
    latitude: number;
    longitude: number;
    name?: string;
}

export interface ITyntecWhatsAppLocationContent {
    contentType: 'location';
    location: ITyntecWhatsAppLocation;
}

export interface ITyntecWhatsAppMessageRequest {
    from: string;
    to: string;
    channel: 'whatsapp';
    content: ITyntecWhatsAppAudioContent | ITyntecWhatsAppContactsContent | ITyntecWhatsAppDocumentContent | ITyntecWhatsAppImageContent | ITyntecWhatsAppInteractiveContent | ITyntecWhatsAppLocationContent | ITyntecWhatsAppStickerContent | ITyntecWhatsAppTemplateContent | ITyntecWhatsAppTextContent | ITyntecWhatsAppVideoContent;
}

export interface ITyntecWhatsAppStickerContent {
    contentType: 'sticker';
    sticker: ITyntecBaseMedia;
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
    contentType: 'template';
    template: ITyntecWhatsAppTemplate;
}

export interface ITyntecWhatsAppTemplateDocumentHeader extends ITyntecWhatsAppTemplateMediaHeader {
    filename?: string;
}

export interface ITyntecWhatsAppTemplateDocumentHeaderComponent {
    type: 'document';
    document: ITyntecWhatsAppTemplateDocumentHeader;
    example?: ITyntecWhatsAppTemplateMediaHeaderComponentExample;
}

export interface ITyntecWhatsAppTemplateImageHeaderComponent {
    type: 'image';
    image: ITyntecWhatsAppTemplateMediaHeader;
    example?: ITyntecWhatsAppTemplateMediaHeaderComponentExample;
}

export interface ITyntecWhatsAppTemplateLocationHeaderComponent {
    type: 'document';
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
    type: 'text';
    text: string;
    example?: ITyntecWhatsAppTemplateTextBodyComponentExample;
}

export interface ITyntecWhatsAppTemplateTextBodyComponentExample {
    texts: string[];
}

export interface ITyntecWhatsAppTemplateTextHeaderComponent {
    type: 'text';
    text: string;
    example?: ITyntecWhatsAppTemplateTextHeaderComponentExample;
}

export interface ITyntecWhatsAppTemplateTextHeaderComponentExample {
    text: string;
}

export interface ITyntecWhatsAppTemplateVideoHeaderComponent {
    type: 'video';
    video: ITyntecWhatsAppTemplateMediaHeader;
    example?: ITyntecWhatsAppTemplateMediaHeaderComponentExample;
}

export interface ITyntecWhatsAppTextContent {
    contentType: 'text';
    text: string;
}

export interface ITyntecWhatsAppVideo extends ITyntecBaseMedia {
    caption?: string;
}

export interface ITyntecWhatsAppVideoContent {
    contentType: 'video';
    video: ITyntecWhatsAppVideo;
}
