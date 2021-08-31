import { AxiosRequestConfig, Method } from "axios";

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
