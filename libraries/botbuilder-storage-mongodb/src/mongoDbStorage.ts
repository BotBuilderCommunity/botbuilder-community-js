/**
 * @module @botbuildercommunity/storage-mongodb
 */

import { MongoClient, MongoClientOptions, Collection } from 'mongodb';
import { Storage, StoreItems } from 'botbuilder-core';

/**
 * Middleware that implements an MongoDB based storage provider for a bot.
 *
 * @remarks
 * This example shows the typical creation and configuration pattern:
 *
 * ```JavaScript
 * import { MongoDbStorage } from 'botbuilder-storage';
 *
 * const mongoDbStorage = new MongoDbStorage('mongodb://localhost:27017/', 'testDatabase', 'testCollection');
 *
 * const conversationState = new ConversationState(mongoDbStorage);
 * const userState = new UserState(mongoDbStorage);
 * ```
*/
export class MongoDbStorage implements Storage {
    public url: string;
    public db: string;
    public collection: string;
    public mongoOptions: MongoClientOptions;

    /**
     * Creates a new CosmosDbStorage instance.
     * @param connectionUrl Url to connect to your CosmosDB. Ex: 'mongodb://localhost:27017/'
     * @param dbName The name of your database
     * @param collectionName the name of your collection
     * @param options Optional settings to configure the MongoClient. Defaults with: {}
     */
    public constructor(connectionUrl: string, dbName: string, collectionName: string, options?: MongoClientOptions) {
        this.url = connectionUrl;
        this.db = dbName;
        this.collection = collectionName;

        this.mongoOptions = options ? options : {};
    }

    public async read(keys: string[]): Promise<StoreItems> {
        const client = await this.getClient();
        try {
            const col = await this.getCollection(client);

            const data = {};
            await Promise.all(keys.map(async (key: string): Promise<void> => {
                const doc = await col.findOne({ _id: key });
                data[key] = doc ? doc.document : null;
            }));
            return data;
        } finally {
            client.close();
        }
    }

    public async write(changes: StoreItems): Promise<void> {
        const client = await this.getClient();
        try {
            const col = await this.getCollection(client);

            await Promise.all(Object.keys(changes).map(async (key: string): Promise<void> => {
                const changesCopy = { ...changes[key] };
                const documentChange = {
                    _id: key,
                    document: changesCopy
                };
                const eTag = changes[key].eTag;

                if (!eTag || eTag === '*') {
                    await col.updateOne({ _id: key }, { $set: { ...documentChange } }, { upsert: true });
                } else if (eTag.length > 0) {
                    await col.replaceOne({ _id: eTag }, documentChange);
                } else {
                    throw new Error('eTag empty');
                }
            }));
        } finally {
            client.close();
        }
    }

    public async delete(keys: string[]): Promise<void> {
        const client = await this.getClient();
        try {
            const documents = await this.getCollection(client);
            await documents.deleteMany({ _id: { $in: keys } });
        } finally {
            client.close();
        }
    }

    private async getClient(): Promise<MongoClient> {
        try {
            return await MongoClient.connect(this.url, this.mongoOptions);

        } catch (error) {
            throw new Error('Unable to create MongoDB client');
        }
    }

    private async getCollection(client: MongoClient): Promise<Collection> {
        return client.db(this.db).collection(this.collection);
    }
}
