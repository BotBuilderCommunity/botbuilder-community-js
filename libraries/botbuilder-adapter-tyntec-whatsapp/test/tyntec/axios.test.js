var assert = require("assert");
var { composeTyntecRequestConfig, composeTyntecSendWhatsAppMessageRequestConfig, parseTyntecSendWhatsAppMessageResponse } = require("../../lib/tyntec/axios");

describe("composeTyntecRequestConfig", function() {
	it("should return a request to tyntec API without data when no data is present", function() {
		const method = "get";
		const url = "/channels/whatsapp/accounts";
		const apikey = "ABcdefGhI1jKLMNOPQRst2UVWx345yz6";
		const accept = "*/*";

		const config = composeTyntecRequestConfig(method, url, apikey, accept);

		assert.strictEqual(config.method, "get");
		assert.strictEqual(config.url, "https://api.tyntec.com/channels/whatsapp/accounts");
		assert.strictEqual(config.headers["accept"], "*/*");
		assert.strictEqual(config.headers["apikey"], "ABcdefGhI1jKLMNOPQRst2UVWx345yz6");
		assert.strictEqual(config.headers["content-type"], undefined);
		assert.strictEqual(config.data, undefined);
	});

	it("should return a request to tyntec API with data when data is present", function() {
		const method = "get";
		const url = "/channels/whatsapp/accounts";
		const apikey = "ABcdefGhI1jKLMNOPQRst2UVWx345yz6";
		const accept = "*/*";
		const data = {
			content: {
				to: "+1233423454",
				from: "545345345",
				channel: "whatsapp",
				content: {
					contentType: "text",
					text: "A simple text message"
				}
			},
			contentType: "application/json"
		};

		const config = composeTyntecRequestConfig(method, url, apikey, accept, data);

		assert.strictEqual(config.method, "get");
		assert.strictEqual(config.url, "https://api.tyntec.com/channels/whatsapp/accounts");
		assert.strictEqual(config.headers["accept"], "*/*");
		assert.strictEqual(config.headers["apikey"], "ABcdefGhI1jKLMNOPQRst2UVWx345yz6");
		assert.strictEqual(config.headers["content-type"], "application/json");
		assert.deepStrictEqual(config.data, data.content);
	});

	it("should return an unchanged base URL when absolute URL is present", function() {
		const method = "get";
		const url = "https://example.com/channels/whatsapp/accounts";
		const apikey = "ABcdefGhI1jKLMNOPQRst2UVWx345yz6";
		const accept = "*/*";

		const config = composeTyntecRequestConfig(method, url, apikey, accept);

		assert.strictEqual(config.url, "https://example.com/channels/whatsapp/accounts");
	});
});

describe("composeTyntecSendWhatsAppMessageRequestConfig", function() {
	it("should return a request to send a WhatsApp message", function() {
		const apikey = "ABcdefGhI1jKLMNOPQRst2UVWx345yz6";
		const data = {
			to: "+1233423454",
			from: "545345345",
			channel: "whatsapp",
			content: {
				contentType: "text",
				text: "A simple text message"
			}
		};

		const config = composeTyntecSendWhatsAppMessageRequestConfig(apikey, data);

		assert.strictEqual(config.method, "post");
		assert.strictEqual(config.url, "https://api.tyntec.com/conversations/v3/messages");
		assert.strictEqual(config.headers["accept"], "application/json");
		assert.strictEqual(config.headers["apikey"], "ABcdefGhI1jKLMNOPQRst2UVWx345yz6");
		assert.strictEqual(config.headers["content-type"], "application/json");
		assert.deepStrictEqual(config.data, data);
	});
});

describe("parseTyntecSendWhatsAppMessageResponse", function() {
	it("should return the message ID when a successful response is present", function() {
		const response = {
			status: 202,
			statusText: "Accepted",
			headers: {
				"content-length": "94",
				"content-type": "application/json",
				"date": "Mon, 23 Aug 2021 08:35:10 GMT",
				"server": "nginx"
			},
			data: {
				"messageId": "77185196-664a-43ec-b14a-fe97036c697f",
				"timestamp": "2019-08-24T14:15:22.853817Z"
			},
			config: {
				url: "https://example.com/channels/whatsapp/accounts"
			},
			request: {}
		};

		const messageId = parseTyntecSendWhatsAppMessageResponse(response);

		assert.strictEqual(messageId, "77185196-664a-43ec-b14a-fe97036c697f");
	});

	it("should throw an error when an unsuccessful response is present", function() {
		const response = {
			status: 400,
			statusText: "Bad Request",
			headers: {
				"content-length": "129",
				"content-type": "application/json",
				"date": "Mon, 23 Aug 2021 08:35:10 GMT",
				"server": "nginx"
			},
			data: {
				"type": "https://docs.tyntec.com/problems",
				"title": "Missing parameters",
				"status": 400,
				"detail": "Mandatory parameter [to] missing"
			},
			config: {
				url: "https://example.com/channels/whatsapp/accounts"
			},
			request: {}
		};

		assert.throws(() =>
			parseTyntecSendWhatsAppMessageResponse(response)
		);
	});
});
