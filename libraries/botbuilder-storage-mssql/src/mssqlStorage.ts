/**
 * @module @botbuildercommunity/storage-mssql
 */

import { Storage, StoreItems } from 'botbuilder-core';
import { config as msconfig, ConnectionPool, NVarChar } from 'mssql';

export class MSSQLStorage implements Storage {
    private _connection: msconfig;
    public dbuser: string;
    public dbpassword: string;
    public dbserver: string;
    public db: string;
    public dbtable: string;

    public constructor(dbuser: string, dbpassword: string, dbserver: string, db: string, dbtable: string) {
        this.dbuser = dbuser;
        this.dbpassword = dbpassword;
        this.dbserver = dbserver;
        this.db = db;
        this.dbtable = dbtable;
        this._connection = {
            user: this.dbuser,
            password: this.dbpassword,
            server: this.dbserver,
            database: this.db
        }
    }

    public async read(keys: string[]): Promise<StoreItems> {
        const pool = await this.getConnectionPool();
        try {
            const result = await pool.request()
                .input("", NVarChar, keys)
                .query(``);
            pool.close();
            return Promise.resolve(result.recordset);
        }
        catch(e) {
            if(pool != null && pool.connected) {
                pool.close();
            }
            return Promise.reject(e);
        }
    }

    public async write(changes: StoreItems): Promise<void> {
    }

    public async delete(keys: string[]): Promise<void> {
    }

    private async getConnectionPool(): Promise<ConnectionPool> {
        try {
            return await new ConnectionPool(this._connection);
        }
        catch(e) {
            console.log(e);
        }
    }
}
