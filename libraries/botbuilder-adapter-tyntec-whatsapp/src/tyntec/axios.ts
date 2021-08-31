import { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { ITyntecWhatsAppMessageRequest } from "./messages";

export function composeTyntecRequestConfig(method: Method, url: string, apikey: string, accept: string, data?: {content: any, contentType: string}): AxiosRequestConfig {
	const config: AxiosRequestConfig = {
		method,
		url: new URL(url, "https://api.tyntec.com").toString(),
		headers: {
			accept,
			apikey
		},
	};
	if (data !== undefined) {
		config.data = data.content;
		config.headers["content-type"] = data.contentType;
	}
	return config;
}

export function composeTyntecSendWhatsAppMessageRequestConfig(apikey: string, data: ITyntecWhatsAppMessageRequest): AxiosRequestConfig {
	return composeTyntecRequestConfig(
		"post",
		"/conversations/v3/messages",
		apikey,
		"application/json",
		{
			contentType: "application/json",
			content: data
		}
	);
}

export function parseTyntecSendWhatsAppMessageResponse(response: AxiosResponse): string {
	if (response.status !== 202) {
		throw new Error(`Failed to send a WhatsApp message: ${response.status}: ${JSON.stringify(response.data)}`);
	}
	return response.data.messageId;
}
