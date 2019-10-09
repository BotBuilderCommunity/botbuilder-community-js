import { Storage, StoreItem, StoreItems } from 'botbuilder-core';
import { config as msconfig, ConnectionPool, NVarChar, IResult } from 'mssql';
import { MSSQLOptions } from './schema';

/**
 * @module @botbuildercommunity/storage-mssql
 */

function getConnectionPool(connection: msconfig): ConnectionPool {
    try {
        return new ConnectionPool(connection);
    }
    catch(e) {
        console.error(e);
    }
}

export class MSSQLStorage implements Storage {
    private table: string;
    private options: msconfig;
    public constructor(options: MSSQLOptions) {
        this.table = options.table;
        this.options = options;
    }
    public async read(keys: string[]): Promise<StoreItems> {
        if(keys == null || keys.length === 0) {
            return Promise.resolve({});
        }
        const pool = await this.getConnectionPool(this.options).connect();
        try {
            /*
             * According to the package documentation (https://www.npmjs.com/package/mssql), all ES6 tagged template
             * literals are automatically sanitized against SQL injection.
             */
            const result: IResult<any> = await pool.request()
                .query(`SELECT
                            id,
                            data
                        FROM ${ this.table }
                        WHERE id in ('${ keys.join('\',\'') }')`);
            const res = result.recordset.reduce((storeItem: StoreItem, record: any): StoreItem => {
                storeItem[record.id] = JSON.parse(record.data);
                return storeItem;
            }, { });
            return Promise.resolve(res);
        }
        catch(e) {
            return Promise.reject(e);
        }
    }

    public async write(changes: StoreItems): Promise<void> {
        if (changes == null || Object.keys(changes).length === 0) {
            return Promise.resolve(null);
        }
        const pool = await this.getConnectionPool(this.options).connect();
        const keys = Object.keys(changes);
        for (const key of keys) {
            try {
                await pool.request()
                    .input('Key', NVarChar, key)
                    .input('Data', NVarChar, JSON.stringify(changes[key]))
                    .query(`IF EXISTS(
                            SELECT
                                id
                                FROM ${ this.table }
                                WHERE id = @Key
                        )
                        BEGIN
                            UPDATE
                                ${ this.table }
                                SET data = @Data
                                WHERE id = @Key;
                        END
                        ELSE
                        BEGIN
                            INSERT
                                INTO ${ this.table }
                                (id, data)
                            VALUES
                                (@Key, @Data);
                        END
                    `);
            }
            catch(e) {
                return Promise.reject(e);
            }
        }
        return Promise.resolve(null);
    }
    public async delete(keys: string[]): Promise<void> {
        if(keys == null || keys.length === 0) {
            return Promise.resolve(null);
        }
        const pool = await this.getConnectionPool(this.options).connect();
        try {
            /*
             * According to the package documentation (https://www.npmjs.com/package/mssql), all ES6 tagged template
             * literals are automatically sanitized against SQL injection.
             */
            await pool.request()
                .query(`DELETE
                            FROM ${ this.table }
                        WHERE id in ('${ keys.join('\',\'') }')`);
            return Promise.resolve(null);
        }
        catch(e) {
            return Promise.reject(e);
        }
    }
    private getConnectionPool(connection: msconfig): ConnectionPool {
        try {
            return getConnectionPool(connection);
        }
        catch(e) {
            console.error(e);
        }
    }
}
