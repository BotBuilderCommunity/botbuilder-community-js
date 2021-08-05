var assert = require("assert");
var axios = require("axios");
var { ActivityTypes, TurnContext } = require("botbuilder");
var { TyntecWhatsAppAdapter } = require("../lib/index");

describe("TyntecWhatsAppAdapter", function() {
	describe("constructor", function() {
		it("should initialize #axiosInstance", function () {
			const axiosInstance = axios.create();
			const settings = {
				axiosInstance,
				tyntecApikey: "ABcdefGhI1jKLMNOPQRst2UVWx345yz6"
			};

			const adapter = new TyntecWhatsAppAdapter(settings);

			assert.strictEqual(adapter.axiosInstance, axiosInstance);
		});

		it("should initialize #tyntecApikey", function () {
			const settings = {
				tyntecApikey: "ABcdefGhI1jKLMNOPQRst2UVWx345yz6"
			};

			const adapter = new TyntecWhatsAppAdapter(settings);

			assert.strictEqual(adapter.tyntecApikey, "ABcdefGhI1jKLMNOPQRst2UVWx345yz6");
		});
	});

	describe("#composeTyntecWhatsAppMessageRequest", function() {
		it("should compose a template message request", function () {
			const adapter = new TyntecWhatsAppAdapter({
				axiosInstance: axios.create(),
				tyntecApikey: "ABcdefGhI1jKLMNOPQRst2UVWx345yz6"
			});
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
			const adapter = new TyntecWhatsAppAdapter({
				axiosInstance: axios.create(),
				tyntecApikey: "ABcdefGhI1jKLMNOPQRst2UVWx345yz6"
			});
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
			const adapter = new TyntecWhatsAppAdapter({
				axiosInstance: axios.create(),
				tyntecApikey: "ABcdefGhI1jKLMNOPQRst2UVWx345yz6"
			});

			const actualHandler = adapter.onTurnError;

			assert.strictEqual(actualHandler, undefined);
		});

		it("should return the error handler when present", function() {
			const handler = async (context, error) => null;
			const adapter = new TyntecWhatsAppAdapter({
				axiosInstance: axios.create(),
				tyntecApikey: "ABcdefGhI1jKLMNOPQRst2UVWx345yz6"
			});
			adapter.onTurnError = handler;

			const actualHandler = adapter.onTurnError;

			assert.strictEqual(actualHandler, handler);
		});

		it("should set an error handler", function() {
			const handler = async (context, error) => null;
			const adapter = new TyntecWhatsAppAdapter({
				axiosInstance: axios.create(),
				tyntecApikey: "ABcdefGhI1jKLMNOPQRst2UVWx345yz6"
			});

			adapter.onTurnError = handler;

			assert.strictEqual(adapter.onTurnError, handler);
		});
	})

	describe("#sendActivities", function () {
		it("should send the activities when they are supported", async function () {
			let axiosConfigs = [];
			const axiosInstance = {
				request: async (config) => {
					axiosConfigs.push(config);
					return {
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
						config,
						request: {}
					};
				}
			};
			const context = new TurnContext(
				new TyntecWhatsAppAdapter({
					axiosInstance,
					tyntecApikey: "ABcdefGhI1jKLMNOPQRst2UVWx345yz6"
				}),
				{
					channelData: { contentType: "text" },
					channelId: "whatsapp",
					conversation: { id: "+1233423454", isGroup: false },
					from: { id: "+1233423454" },
					id: "77185196-664a-43ec-b14a-fe97036c697e",
					recipient: { id: "545345345" },
					serviceUrl: "https://api.tyntec.com/conversations/v3/messages",
					text: "A simple text message",
					timestamp: new Date("2019-06-26T09:41:00.000Z"),
					type: "message"
				}
			);
			const activities = [
				{
					type: ActivityTypes.Message,
					channelId: "whatsapp",
					from: { id: "+1233423454" },
					conversation: { id: "545345345" },
					channelData: {
						contentType: "template",
						template: {
							templateId: "template_id",
							templateLanguage: "en",
							components: { body: [{ type: "text", text: "lorem" }] }
						}
					}
				},
				{
					type: ActivityTypes.Message,
					channelId: "whatsapp",
					from: { id: "+1233423454" },
					conversation: { id: "545345345" },
					channelData: {
						contentType: "template",
						template: {
							templateId: "template_id",
							templateLanguage: "en",
							components: { body: [{ type: "text", text: "ipsum" }] }
						}
					}
				},
			];

			const responses = await context.sendActivities(activities);

			for (axiosConfig of axiosConfigs) {
				delete axiosConfig.validateStatus;
			};
			assert.deepStrictEqual(axiosConfigs, [
				{
					method: "post",
					url: "https://api.tyntec.com/conversations/v3/messages",
					headers: {
						"apikey": "ABcdefGhI1jKLMNOPQRst2UVWx345yz6",
						"content-type": "application/json",
						"accept": "application/json"
					},
					data: {
						to: "+1233423454",
						from: "545345345",
						channel: "whatsapp",
						content: {
							contentType: "template",
							template: {
								templateId: "template_id",
								templateLanguage: "en",
								components: { body: [{ type: "text", text: "lorem" }] }
							}
						}
					}
				},
				{
					method: "post",
					url: "https://api.tyntec.com/conversations/v3/messages",
					headers: {
						"apikey": "ABcdefGhI1jKLMNOPQRst2UVWx345yz6",
						"content-type": "application/json",
						"accept": "application/json"
					},
					data: {
						to: '+1233423454',
						from: '545345345',
						channel: "whatsapp",
						content: {
							contentType: "template",
							template: {
								templateId: "template_id",
								templateLanguage: "en",
								components: { body: [{ type: "text", text: "ipsum" }] }
							}
						}
					}
				}
			]);
			assert.deepStrictEqual(responses, [
				{
					id: "77185196-664a-43ec-b14a-fe97036c697f"
				},
				{
					id: "77185196-664a-43ec-b14a-fe97036c697f"
				}
			]);
		});

		it("should throw an error when an activity is not supported", async function () {
			let axiosConfig = undefined;
			const axiosInstance = {
				request: async (config) => {
					axiosConfig = config;
				}
			};
			const context = new TurnContext(
				new TyntecWhatsAppAdapter({
					axiosInstance,
					tyntecApikey: "ABcdefGhI1jKLMNOPQRst2UVWx345yz6"
				}),
				{
					channelData: { contentType: "text" },
					channelId: "whatsapp",
					conversation: { id: "+1233423454", isGroup: false },
					from: { id: "+1233423454" },
					id: "77185196-664a-43ec-b14a-fe97036c697e",
					recipient: { id: "545345345" },
					serviceUrl: "https://api.tyntec.com/conversations/v3/messages",
					text: "A simple text message",
					timestamp: new Date("2019-06-26T09:41:00.000Z"),
					type: "message"
				}
			);
			const activity = {
				channelData: {},
				channelId: "whatsapp",
				conversation: { id: context.activity.from.id },
				from: { id: "545345345" },
				type: ActivityTypes.Typing
			};

			await assert.rejects(
				context.sendActivity(activity)
			)

			assert.strictEqual(axiosConfig, undefined);
		});

		it("should throw an error when an unsuccessful response is returned", async function () {
			const axiosInstance = {
				request: async (config) => {
					return {
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
						config,
						request: {}
					};
				}
			};
			const context = new TurnContext(
				new TyntecWhatsAppAdapter({
					axiosInstance,
					tyntecApikey: "ABcdefGhI1jKLMNOPQRst2UVWx345yz6"
				}),
				{
					channelData: { contentType: "text" },
					channelId: "whatsapp",
					conversation: { id: "+1233423454", isGroup: false },
					from: { id: "+1233423454" },
					id: "77185196-664a-43ec-b14a-fe97036c697e",
					recipient: { id: "545345345" },
					serviceUrl: "https://api.tyntec.com/conversations/v3/messages",
					text: "A simple text message",
					timestamp: new Date("2019-06-26T09:41:00.000Z"),
					type: "message"
				}
			);
			const activity = {
				channelData: { contentType: "text" },
				channelId: "whatsapp",
				conversation: { id: context.activity.from.id },
				from: { id: "545345345" },
				text: "A simple text message 1",
				type: ActivityTypes.Message
			};

			await assert.rejects(
				context.sendActivity(activity)
			)
		});
	});
});
