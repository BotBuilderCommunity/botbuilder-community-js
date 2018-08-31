import { IAzureTableStorageService, Service } from "./service";
import { TableStorageSettings } from "botbuilder-azure";

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
    public getOptions(): TableStorageSettings {
        return null;
    }
}
