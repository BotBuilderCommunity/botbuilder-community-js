const assert = require('assert');
const AWSMock = require('aws-sdk-mock');
const sinon = require('sinon');
const { DynamoDBStorage } = require('../lib/dynamoDBStorage');

describe('DynamoDB storage tests', () => {

    const tableName = 'dummy-table-name';
    const region = 'eu-central-1';
    const credentialsOptions = {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        sessionToken: 'sessionToken'
    };

    let dynamoDBStorage;
    let updateConfigSpy;

    beforeEach(() => {
        dynamoDBStorage = new DynamoDBStorage(tableName, region, credentialsOptions);
    });

    afterEach(() => {
        AWSMock.restore('config', 'update');
    });


    describe('read()', () => {
        const readKeys = ['a', 'b', 'c'];

        let batchGetStub;

        beforeEach(() => {
            batchGetStub = sinon.stub();
            AWSMock.mock('DynamoDB.DocumentClient', 'batchGet', batchGetStub);
        });

        afterEach(() => {
            AWSMock.restore('DynamoDB.DocumentClient', 'batchGet');
        });

        it('should pass an appropriate query to aws-sdk', () => {
            dynamoDBStorage.read(readKeys);

            sinon.assert.calledOnce(batchGetStub);
            sinon.assert.calledWith(
                batchGetStub,
                {
                    RequestItems: { [tableName]: { Keys: [{ key: 'a'}, { key: 'b'}, { key: 'c'}] } }
                }
            );
        });

        it('should construct an appropriate response based on the aws-sdk response', async () => {
            const aVal = { key: 'a', document: { foo: 'a' }};
            const bVal = { key: 'b', document: { bar: 'b' } };
            const cVal = { key: 'c', document: { bob: 'c' } };

            batchGetStub.callsFake(function(params, callback) {
                callback(
                    null,
                    {
                        Responses: {
                            [tableName]: [aVal, bVal, cVal]
                        }
                    }
                );
            });

            const result = await dynamoDBStorage.read(readKeys);

            assert.deepEqual(result, { a: { foo: 'a'}, b: { bar: 'b'}, c: { bob: 'c'}});
        });
    });

    describe('write()', () => {
        const writeItems = { a: { foo: 'a'}, b: { bar: 'b', eTag: '*'}, c: { bob: 'c', eTag: 'some-etag'}};

        let putStub;
        let updateStub;

        beforeEach(() => {
            putStub = sinon.stub();
            updateStub = sinon.stub();
            AWSMock.mock('DynamoDB.DocumentClient', 'put', putStub);
            AWSMock.mock('DynamoDB.DocumentClient', 'update', updateStub);
        });

        afterEach(() => {
            AWSMock.restore('DynamoDB.DocumentClient', 'put');
            AWSMock.restore('DynamoDB.DocumentClient', 'update');
        });

        it('should pass an appropriate query and payload to aws-sdk', () => {
            dynamoDBStorage.write(writeItems);

            sinon.assert.calledOnce(putStub);
            sinon.assert.callCount(updateStub, 2);

            sinon.assert.calledWith(putStub, { TableName: tableName, Item: { key: 'some-etag', document: { bob: 'c', eTag: 'some-etag'} } });


            sinon.assert.calledWith(updateStub, {
                TableName: tableName,
                Key: { key: 'a' },
                UpdateExpression: 'set #document = :document',
                ExpressionAttributeNames: { '#document': 'document' },
                ExpressionAttributeValues: { ':document': { foo: 'a'} }
            });

            sinon.assert.calledWith(updateStub, {
                TableName: tableName,
                Key: { key: 'b' },
                UpdateExpression: 'set #document = :document',
                ExpressionAttributeNames: { '#document': 'document' },
                ExpressionAttributeValues: { ':document': { bar: 'b', eTag: '*'} }
            });
        });
    });

    describe('delete()', () => {
        const deleteKeys = ['a', 'b', 'c'];

        let batchWriteStub;

        beforeEach(() => {
            batchWriteStub = sinon.stub();
            AWSMock.mock('DynamoDB.DocumentClient', 'batchWrite', batchWriteStub);
        });

        afterEach(() => {
            AWSMock.restore('DynamoDB.DocumentClient', 'batchWrite');
        });

        it('should pass an appropriate query and payload to aws-sdk', () => {
            dynamoDBStorage.delete(deleteKeys);

            sinon.assert.calledOnce(batchWriteStub);
            sinon.assert.calledWith(
                batchWriteStub,
                {

                    RequestItems: {
                        [tableName]: [
                            {
                                DeleteRequest: { Key: { key: 'a'}}
                            },
                            {
                                DeleteRequest: { Key: { key: 'b'}}
                            },
                            {
                                DeleteRequest: { Key: { key: 'c'}}
                            }
                        ]
                    }
                }
            );
        });
    });
});
