/**
 * @module @botbuildercommunity/storage-azure-table
 */
/**
 * Initial code copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems, StoreItem } from "botbuilder";
import * as azure from "azure-storage";
import { flatten, unflatten } from "flat";
import { Host } from "botbuilder-azure";

const EntityGenerator = azure.TableUtilities.entityGenerator;

/**
 * Additional settings for configuring an instance of `TableStorage`.
 */
export interface TableStorageSettings {
    /**
     * Name of the table to use for storage.
     *
     * @remarks
     * Check table name rules: https://docs.microsoft.com/en-us/rest/api/storageservices/Understanding-the-Table-Service-Data-Model?redirectedfrom=MSDN#table-names
    */
    tableName: string;

    /** (Optional) storage access key. */
    storageAccessKey?: string;

    /** (Optional) storage account to use or connection string. */
    storageAccountOrConnectionString?: string;

    /** (Optional) azure storage host. */
    host?: Host;
}

/**
 * @private
 * Map of already initialized tables. Key = tableName, Value = Promise with TableResult creation.
 */
const checkedTables: { [name: string]: Promise<azure.TableService.TableResult>; } = {};

/**
 * Middleware that implements an Azure Table based storage provider for a bot.
 *
 * @remarks
 * This example shows the typical creation and configuration pattern:
 *
 * ```JavaScript
 * const { TableStorage } = require('botbuilder-azure');
 *
 * const storage = new TableStorage({
 *     storageAccountOrConnectionString: 'UseDevelopmentStorage=true',
 *     tableName: 'mybotstate'
 * });
 * ```
*/
export class TableStorage implements Storage {
    private settings: TableStorageSettings;
    private tableService: TableServiceAsync;

    /**
     * Creates a new TableStorage instance.
     * @param settings Setting required to configure the provider.
     */
    public constructor(settings: TableStorageSettings) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }

        // https://docs.microsoft.com/en-us/rest/api/storageservices/Understanding-the-Table-Service-Data-Model?redirectedfrom=MSDN#table-names
        if (!/^[A-Za-z][A-Za-z0-9]{2,62}$/.test(settings.tableName)) {
            throw new Error('The table name contains invalid characters.')
        }

        this.settings = Object.assign({}, settings);
        this.tableService = this.createTableService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host);
    }

    /** Ensure the table is created. */
    public ensureTable(): Promise<azure.TableService.TableResult> {
        if (!checkedTables[this.settings.tableName]) {
            try {
                checkedTables[this.settings.tableName] = this.tableService.createTableIfNotExistsAsync(this.settings.tableName);
            }
            catch(e) {
                console.log(e);
            }
        }
        return checkedTables[this.settings.tableName];
    }

    /** Delete backing table (mostly used for unit testing.) */
    public deleteTable(): Promise<boolean> {
        if (checkedTables[this.settings.tableName]) {
            delete checkedTables[this.settings.tableName];
        }
        return this.tableService.deleteTableIfExistsAsync(this.settings.tableName);
    }

    public read(keys: string[]): Promise<StoreItems> {
        if (!keys) {
            throw new Error('Please provide at least one key to read from storage.');
        }

        const sanitizedKeys: string[] = keys.filter((k: string) => k).map((key: string) => sanitizeKey(key));

        return this.ensureTable().then((container: azure.TableService.TableResult) => {
            return new Promise<StoreItems>((resolve: any, reject: any): void => {
                Promise.all<StoreItem>(sanitizedKeys.map((key: string) => {
                    return this.tableService.doesTableExistAsync(this.settings.tableName).then((tableResult: azure.TableService.TableResult) => {
                        if (tableResult.exists) {
                            return this.tableService.retrieveEntityAsync<any>(this.settings.tableName, key, '', { entityResolver: entityResolver })
                            .then(result => {
                                let value = unflatten(result, flattenOptions);
                                value.eTag = value['.metadata'].etag;

                                // remove TableRow Properties from storeItem
                                ['PartitionKey', 'RowKey', '.metadata'].forEach(k => delete value[k]);

                                return { key, value };
                            }).catch(handleNotFoundWith({ key, value: null }));
                        } else {
                            // If blob does not exist, return an empty StoreItem.
                            return { } as StoreItem;
                        }
                    });
                })).then((items: StoreItem[]) => {
                    if (items !== null && items.length > 0) {
                        const storeItems: StoreItems = items.filter(prop => (<any>prop).value !== null)
                            .map((propValue: { key, value }) => ({...propValue, key: unSanitizeKey(propValue.key)}))
                            .reduce(propsReducer, {});
                        resolve(storeItems);
                    }
                }).catch((error: Error) => { reject(error); });
            });
        }).catch((error: Error) => { throw error; });
    }

    public write(changes: StoreItems): Promise<void> {
        if (!changes) {
            throw new Error('Please provide a StoreItems with changes to persist.')
        }

        // Check for bogus etags
        Object.keys(changes).map(key => {
            let eTag = changes[key].eTag;
            if (eTag != null && eTag.trim() === "") {
                throw new Error('Etag empty for key ' + key);
            }
        });

        return this.ensureTable().then(() => {
            var writes = Object.keys(changes).map(key => {
                let storeItem: StoreItem = changes[key];

                // flatten the object graph into single columns
                let flat = flatten(storeItem, flattenOptions);
                let entity = asEntityDescriptor(flat);
                delete entity.eTag;

                // add PK/RK and ETag
                let pk = sanitizeKey(key);
                entity.PartitionKey = EntityGenerator.String(pk);
                entity.RowKey = EntityGenerator.String('');
                entity['.metadata'] = { etag: storeItem.eTag };

                if (storeItem.eTag == null || storeItem.eTag === "*") {
                    // if new item or * then insert or replace unconditionaly
                    return this.tableService.insertOrReplaceEntityAsync(this.settings.tableName, entity);
                }
                else if (storeItem.eTag.length > 0) {
                    // if we have an etag, do opt. concurrency replace
                    return this.tableService.replaceEntityAsync(this.settings.tableName, entity);
                }
            });

            return Promise.all(writes)
                .then(() => { }).catch(err => console.log(err));            // void
        }).catch(e => console.log(e));
    };

    public delete(keys: string[]): Promise<void> {
        if (!keys || !keys.length) return Promise.resolve();

        return this.ensureTable().then(() => {
            let deletes = keys.map(key => {
                let pk = sanitizeKey(key);
                let entity = {
                    PartitionKey: EntityGenerator.String(pk),
                    RowKey: EntityGenerator.String('')
                };
                entity['.metadata'] = { etag: '*' };

                return this.tableService
                    .deleteEntityAsync(this.settings.tableName, entity)
                    .catch(handleNotFoundWith(null));
            });

            return Promise.all(deletes)
                .then(() => { }).catch(err => console.log(err));            // void
        }).catch(e => console.log(e));
    }

    // create TableServiceAsync instance based on connection config
    private createTableService(storageAccountOrConnectionString: string, storageAccessKey: string, host: any): TableServiceAsync {
        const tableService = storageAccountOrConnectionString ? azure.createTableService(storageAccountOrConnectionString, storageAccessKey, host) : azure.createTableService();

        // create TableServiceAsync by using denodeify to create promise wrappers around cb functions
        return {
            createTableIfNotExistsAsync: this.denodeify(tableService, tableService.createTableIfNotExists),
            deleteTableIfExistsAsync: this.denodeify(tableService, tableService.deleteTableIfExists),
            retrieveEntityAsync: this.denodeify(tableService, tableService.retrieveEntity),
            doesTableExistAsync: this.denodeify(tableService, tableService.doesTableExist),
            insertOrReplaceEntityAsync: this.denodeify(tableService, tableService.insertOrReplaceEntity),
            replaceEntityAsync: this.denodeify(tableService, tableService.replaceEntity),
            deleteEntityAsync: this.denodeify(tableService, tableService.deleteEntity)
        } as any;
    }

    // turn a cb based azure method into a Promisified one
    private denodeify<T>(thisArg: any, fn: Function): (...args: any[]) => Promise<T> {
        return (...args: any[]) => {
            return new Promise<T>((resolve, reject) => {
                args.push((error: Error, result: any) => (error) ? reject(error) : resolve(result));
                fn.apply(thisArg, args);
            });
        };
    }
}

/**
 * @private
 * Promise based methods created using denodeify function
 */
interface TableServiceAsync extends azure.TableService {
    createTableIfNotExistsAsync(table: string): Promise<azure.TableService.TableResult>;
    deleteTableIfExistsAsync(table: string): Promise<boolean>;
    retrieveEntityAsync<T>(table: string, partitionKey: string, rowKey: string, options: any): Promise<T>;
    doesTableExistAsync(table: string): Promise<azure.TableService.TableResult>;
    replaceEntityAsync<T>(table: string, entityDescriptor: T): Promise<azure.TableService.EntityMetadata>;
    insertOrReplaceEntityAsync<T>(table: string, entityDescriptor: T): Promise<azure.TableService.EntityMetadata>;
    deleteEntityAsync<T>(table: string, entityDescriptor: T): Promise<void>;
}

/**
 * @private
 * Handle service 404 and 204 responses as null returns, throw any other error
 */
const handleNotFoundWith = (defaultValue: any) => (error) => {
    // return defaultValue when not found or no content
    if (error.statusCode === 404 || error.statusCode === 204)
        return defaultValue;
    else
        throw error;
};

/**
 * @private
 * Convert an object into EDM types
 */
const asEntityDescriptor = (obj): any => {
    return Object.keys(obj)
        .map(key => ({
            key,
            value: asEntityProperty(obj[key])
        })).reduce(propsReducer, {});
};

/**
 * @private
 */
const asEntityProperty = (value) => {
    switch (getTypeOf(value)) {
        case 'date': return EntityGenerator.DateTime(value);
        case 'boolean': return EntityGenerator.Boolean(value);
        case 'number':
            let maxSafeInt32 = Math.pow(2, 32) - 1;
            if (isFloat(value)) return EntityGenerator.Double(value);
            if (Math.abs(value) > maxSafeInt32) return EntityGenerator.Int64(value);
            return EntityGenerator.Int32(value);
        case 'string':
        default:
            return EntityGenerator.String(value);
    }
};

/**
 * @private
 */
const getTypeOf = (obj) =>
    ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

/**
 * @private
 */
const isFloat = (n) => Number(n) === n && n % 1 !== 0;

/**
 * @private
 * Convert EDM types back to an JS object
 */
const entityResolver = (entity) => {
    return Object.keys(entity)
        .map(key => ({ key, value: getEdmValue(entity[key]) }))
        .reduce(propsReducer, {});
};

/**
 * @private
 */
const getEdmValue = (entityValue) => {
    return entityValue.$ === azure.TableUtilities.EdmType.INT64
        ? Number(entityValue._)
        : entityValue._;
}

/**
 * @private
 * Reduces pairs for key/value into an object (e.g.: StoreItems)
 */
const propsReducer = (resolved, propValue: { key, value }): any => {
    resolved[propValue.key] = propValue.value;
    return resolved;
};

/**
 * Generate list of chars to replace
 */
const charToSanitizeList = [
    {
        char: '?',
        value: '%' + '?'.charCodeAt(0).toString(16),
        regexp: /\?/g,
    },
    {
        char: '/',
        value: '%' + '/'.charCodeAt(0).toString(16),
        regexp: /\//g,
    },
    {
        char: '#',
        value: '%' + '#'.charCodeAt(0).toString(16),
        regexp: /#/g,
    },
    {
        char: '\t',
        value: '%' + '\t'.charCodeAt(0).toString(16),
        regexp: /\t/g,
    },
    {
        char: '\n',
        value: '%' + '\n'.charCodeAt(0).toString(16),
        regexp: /\n/g,
    },
    {
        char: '\r',
        value: '%' + '\r'.charCodeAt(0).toString(16),
        regexp: /\r/g,
    },
    {
        char: '\\',
        value: '%' + '\\'.charCodeAt(0).toString(16),
        regexp: /\\/g,
    },
];

/**
 * @private
 * Sanitize key
 */
const sanitizeKey = (key: string): string => {
    let sb = key;
    charToSanitizeList.forEach((charInfo) => {
        sb = sb.replace(charInfo.regexp, charInfo.value);
    });
    return sb;
}

/**
 * @private
 * UnSanitize Key
 */
const unSanitizeKey = (key: string): string => {
    let result = key;
    charToSanitizeList.forEach((charInfo) => {
        result = result.replace(new RegExp(charInfo.value, 'g'), charInfo.char);
    });
    return result;
}

/**
 * @private
 * flat/flatten options to use '_' as delimiter (same as C#'s TableEntity.Flatten default delimiter)
 */
const flattenOptions = {
    delimiter: '_'
};
