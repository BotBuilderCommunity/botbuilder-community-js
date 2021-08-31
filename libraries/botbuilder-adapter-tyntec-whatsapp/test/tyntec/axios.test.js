var assert = require("assert");
var { composeTyntecRequestConfig } = require("../../lib/tyntec/axios");

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
