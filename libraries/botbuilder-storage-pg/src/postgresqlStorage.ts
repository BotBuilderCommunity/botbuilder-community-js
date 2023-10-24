import { Storage, StoreItem, StoreItems } from "botbuilder-core";
import { ConnectionConfig as pgconfig, Pool, PoolClient, QueryResult } from "pg";
import { PostgreSQLOptions } from "./schema";

/**
 * @module @botbuilder-community/storage-pg
 */

function getConnectionPool(connection: pgconfig): Pool {
  try {
    return new Pool(connection);
  }
  catch (e) {
    console.error(e);
  }
}

export class PostgreSQLStorage implements Storage {
  private table: string;
  private options: pgconfig;

  public constructor(options: PostgreSQLOptions) {
    this.table = options.table;
    this.options = options;
  }

  public async read(keys: string[]): Promise<StoreItems> {
    if (keys == null || keys.length === 0) {
      return Promise.resolve({});
    }
    const client: PoolClient = await this.getConnectionPool(this.options).connect();
    try {

      const result: QueryResult<any> = await client.query(`SELECT id, data FROM ${this.table} WHERE id in ('${keys.join('\',\'')}')`);

      const res: StoreItem = result.rows.reduce((storeItem: StoreItem, record: any): StoreItem => {
        storeItem[record.id] = record.data;
        return storeItem;
      }, {});

      client.release();

      return Promise.resolve(res);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async write(changes: StoreItems): Promise<void> {
    if (changes == null || Object.keys(changes).length === 0) {
      return Promise.resolve(null);
    }
    const client: PoolClient = await this.getConnectionPool(this.options).connect();
    const keys = Object.keys(changes);
    try {
      for (const key of keys) {
        try {
          const context = JSON.stringify(changes[key]);
          await client.query({
            text: `INSERT INTO ${this.table} (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2;`,
            values: [key, context]
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }

      client.release();

      return Promise.resolve(null);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async delete(keys: string[]): Promise<void> {
    if (keys == null || keys.length === 0) {
      return Promise.resolve(null);
    }
    const client: PoolClient = await this.getConnectionPool(this.options).connect();
    try {
      await client.query(`DELETE FROM ${this.table} WHERE id in ('${keys.join('\',\'')}')`);
      client.release();

      return Promise.resolve(null);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private getConnectionPool(connection: pgconfig): Pool {
    try {
      return getConnectionPool(connection);
    }
    catch (e) {
      console.error(e);
    }
  }
};
