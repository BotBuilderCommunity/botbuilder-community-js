/**
 * @module @botbuildercommunity/storage-dynamodb
 */

import { config as awsConfig, Credentials as AWSCredentials, Endpoint as AWSEndpoint } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Storage, StoreItems } from 'botbuilder-core';

interface AWSCredentialsOptions {
    /**
     * AWS access key ID.
     */
    accessKeyId: string;
    /**
     * AWS secret access key.
     */
    secretAccessKey: string;
    /**
     * AWS session token.
     */
    sessionToken?: string;
}

interface DynamoDBStorageOptions {
    /**
     * The name of the table to connect to.
     */
    tableName: string;
    /**
     * The region the table is located in.
     */
    region: string;
    /**
     * The credentials to use when connecting to the table.
     */
    credentials?: AWSCredentialsOptions;
    /**
     * The endpoint to interface with.
     */
    endpoint?: string;
}

/**
 * Middleware that implements an DynamoDB based storage provider for a bot.
 *
 * @remarks
 * This example shows the typical creation and configuration pattern:
 *
 * ```JavaScript
 * import { DynamoDBStorage } from '@botbuildercommunity/storage-dynamodb';
 *
 * const dynamoDBStorage = new DynamoDBStorage({tableName: 'table-name', region: 'us-east-1'});
 *
 * const conversationState = new ConversationState(dynamoDBStorage);
 * const userState = new UserState(dynamoDBStorage);
 * ```
*/
export class DynamoDBStorage implements Storage {
    private readonly tableName: string;
    private readonly region: string;
    private readonly credentials?: AWSCredentialsOptions;
    private readonly endpoint?: string;

    /**
     * Creates a new DynamoDBStorage instance.
     * @param options the region the DynamoDB table lives in
     * @param endpoint the endpoint to use for interfacing with DynamoDB
     * @param tableName the name of the table
     */
    public constructor(options: DynamoDBStorageOptions) {
        this.tableName = options.tableName;
        this.region = options.region;
        this.credentials = options.credentials;
        this.endpoint = options.endpoint
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
        awsConfig.update({
            region: this.region,
            ...(this.credentials ? {credentials: new AWSCredentials(this.credentials)} : {})
        });
        const documentClientOptions: object = {
            apiVersion: '2012-08-10',
            ...(this.endpoint ? {endpoint: new AWSEndpoint(this.endpoint)} : {})
        }
        return new DocumentClient(documentClientOptions);
    }
}
