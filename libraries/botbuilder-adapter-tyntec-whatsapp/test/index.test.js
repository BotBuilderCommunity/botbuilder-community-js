var assert = require("assert");
var { TyntecWhatsAppAdapter } = require("../lib/index");

describe("TyntecWhatsAppAdapter", function() {
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
