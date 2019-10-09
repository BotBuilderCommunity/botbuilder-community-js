//@ts-check

const assert = require("assert");
const rewire = require("rewire");
const mssqlstorage = rewire("../lib/mssqlStorage")

describe('MSSQL Storage tests', function() {
	this.timeout(5000);
	const mock = function(connection) {
		return {
			connect: function() {
				return {
					close: function() {
						return null;
					},
					request: function() {
						return {
							input: function(label, type, value) {
								return {
									query: function(query) {
										return null;
									}
								}
							},
							query: function(query) {
								return {
									recordset: [ ]
								};
							}
						};
					}
				}
			}
		};
	};
	mssqlstorage.__set__("getConnectionPool", mock)
	it('should read from storage', () => {
		const storage = new mssqlstorage.MSSQLStorage({ user: null, password: null, server: null, database: null });
		assert.doesNotThrow(async () => {
			await storage.read(['user']);
		}, 'Failed to read from storage.');
	});
	it('should write to storage', () => {
		const storage = new mssqlstorage.MSSQLStorage({ user: null, password: null, server: null, database: null });
		assert.doesNotThrow(async () => {
			await storage.write({ user: { conversation: true } });
		}, 'Failed to write to storage.');
	});
	it('should delete from storage', () => {
		const storage = new mssqlstorage.MSSQLStorage({ user: null, password: null, server: null, database: null });
		assert.doesNotThrow(async () => {
			await storage.delete(['user']);
		}, 'Failed to delete from storage.');
	});
});
