import { Storage, StoreItem, StoreItems } from 'botbuilder-core';
import { config as msconfig, ConnectionPool, NVarChar, IResult, Int } from 'mssql';
import { MSSQLOptions } from './schema';

/**
 * @module @botbuildercommunity/storage-mssql
 */

function getConnectionPool(connection): ConnectionPool {
    try {
        return new ConnectionPool(connection);
    }
    catch(e) {
        console.error(e);
    }
}

export class MSSQLStorage implements Storage {
    private options: MSSQLOptions;
    private connection: msconfig;
    public constructor(options: MSSQLOptions) {
        this.options = options;
        this.connection = {
            user: options.dbuser,
            password: options.dbpassword,
            server: options.dbserver,
            database: options.db
        };
    }
    public async read(keys: string[]): Promise<StoreItems> { //Should this be an array of numbers?
        if(keys == null || keys.length === 0) {
            return Promise.resolve({});
        }
        const pool = await getConnectionPool(this.connection).connect();
        try {
            const result: IResult<any> = await pool.request()
                .query(`SELECT
                            id,
                            data
                        FROM ${ this.options.dbtable }
                        WHERE id in (${ keys.join(',') })`); //Need to sanitize this.
            const res = result.recordset.reduce((acc: StoreItem, record: any): StoreItem => {
                acc[record.id] = acc[record.data];
                return acc;
            }, { });
            return Promise.resolve(res);
        }
        catch(e) {
            return Promise.reject(e);
        }
    }

    public async write(changes: StoreItems): Promise<void> {
        if (changes == null || changes[0] == null) {
            return Promise.resolve(null);
        }
        const pool = await getConnectionPool(this.connection).connect();
        const keys = Object.keys(changes);
        keys.forEach(async (key: string): Promise<void> => {
            try {
                await pool.request()
                    .input('Key', Int, key)
                    .input('Data', NVarChar, JSON.stringify(changes[key]))
                    .query(`IF EXISTS(
                            UPDATE
                                ${ this.options.dbtable }
                                SET data = @Data
                                WHERE id = @Key;
                        )
                        BEGIN
                            
                        END
                        ELSE
                        BEGIN
                            INSERT
                                INTO ${ this.options.dbtable }
                                (id, data)
                            VALUES
                                (@Key, @Data);
                        END
                    `);
            }
            catch(e) {
                return Promise.reject(e);
            }
        });
        return Promise.resolve(null);
    }
    public async delete(keys: string[]): Promise<void> {
        if(keys == null || keys.length === 0) {
            return Promise.resolve(null);
        }
        const pool = await getConnectionPool(this.connection).connect();
        try {
            await pool.request()
                .query(`DELETE
                            FROM ${ this.options.dbtable }
                        WHERE id in (${ keys.join(',') })`); //Need to sanitize this.
            return Promise.resolve(null);
        }
        catch(e) {
            return Promise.reject(e);
        }
    }
}
