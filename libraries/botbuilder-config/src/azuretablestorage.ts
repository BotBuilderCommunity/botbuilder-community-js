import { IAzureTableStorageService, Service } from "./service";

/**
 * @module botbuilder-config
 */

export class AzureTableStorageService extends Service implements IAzureTableStorageService {
    public tableName: string;
    public storageKey: string;
    public storageAccount: string;
    public connectionString: string;
    constructor() {
        super();
    }
}
