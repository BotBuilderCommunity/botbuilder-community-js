var assert = require("assert");
var { ActivityTypes } = require("botbuilder");
var { TyntecWhatsAppAdapter } = require("../lib/index");

describe("TyntecWhatsAppAdapter", function() {
	describe("#composeTyntecWhatsAppMessageRequest", function() {
		it("should compose a template message request", function () {
			const adapter = new TyntecWhatsAppAdapter();
			const activity =  {
				type: ActivityTypes.Message,
				channelId: "whatsapp",
				from: { id: "+1233423454" },
				conversation: { id: "545345345" },
				channelData: {
					contentType: "template",
					template: {
						templateId: "template_id",
						templateLanguage: "en",
						components: {
							header: [
								{
									type: "image",
									image: {
										url: "https://example.com/image.png"
									}
								}
							],
							body: [
								{
									type: "text",
									text: "lorem"
								}
							]
						}
					}
				}
			};

			const messageRequest = adapter.composeTyntecWhatsAppMessageRequest(activity);

			assert.deepStrictEqual(messageRequest, {
				from: "+1233423454",
				to: "545345345",
				channel: "whatsapp",
				content: {
					contentType: "template",
					template: {
						templateId: "template_id",
						templateLanguage: "en",
						components: {
							header: [
								{
									type: "image",
									image: {
										url: "https://example.com/image.png"
									}
								}
							],
							body: [
								{
									type: "text",
									text: "lorem"
								}
							]
						}
					}
				}
			});
		});

		it("should throw an error when an activity is not supported", function () {
			const adapter = new TyntecWhatsAppAdapter();
			const activity = {
				channelData: {},
				channelId: "whatsapp",
				conversation: { id: "545345345" },
				from: { id: "+1233423454" },
				type: ActivityTypes.Typing
			};

			assert.throws(() =>
				adapter.composeTyntecWhatsAppMessageRequest(activity)
			)
		});
	});

	describe("#onTurnError", function() {
		it("should return undefined when no error handler is present", function() {
			const adapter = new TyntecWhatsAppAdapter();

			const actualHandler = adapter.onTurnError;

			assert.strictEqual(actualHandler, undefined);
		});

		it("should return the error handler when present", function() {
			const handler = async (context, error) => null;
			const adapter = new TyntecWhatsAppAdapter();
			adapter.onTurnError = handler;

			const actualHandler = adapter.onTurnError;

			assert.strictEqual(actualHandler, handler);
		});

		it("should set an error handler", function() {
			const handler = async (context, error) => null;
			const adapter = new TyntecWhatsAppAdapter();

			adapter.onTurnError = handler;

			assert.strictEqual(adapter.onTurnError, handler);
		});
	})
});
