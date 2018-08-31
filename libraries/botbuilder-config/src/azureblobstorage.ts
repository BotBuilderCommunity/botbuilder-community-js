import { IAzureBlobStorageService, Service } from "./service";
import { BlobStorageSettings } from "botbuilder-azure";

/**
 * @module botbuilder-config
 */

export class AzureBlobStorageService extends Service implements IAzureBlobStorageService {
    public container: string;
    public storageKey: string;
    public storageAccount: string;
    public connectionString: string;
    constructor() {
        super();
    }
    public getOptions(): BlobStorageSettings {
        return null;
    }
}
