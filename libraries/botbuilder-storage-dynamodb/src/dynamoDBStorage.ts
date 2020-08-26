/**
 * @module @botbuildercommunity/storage-dynamodb
 */

import { config as awsConfig } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Storage, StoreItems } from 'botbuilder-core';

/**
 * Middleware that implements an DynamoDB based storage provider for a bot.
 *
 * @remarks
 * This example shows the typical creation and configuration pattern:
 *
 * ```JavaScript
 * import { DynamoDBStorage } from '@botbuildercommunity/storage-dynamodb';
 *
 * const dynamoDBStorage = new DynamoDBStorage('table-name', 'us-east-1');
 *
 * const conversationState = new ConversationState(dynamoDBStorage);
 * const userState = new UserState(dynamoDBStorage);
 * ```
*/
export class DynamoDBStorage implements Storage {
    private tableName: string;
    private region: string;

    /**
	 * Creates a new DynamoDBStorage instance.
	 * @param region the region the DynamoDB table lives in
	 * @param tableName the name of the table
	 */
    public constructor(tableName: string, region: string) {
        this.tableName = tableName;
        this.region = region;
    }

    public async read(keys: string[]): Promise<StoreItems> {
        const response = await this.getDynamoDBDocumentClient().batchGet({
            RequestItems: { [this.tableName]: { Keys: keys.map((k: string): { key: string } => ({ key: k })) } }
        }).promise();

        return response.Responses[this.tableName].reduce((acc, r): StoreItems => {
            if (!r) {
                return acc;
            }

            return { ...acc, [r.key]: r.document};
        }, {});
    }

    public async write(changes: StoreItems): Promise<void> {
        const client = this.getDynamoDBDocumentClient();

        await Promise.all(Object.keys(changes).map(async (key: string): Promise<void> => {
            const document = { ...changes[key] };
            const eTag = changes[key].eTag;

            if (!eTag || eTag === '*') {
                await client.update({
                    TableName: this.tableName,
                    Key: { key: key },
                    UpdateExpression: 'set #document = :document',
                    ExpressionAttributeNames: { '#document': 'document' },
                    ExpressionAttributeValues: { ':document': document }
                }).promise();
            } else if (eTag.length > 0) {
                await client.put({ TableName: this.tableName, Item: { key: eTag, document } }).promise();
            } else {
                throw new Error('eTag empty');
            }
        }));
    }

    public async delete(keys: string[]): Promise<void> {
        await this.getDynamoDBDocumentClient().batchWrite({
            RequestItems: {
                [this.tableName]: keys.map((k: string): { DeleteRequest: { Key: { key: string }}} => ({ DeleteRequest: { Key: { key: k } }}))
            }
        }).promise();
    }

    private getDynamoDBDocumentClient(): DocumentClient {
        awsConfig.update({region: this.region});
        return new DocumentClient({apiVersion: '2012-08-10'});
    }
}
