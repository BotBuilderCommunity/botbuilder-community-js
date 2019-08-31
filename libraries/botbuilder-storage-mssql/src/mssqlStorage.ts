/**
 * @module @botbuildercommunity/storage-mssql
 */

import { Storage, StoreItems } from 'botbuilder-core';

export class MSSQLStorage implements Storage {
    public connectionString: string;
    public databaseName: string;
    public tableName: string;
    public options: any;

    public constructor(connectionString: string, databaseName: string, tableName: string, options?: any) {
        this.connectionString = connectionString;
        this.databaseName = databaseName;
        this.tableName = tableName;
        this.options = (options !== undefined) ? options : null;
    }

    public async read(keys: string[]): Promise<StoreItems> {
    }

    public async write(changes: StoreItems): Promise<void> {
    }

    public async delete(keys: string[]): Promise<void> {
    }

    private async getConnection(): Promise<T> {
    }
}
